import { createHash } from "crypto";
import { createReadStream } from "fs";
import { resolve, join } from "path";
import { TiddlerFields } from "tiddlywiki";
import { TiddlerStore_PrismaTransaction } from "./TiddlerStore";
import { ServerRequest } from "@tiddlywiki/server";
import { readFile } from "fs/promises";
import { SendError } from "@tiddlywiki/server";

/** Basically a bunch of methods to help with wiki routes. */
export class WikiStateStore extends TiddlerStore_PrismaTransaction {
  constructor(
    protected state: ServerRequest<any, any>,
    prisma: PrismaTxnClient
  ) {
    super(prisma);
  }



  async serveIndexFile(recipe_name: PrismaField<"Recipes", "recipe_name">) {
    const state = this.state;

    // Check request is valid
    if (!recipe_name) {
      throw new SendError("RECIPE_NOT_FOUND", 404, { recipeName: recipe_name });
    }

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
      include: {
        recipe_bags: {
          select: {
            position: true,
            bag: {
              select: {
                bag_id: true,
                bag_name: true,
              }
            }
          },
        }
      }
    });

    // Check request is valid
    if (!recipe) {
      return state.sendEmpty(404);
    }

    const { enableExternalPlugins } = state.config;

    const { cachePath, pluginFiles, pluginHashes, requiredPlugins } = state.pluginCache;

    const { custom_wiki, preload_store } = recipe;

    const plugins = [
      ...new Set([
        ...(!recipe.skip_core) ? ["$:/core"] : [],
        ...(!recipe.skip_required_plugins) ? requiredPlugins : [],
        ...recipe.plugin_names,
      ]).values()
    ];

    plugins.forEach(e => {
      if (!state.pluginCache.pluginFiles.has(e))
        console.log(`Recipe ${recipe_name} uses unknown plugin ${e}`);
    });

    // using early hints actually helps stale-while-revalidate
    // we could also use the hash in the url


    if (enableExternalPlugins) {
      state.writeEarlyHints({
        'link': plugins.map(e => {
          const plugin = pluginFiles.get(e);
          return `<${state.pathPrefix}/$cache/${plugin}/plugin.js>; rel=preload; as=script`
        }),
        // 'x-trace-id': 'id for diagnostics',
      });
    }


    const [
      lastTiddlerId,
      template
    ] = await Promise.all([
      this.prisma.tiddlers.aggregate({
        _max: { revision_id: true },
        where: { bag_id: { in: recipe.recipe_bags.map(e => e.bag.bag_id) } }
      }),
      custom_wiki ? Promise.resolve(custom_wiki) : readFile(resolve(state.config.cachePath, "tiddlywiki5.html"), "utf8")
    ]);

    const hash = createHash('md5');
    // Put everything into the hash that could change and invalidate the page
    // the rendered template
    hash.update(template);
    // the bag names
    hash.update(recipe.recipe_bags.map(e => e.bag.bag_name).join(","));
    // the plugin hashes
    hash.update(plugins.map(e => pluginHashes.get(e) ?? "").join(","));
    // the latest tiddler id in those bags
    hash.update(`${lastTiddlerId._max.revision_id}`);
    const contentDigest = hash.digest("hex");

    const newEtag = `"${contentDigest}"`;
    const match = false && state.headers.get("if-none-match")?.has(newEtag);

    const headers: Record<string, string> = {};
    headers["content-type"] = "text/html";
    headers["etag"] = newEtag;
    headers["cache-control"] = "max-age=0, private, no-cache";

    // headers['content-security-policy'] = [
    //   // This header should prevent any external data from being pulled into the page 
    //   // via fetch XHR, src tags, CSS includes, etc. 
    //   "default-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' data: blob:",
    //   // this blocks any kind of form submissions from happening. 
    //   "form-action 'none'",
    // ].join("; ");
    state.writeHead(match ? 304 : 200, headers);

    if (state.method === "HEAD" || match) return state.end();

    // it is recommended to add <link rel="preload" to the header since these cannot be deferred
    // <link rel="preload" href="main.js" as="script" />
    // and recommended to specify the hashes for each file in their script tag. 
    // <script
    //   src="https://example.com/example-framework.js"
    //   integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
    //   crossorigin="anonymous"></script>
    // this needs to be added to the tiddlywiki file before the script tags
    // $tw = Object.create(null);
    // $tw.preloadTiddlers = $tw.preloadTiddlers || [];
    // $tw.preloadTiddler = function(fields) {
    //   $tw.preloadTiddlers.push(fields);
    // };
    const headPos = template.indexOf("</head>");
    if (headPos === -1) {
      throw new Error(`Cannot find </head> in ${custom_wiki ? "custom wiki" : "template"} for recipe ${recipe_name}`);
    }
    await state.write(template.substring(0, headPos));

    if (enableExternalPlugins) {
      await state.write("\n" + plugins.map(e => {
        const plugin = pluginFiles.get(e)!;
        const hash = pluginHashes.get(e)!;
        return `<link rel="preload" href="${state.pathPrefix}/$cache/${plugin}/plugin.js" `
          + `as="script" integrity="${hash}" crossorigin="anonymous" />`;
      }).join("\n") + "\n");
    }

    if (enableExternalPlugins || preload_store) {
      await state.write(`
<script>
window.$tw = window.$tw || Object.create(null);
$tw.preloadTiddlers = $tw.preloadTiddlers || [];
$tw.preloadTiddler = function(fields) {
  $tw.preloadTiddlers.push(fields);
};
</script>
`);
    }



    if (preload_store) {
      if (enableExternalPlugins) {

        await state.write(plugins.map(e => {
          const plugin = pluginFiles.get(e)!;
          const hash = pluginHashes.get(e)!;
          return `<script src="${state.pathPrefix}/$cache/${plugin}/plugin.js" `
            + `integrity="${hash}" crossorigin="anonymous"></script>`;
        }).join("\n") + "\n");

      }

      state.writeFast(`<script>$tw.preloadTiddlers.push(`);

      if (!enableExternalPlugins) {
        const fileStreams = plugins.map(e => createReadStream(join(cachePath, pluginFiles.get(e)!, "plugin.json")));

        for (let i = 0; i < fileStreams.length; i++) {
          state.writeFast("\n");
          await state.pipeFrom(fileStreams[i]!);
          state.writeFast(",");
        }

      }

      await this.writeStoreTiddlers(state, recipe, recipe_name);

      state.writeFast(");</script>\n");

      await state.write(template.substring(headPos));

    } else {

      if (enableExternalPlugins) {

        await state.write(plugins.map(e => {
          const plugin = pluginFiles.get(e)!;
          const hash = pluginHashes.get(e)!;
          return `<script src="${state.pathPrefix}/$cache/${plugin}/plugin.js" `
            + `integrity="${hash}" crossorigin="anonymous"></script>`;
        }).join("\n") + "\n");

      }

      // Splice in our tiddlers
      const marker = `<script class="tiddlywiki-tiddler-store" type="application/json">[`;
      const markerPos = template.indexOf(marker);
      if (markerPos === -1) {
        throw new Error("Cannot find tiddler store in template");
      }
      await state.write(template.substring(headPos, markerPos));

      await state.write(marker);

      if (!enableExternalPlugins) {

        const fileStreams = plugins.map(e => createReadStream(join(cachePath, pluginFiles.get(e)!, "plugin.json")));

        for (let i = 0; i < fileStreams.length; i++) {
          state.writeFast("\n");
          await state.pipeFrom(fileStreams[i]!);
          state.writeFast(",");
        }

      }

      await this.writeStoreTiddlers(state, recipe, recipe_name);

      await state.write(template.substring(markerPos + marker.length));
    }




    // await writeTiddler({
    //   title: "$:/state/multiwikiclient/gzip-stream",
    //   text: "yes"
    // })

    // Finish response
    return state.end();

  }


  private async writeStoreTiddlers(state: ServerRequest<"string" | "stream" | "json" | "buffer" | "www-form-urlencoded" | "www-form-urlencoded-urlsearchparams" | "ignore", string, unknown>, recipe: { recipe_bags: { position: number & { __prisma_table: "Recipe_bags"; __prisma_field: "position"; }; bag: { bag_id: string & { __prisma_table: "Bags"; __prisma_field: "bag_id"; }; bag_name: string & { __prisma_table: "Bags"; __prisma_field: "bag_name"; }; }; }[]; } & { recipe_id: string & { __prisma_table: "Recipes"; __prisma_field: "recipe_id"; }; recipe_name: string & { __prisma_table: "Recipes"; __prisma_field: "recipe_name"; }; description: string & { __prisma_table: "Recipes"; __prisma_field: "description"; }; owner_id: PrismaField<"Recipes", "owner_id">; plugin_names: PrismaJson.Recipes_plugin_names & { __prisma_table: "Recipes"; __prisma_field: "plugin_names"; }; skip_required_plugins: PrismaField<"Recipes", "skip_required_plugins">; skip_core: PrismaField<"Recipes", "skip_core">; preload_store: PrismaField<"Recipes", "preload_store">; custom_wiki: PrismaField<"Recipes", "custom_wiki">; }, recipe_name: string & { __prisma_table: "Recipes"; __prisma_field: "recipe_name"; }) {
    async function writeTiddler(tiddlerFields: Record<string, string>) {
      await state.write(JSON.stringify(tiddlerFields).replace(/</g, "\\u003c") + ",\n");
    }

    const bagOrder = new Map(recipe.recipe_bags.map(e => [e.bag.bag_id, e.position]));
    const bagIDs = recipe.recipe_bags.filter(e => !state.pluginCache.pluginFiles.has(e.bag.bag_name)).map(e => e.bag.bag_id);
    await this.serveStoreTiddlers(bagIDs, bagOrder, recipe_name, state.pathPrefix, state.config.enableDevServer, writeTiddler);
  }

  private async serveStoreTiddlers(
    bagKeys: string[],
    bagOrder: Map<string, number>,
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    pathPrefix: string,
    enableDevServer: boolean,
    writeTiddler: (tiddlerFields: Record<string, string>) => Promise<void>
  ) {
    // NOTES: 
    // there is no point in using Prisma's distinct option, as it happens in memory.
    // we also cannot use orderBy across a oneToMany relationship

    const bagTiddlers = await this.prisma.bags.findMany({
      where: { bag_id: { in: bagKeys } },
      select: {
        bag_id: true,
        bag_name: true,
        description: true,
        owner_id: true,
        tiddlers: {
          select: {
            title: true,
            revision_id: true,
            is_deleted: true,
            attachment_hash: true,
            fields: true,
          },
          where: {
            is_deleted: false,
          },
        }
      }
    });

    if (!bagTiddlers.every(e => bagOrder.has(e.bag_id))) {
      console.log(bagTiddlers.map(e => e.bag_id));
      console.log(bagOrder);
      throw new Error("Bags missing from bag order");
    }

    bagTiddlers.sort((a, b) => bagOrder.get(b.bag_id)! - bagOrder.get(a.bag_id)!);
    // this determines which bag takes precedence
    // Map overwrites earlier entries with later entries,
    // so the topmost bag comes last, i.e. the position numbers are in descending order.
    const recipeTiddlers = Array.from(new Map(bagTiddlers.flatMap(bag =>
      bag.tiddlers.map(tiddler => [tiddler.title, { bag, tiddler }])
    )).values());

    const
      bagInfo: Record<string, string> = {}, revisionInfo: Record<string, string> = {};

    for (const recipeTiddlerInfo of recipeTiddlers) {

      const { title, revision_id, attachment_hash, fields } = recipeTiddlerInfo.tiddler;
      const { bag_name } = recipeTiddlerInfo.bag;

      const tiddler = Object.fromEntries([
        ...fields.map(e => [e.field_name, e.field_value] as const),
        ["title", title]
      ]) as {
        title: string;
        [K: string]: string;
      };

      bagInfo[title] = bag_name;
      revisionInfo[title] = revision_id.toString();
      await writeTiddler(tiddler);
    }

    const last_revision_id = Object.values(revisionInfo).reduce((n, e) => n > e ? n : e, "");

    await writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/bag",
      text: JSON.stringify(bagInfo),
      type: "application/json"
    });
    await writeTiddler({
      title: "$:/state/multiwikiclient/tiddlers/revision",
      text: JSON.stringify(revisionInfo),
      type: "application/json"
    });
    await writeTiddler({
      title: "$:/state/multiwikiclient/recipe/last_revision_id",
      text: last_revision_id
    });

    await writeTiddler({
      title: "$:/config/multiwikiclient/recipe",
      text: recipe_name
    });



    await writeTiddler({
      title: "$:/config/multiwikiclient/host",
      text: "$protocol$//$host$" + pathPrefix + "/",
    });

    if (enableDevServer)
      await writeTiddler({
        title: "$:/state/multiwikiclient/dev-mode",
        text: "yes"
      });

  }

  async serveBagTiddler(
    bag_id: PrismaField<"Bags", "bag_id">,
    bag_name: PrismaField<"Bags", "bag_name">,
    title: PrismaField<"Tiddlers", "title">
  ) {
    const { state, prisma } = this;

    const tiddler = await prisma.tiddlers.findUnique({
      where: { bag_id_title: { bag_id, title } },
      include: { fields: true }
    })

    if (!tiddler) return state.sendEmpty(404, { "x-reason": "tiddler not found" });

    const result = getTiddlerFields(title, tiddler.fields);

    const accept_json = state.headers.get("accept")?.has("application/json");
    const accept_mws_tiddler = state.headers.get("accept")?.has("application/x-mws-tiddler");

    // If application/json is requested then this is an API request, and gets the response in JSON
    if (accept_json || accept_mws_tiddler) {

      const type = accept_mws_tiddler ? "application/x-mws-tiddler"
        : accept_json ? "application/json"
          : undefined;

      if (!type) throw new Error("undefined type");

      return state.sendString(200, {
        "Etag": state.makeTiddlerEtag({
          bag_name,
          revision_id: tiddler.revision_id,
        }),
        "Content-Type": type,
        "X-Revision-Number": tiddler.revision_id,
        "X-Bag-Name": bag_name,
      }, formatTiddlerFields(result, type), "utf8");

    } else {

      // This is not a JSON API request, we should return the raw tiddler content

      const type = state.config.getContentType(result.type);

      return state.sendString(200, {
        "Etag": state.makeTiddlerEtag({
          bag_name,
          revision_id: tiddler.revision_id,
        }),
        "Content-Type": result.type
      }, result.text ?? "", type.encoding as BufferEncoding);

    }
  }


}


function getTiddlerFields(
  title: PrismaField<"Tiddlers", "title">,
  fields: { field_name: string, field_value: string }[]
) {
  return Object.fromEntries([
    ...fields.map(e => [e.field_name, e.field_value] as const),
    ["title", title]
  ]) as TiddlerFields;
};


function formatTiddlerFields(input: TiddlerFields, ctype: "application/x-mws-tiddler" | "application/json") {
  if (ctype === "application/x-mws-tiddler") {
    const body = input.text;
    delete input.text;
    const head = JSON.stringify(input);
    return `${head}\n\n${body}`;
  }

  if (ctype === "application/json") {
    return JSON.stringify(input);
  }

  throw new SendError("TIDDLER_WIRE_FORMAT_UNKNOWN", 403, { contentType: ctype })

}