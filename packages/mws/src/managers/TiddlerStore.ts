import { TiddlerFields } from "tiddlywiki";
import { zod } from "@tiddlywiki/server";
import { SendError } from "@tiddlywiki/server";
import { Tuple } from "@tiddlywiki/utils";

/**
 * 	
  @example

  const store = new TiddlerStore_PrismaBase(this.config.engine);
  await this.config.engine.$transaction(
    store.saveTiddlersFromPath_PrismaArray(...)
  );

  await this.config.engine.$transaction(async (prisma) => {
    const store = new TiddlerStore_PrismaTransaction(prisma);
    // use the store here
  });
 */
export class TiddlerStore_PrismaBase {

  constructor(public prisma: PrismaTxnClient) {

  }

  /*
  Returns null if a bag/recipe name is valid, or a string error message if not
  */
  validateItemName(name: string, allowPrivilegedCharacters: boolean) {
    if (typeof name !== "string") {
      return "Not a valid string";
    }
    if (name.length > 256) {
      return "Too long";
    }
    // Removed ~ from this list temporarily
    if (allowPrivilegedCharacters) {
      if (!(/^[^\s\u00A0\x00-\x1F\x7F`!@#%^&*()+={}\[\];\'\"<>,\\\?]+$/g.test(name))) {
        return "Invalid character(s)";
      }
    } else {
      if (!(/^[^\s\u00A0\x00-\x1F\x7F`!@#$%^&*()+={}\[\];:\'\"<>.,\/\\\?]+$/g.test(name))) {
        return "Invalid character(s)";
      }
    }
    return null;
  }
  /*
  Returns null if the argument is an array of valid bag/recipe names, or a string error message if not
  */
  validateItemNames(names: string[], allowPrivilegedCharacters: boolean) {
    if (!Array.isArray(names)) {
      return "Not a valid array";
    }
    var errors = [];
    for (const name of names) {
      const result = this.validateItemName(name, allowPrivilegedCharacters);
      if (result && errors.indexOf(result) === -1) {
        errors.push(result);
      }
    }
    if (errors.length === 0) {
      return null;
    } else {
      return errors.join("\n");
    }
  }

  upsertRecipe_PrismaArray(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    description: PrismaField<"Recipes", "description">,
    bags: { bag_id: PrismaField<"Bags", "bag_id">, with_acl: PrismaField<"Recipe_bags", "with_acl"> }[],
    plugin_names: string[],
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {

    const validationRecipeName = this.validateItemName(recipe_name, allowPrivilegedCharacters);
    if (validationRecipeName) throw validationRecipeName;
    if (bags.length === 0) throw new SendError("RECIPE_MUST_HAVE_BAGS", 400, { recipeName: recipe_name });

    return Tuple(
      this.prisma.recipes.upsert({
        where: { recipe_name },
        update: { description, recipe_bags: { deleteMany: {} }, plugin_names },
        create: { recipe_name, description, plugin_names },
        select: { recipe_id: true }
      }),
      this.prisma.recipes.update({
        where: { recipe_name },
        data: {
          recipe_bags: {
            create: bags.map(({ bag_id, with_acl }, position) => ({
              bag: { connect: { bag_id } },
              position,
              with_acl
            }))
          }
        }
      })
    );

  }

  upsertBag_PrismaPromise(
    bag_name: PrismaField<"Bags", "bag_name">,
    description: PrismaField<"Bags", "description">,
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {

    const validationBagName = this.validateItemName(bag_name, allowPrivilegedCharacters);
    if (validationBagName) throw validationBagName;

    return this.prisma.bags.upsert({
      where: { bag_name },
      update: { description },
      create: { bag_name, description },
      select: { bag_id: true }
    });

  }

  saveTiddlersFromPath_PrismaArray(
    bag_id: PrismaField<"Bags", "bag_id">,
    tiddlers: TiddlerFields[]
  ) {
    return Tuple(
      this.prisma.tiddlers.deleteMany({
        where: { bag: { bag_id } }
      }),
      ...tiddlers.flatMap(tiddler =>
        this.saveBagTiddlerFields_PrismaArray(tiddler, bag_id, null)
      )
    )
  }

  saveBagTiddlerFields_PrismaArray(
    tiddlerFields: TiddlerFields,
    bag_id: PrismaField<"Bags", "bag_id">,
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">
  ) {

    const { title } = tiddlerFields;
    if (!title) {
      console.error(tiddlerFields);
      throw new Error("Tiddler must have a title");
    }

    if (attachment_hash && tiddlerFields.text)
      throw new Error("Do not set both the attachment_hash and the text field. It should be one or the other.")

    const deletion = this.prisma.tiddlers.deleteMany({
      where: { bag_id, title },
    });

    const fields = Object.entries(tiddlerFields);
    if (!fields.every(e => e.every(f => typeof f === "string")))
      throw new Error("All fields must be saved to the server as strings.")

    const creation = this.prisma.tiddlers.create({
      data: {
        bag: { connect: { bag_id } },
        title,
        is_deleted: false,
        attachment_hash: attachment_hash || null,
        fields: {
          create: fields.map(([field_name, field_value]) => ({ field_name, field_value }))
        }
      },
      include: {
        bag: { select: { bag_id: true, bag_name: true } },
      }
    });

    return Tuple(deletion, creation);

  }

  /**
    Returns {revision_id:} of the delete marker
    */
  deleteBagTiddler_PrismaArray(
    bag_id: PrismaField<"Bags", "bag_id">,
    title: PrismaField<"Tiddlers", "title">,
  ) {
    return Tuple(
      this.prisma.tiddlers.deleteMany({
        where: { bag_id, title },
      }),
      this.prisma.tiddlers.create({
        data: {
          title,
          bag: { connect: { bag_id } },
          is_deleted: true,
          attachment_hash: null,
        },
      })
    );
  }



}


export class TiddlerStore_PrismaTransaction extends TiddlerStore_PrismaBase {
  constructor(public prisma: PrismaTxnClient) {
    super(prisma);
  }

  async saveBagTiddlerFields(
    tiddlerFields: TiddlerFields,
    bag_id: PrismaField<"Bags", "bag_id">,
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">
  ) {

    const [deletion, creation] = this.saveBagTiddlerFields_PrismaArray(
      tiddlerFields, bag_id, attachment_hash
    );
    return await deletion, await creation;
  }

  async deleteBagTiddler(
    bag_id: PrismaField<"Bags", "bag_id">,
    title: PrismaField<"Tiddlers", "title">,
  ) {
    const [deletion, creation] = this.deleteBagTiddler_PrismaArray(bag_id, title);
    return await deletion, await creation;
  }

  /**
  * Get the writable bag for the specified recipe.
  *
  * If title is specified, the tiddler will be included in bag.tiddlers, if it exists.
  *
  * The bag will still be returned even if the tiddler does not exist.
  */
  async getRecipeWritableBag(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    title?: PrismaField<"Tiddlers", "title">
  ) {

    const recipe = await this.prisma.recipes.findUnique({
      where: { recipe_name },
      select: {
        recipe_id: true,
        recipe_bags: {
          where: { position: 0 },
          select: {
            bag: {
              select: {
                bag_id: true, bag_name: true,
                ...title ? {
                  tiddlers: {
                    select: { revision_id: true },
                    where: { title }
                  }
                } : {}
              }
            }
          }
        }
      }
    });

    if (!recipe) throw new SendError("RECIPE_NOT_FOUND", 404, { recipeName: recipe_name });

    // the where clause selects only the bag at position 0, 
    // not to be confused with index zero of the result array!
    const bag = recipe.recipe_bags[0]?.bag;

    if (!bag) throw new SendError("RECIPE_NO_BAG_AT_POSITION_ZERO", 403, { recipeName: recipe_name });

    return bag;
  }

  async getRecipeBagWithTiddler({ recipe_name, title }: {
    recipe_name: string;
    title: string;
  }) {

    return await this.prisma.recipe_bags.findFirst({
      include: { bag: true, recipe: true },
      where: {
        recipe: { recipe_name },
        bag: { tiddlers: { some: { title, is_deleted: false } } }
      },
      orderBy: { position: "asc" }
    });
  }

  async getRecipeBags(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
  ) {
    // In prisma it's easy to get the top bag for a specific title. 
    // To get all titles we basically have to get all bags and manually find the top one. 
    const bags = await this.prisma.recipe_bags.findMany({
      where: { recipe: { recipe_name } },
      select: {
        position: true,
        bag: {
          select: {
            bag_id: true,
            bag_name: true,
          }
        }
      },
    });

    bags.sort((a, b) => a.position - b.position);

    return bags.map(e => ({
      bag_id: e.bag.bag_id,
      bag_name: e.bag.bag_name,
      position: e.position,
    }));

  }


  async getBagTiddlers(
    bag_name: PrismaField<"Bags", "bag_name">,
    options: {
      last_known_revision_id?: PrismaField<"Tiddlers", "revision_id">;
      include_deleted?: boolean;
    } = {}
  ) {

    const bag = await this.getBagTiddlers_PrismaQuery(bag_name, options);
    if (!bag) throw new SendError("BAG_NOT_FOUND", 404, { bagName: bag_name });

    const { success, error, data } = zod.strictObject({
      bag_id: zod.string(),
      bag_name: zod.string(),
      tiddlers: zod.strictObject({
        title: zod.string(),
        revision_id: zod.string(),
        is_deleted: zod.boolean()
      }).array()
    }).safeParse(bag);

    if (!success) {
      console.error("Invalid bag data", bag, error);
      throw new SendError("RESPONSE_INTERCEPTED_BY_CHECKER", 500, null);
    }

    return data;

  }

  getBagTiddlers_PrismaQuery(
    bag_name: PrismaField<"Bags", "bag_name">,
    options: {
      last_known_revision_id?: PrismaField<"Tiddlers", "revision_id">;
      include_deleted?: boolean;
    } = {}
  ) {
    // In prisma it's easy to get the top bag for a specific title. 
    // To get all titles we basically have to get all bags and manually find the top one. 
    const lastid = options.last_known_revision_id;
    const withDeleted = options.include_deleted;
    return this.prisma.bags.findUnique({
      where: { bag_name },
      select: {
        tiddlers: {
          select: {
            title: true,
            revision_id: true,
            is_deleted: true,
          },
          where: {
            is_deleted: withDeleted ? undefined : false,
            revision_id: lastid ? { gt: lastid } : undefined
          },
        },
        bag_id: true,
        bag_name: true,
      }
    });
  }


}
