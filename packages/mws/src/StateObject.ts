import { AllowedMethod, BodyFormat } from "./utils";
import { Prisma } from '@prisma/client';
import { Types } from '@prisma/client/runtime/library';
import { DataChecks } from './utils';
import { ServerState } from "./ServerState";
import { serverEvents, ServerRequest } from "@tiddlywiki/server";
import { setupDevServer } from "./services/setupDevServer";
import { AuthUser, SessionManager } from "@tiddlywiki/auth";

declare module "@tiddlywiki/server" {
  interface ServerRequest<
    B extends BodyFormat = BodyFormat,
    M extends AllowedMethod = AllowedMethod,
    D = unknown
  > extends StateObject {
    config: ServerState;
    asserted: boolean;
    engine: PrismaEngineClient;
    pluginCache: ServerState["pluginCache"];
    sendAdmin: () => ReturnType<Awaited<ReturnType<typeof setupDevServer>>>;
    // this is set in auth.ts
    user: AuthUser;
  }
}

serverEvents.on("request.state", async (router, state, streamer) => {
  state.config = router.config;
  state.engine = router.config.engine;
  state.sendAdmin = () => router.sendAdmin(state);
  state.asserted = false;
  state.pluginCache = router.config.pluginCache;

  Object.setPrototypeOf(state, StateObject.prototype);

});

// this method is annoying, but it does work
// the class doesn't get instantiated directly,
// its prototype just gets set on the request state object
const test: { new(): {} } = ServerRequest as any;

class StateObject extends test {

  declare engine: ServerState["engine"];
  declare user: AuthUser;
  declare config: ServerState;
  declare asserted: boolean;
  declare sendEmpty: ServerRequest["sendEmpty"];

  okUser() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
  }
  okAdmin() {
    if (!this.user.isLoggedIn) throw "User not authenticated";
    if (!this.user.isAdmin) throw "User is not an admin";
  }

  async $transaction<T>(fn: (prisma: PrismaTxnClient) => Promise<T>): Promise<T> {
    if (!this.asserted)
      throw new Error("You must check access before opening a transaction.")
    return await this.engine.$transaction(prisma => fn(prisma as PrismaTxnClient));
  }

  $transactionTuple<P extends Prisma.PrismaPromise<any>[]>(
    arg: (prisma: ServerState["engine"]) => [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel }
  ): Promise<Types.Utils.UnwrapTuple<P>> {
    if (!this.asserted)
      throw new Error("You must check access before opening a transaction.");
    return this.engine.$transaction(arg(this.engine), options);
  }

  makeTiddlerEtag(options: { bag_name: string; revision_id: string | number; }) {
    // why do we need revision_id AND bag_name? revision_id is unique across all tiddlers
    if (options.bag_name && options.revision_id) {
      return `"tiddler:${options.bag_name}/${options.revision_id}"`;
    } else {
      throw "Missing bag_name or revision_id";
    }
  }

  async getRecipeACL(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    needWrite: boolean
  ) {
    const { user_id, isAdmin, role_ids } = this.user;

    const prisma = this.engine;
    const read = new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id, role_ids });
    const write = new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id, role_ids });

    const [recipe, canRead, canWrite] = await prisma.$transaction([
      prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { every: { bag: { OR: read } } } }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : needWrite ? prisma.recipes.findUnique({
        select: { recipe_id: true },
        where: { recipe_name, recipe_bags: { some: { position: 0, bag: { OR: write } } } }
      }) : prisma.$queryRaw`SELECT 2`,
    ]);

    return { recipe, canRead, canWrite };

  }



  async assertRecipeACL(
    recipe_name: PrismaField<"Recipes", "recipe_name">,
    needWrite: boolean
  ) {

    const { recipe, canRead, canWrite } = await this.getRecipeACL(recipe_name, needWrite);

    if (!recipe) throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead) throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (!canWrite) throw this.sendEmpty(403, { "x-reason": "no write permission" });

    this.asserted = true;

  }

  async getBagACL(
    bag_name: PrismaField<"Bags", "bag_name">,
    needWrite: boolean
  ) {
    const { user_id, isAdmin, role_ids } = this.user;
    const prisma = this.engine;
    const read = new DataChecks(this.config).getBagWhereACL({ permission: "READ", user_id, role_ids });
    const write = new DataChecks(this.config).getBagWhereACL({ permission: "WRITE", user_id, role_ids });
    const [bag, canRead, canWrite] = await prisma.$transaction([
      prisma.bags.findUnique({
        select: { bag_id: true, owner_id: true },
        where: { bag_name }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: read }
      }),
      isAdmin ? prisma.$queryRaw`SELECT 1` : needWrite ? prisma.bags.findUnique({
        select: { bag_id: true },
        where: { bag_name, OR: write }
      }) : prisma.$queryRaw`SELECT 2`,
    ]);
    return { bag, canRead, canWrite };
  }


  async assertBagACL(
    bag_name: PrismaField<"Bags", "bag_name">,
    needWrite: boolean
  ) {
    const { bag, canRead, canWrite } = await this.getBagACL(bag_name, needWrite);

    if (!bag) throw this.sendEmpty(404, { "x-reason": "recipe not found" });
    if (!canRead) throw this.sendEmpty(403, { "x-reason": "no read permission" });
    if (!canWrite) throw this.sendEmpty(403, { "x-reason": "no write permission" });

    this.asserted = true;

    return bag;

  }

}
