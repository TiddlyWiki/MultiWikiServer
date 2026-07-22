import { SendError, ServerRequest } from "@tiddlywiki/server";
import { RecipeDefinition, TemplateDefinition } from "./TabDataAdapter";
import {
  CompiledRecipeBagInput,
  type UpsertBagInput,
  type UpsertRecipeInput,
  type UpsertRoleInput,
  type UpsertTemplateInput,
  type UpsertUserInput,
} from "./wiki-contract";
import { Prisma } from "@tiddlywiki/mws-prisma";
import { mapGetInit, thrower } from "./wiki-utils";
import { IdString, TabId } from "@mws/admin-vanilla/src/definition/tabs";
import { Debug } from "@prisma/client/runtime/client";

export const DEFAULT_TEMPLATE = "Blank Template";

export type ImportedRoleRows = Awaited<ReturnType<PrismaTxnClient["roles"]["findMany"]>>;
export type ImportedUserRows = Awaited<ReturnType<PrismaTxnClient["users"]["findMany"]>>;
export type ImportedBagRows = Awaited<ReturnType<PrismaTxnClient["bag"]["findMany"]>>;
export type ImportedRecipeRows = Awaited<ReturnType<PrismaTxnClient["recipe"]["findMany"]>>;
export type ImportedTemplateRow = {
  id: string;
  name: string;
  definition: PrismaJson.Template_definition;
  type: string
};

export function indexImportedRolesByName(rows: ImportedRoleRows) {
  return new Map(rows.map((role) => [role.role_name, role]));
}

export function indexImportedUsersByUsername(rows: ImportedUserRows) {
  return new Map(rows.map((user) => [user.username, user]));
}

export function indexImportedBagsByName(rows: ImportedBagRows) {
  return new Map(rows.map((bag) => [bag.name, bag]));
}

export function indexImportedRecipesBySlug(rows: ImportedRecipeRows) {
  return new Map(rows.map((recipe) => [recipe.slug, recipe]));
}

export function indexImportedTemplatesByName(rows: ImportedTemplateRow[]) {
  return new Map(rows.map((template) => [template.name, template]));
}

/*

basically I'm making everything on the server as consistent and repeatable 
as I possibly can across tabs. this is critical for bugs and maintenance. 
AI is good for designing a great idea, but its an absolute nightmare to 
maintain and update. So I'm going through manually and locking everything 
down with Typescript types and deduplicating as much code as I possibly can.

*/

type PrismaModalKeys = Prisma.TypeMap["meta"]["modelProps"]
type PrismaScalarKeys<Modal extends PrismaModalKeys> =
  keyof PrismaTxnClient[Modal][symbol]["types"]["payload"]["scalars"];

type ObjectsWithPermissions = {
  [K in PrismaModalKeys as PrismaTxnClient[K][symbol] extends
  { types: { payload: { objects: { permissions: any } } } } ? K : never]:
  PrismaTxnClient[K][symbol]["types"]["payload"]["objects"]
};
type ObjectPermissionLevels = {
  [K in keyof ObjectsWithPermissions]:
  ObjectsWithPermissions[K]["permissions"][number]["scalars"]["level"]
}
export abstract class PerClassImportWriter<Modal extends PrismaModalKeys> {
  constructor(
    protected tx: PrismaTxnClient,
    private tabid: TabId,
    private modal: Modal,
    private name: PrismaScalarKeys<Modal>,
    private id: PrismaScalarKeys<Modal>,
    private adminLevel: Modal extends keyof ObjectPermissionLevels ? ObjectPermissionLevels[Modal] : undefined,
    protected initStore: boolean,
  ) {
    if (initStore) this.asserted = true;
    this.debug = Debug("mws:admin:" + tabid)
  }
  debug: ART<typeof Debug>;
  private asserted = false;
  assertPermissions() {
    if (!this.asserted)
      throw new Error("Permissions must be asserted first.")
  }

  async checkExisting(id: IdString, name: string, user: ServerRequest["user"]) {
    if (user.isAdmin) { this.debug("isAdmin: true"); this.asserted = true; }
    if (this.initStore && typeof user.isLoggedIn === "boolean")
      throw new Error("This shouldn't happen.");

    this.debug("id.toString()", !!id.toString());

    if (!user.isAdmin && this.adminLevel) {

      if (!id.toString())
        throw new SendError("ACCESS_DENIED", 403, { reason: "You don't have permission to create " + this.tabid + "." });

      const hasPermission: number = await (this.tx[this.modal] as any).count({
        where: {
          id: id.toString(),
          permissions: {
            some: {
              level: this.adminLevel,
              role_id: { in: user.roles.map(e => e.role_id) }
            }
          }
        }
      });

      if (!hasPermission)
        throw new SendError("ACCESS_DENIED", 403, { reason: "You don't have permission to modify " + this.tabid + "." });
      else
        this.asserted = true;
    }
    if (!user.isAdmin && this.tabid === "users") {
      if (user.user_id !== id.toString())
        throw new SendError("ACCESS_DENIED", 403, { reason: "You must be an admin to edit other users" });
      else
        this.asserted = true;
    }
    if (!user.isAdmin && this.tabid === "roles") {
      throw new SendError("ACCESS_DENIED", 403, { reason: "You must be an admin to edit roles" });
    }
    if (id.toString()) {
      const existing = await (this.tx[this.modal] as any).findUnique({
        where: { [this.id]: id.toString() },
        select: { [this.id]: true, [this.name]: true }
      });
      this.debug("existing", existing[this.id], existing[this.name], name)
      if (!existing)
        throw new Error("existing wiki not found");

      if (existing[this.name] !== name) {
        if (this.tabid === "templates")
          if (existing[this.name] === DEFAULT_TEMPLATE || name === DEFAULT_TEMPLATE)
            throw new Error("Cannot rename the default template");
        await this.rename([[existing[this.name], name]]);
      }
    }

  }

  async rename(renames: [string, string][]) {
    this.assertPermissions();
    this.debug("renames", renames);
    await Promise.all(renames.map(async ([oldName, newName]) => {
      this.debug("rename", this.modal, this.name, oldName, newName);
      await (this.tx[this.modal] as any).update({
        where: { [this.name]: oldName },
        data: { [this.name]: newName }
      });
    }));
  }
  /** Maps names to ids */
  async getNameMapper(names?: readonly string[]) {
    return this.mapRowsToNameKey(await this.getMapperFunc({ names }))
  }
  /** Maps ids to names */
  async getIdMapper(ids?: readonly IdString[]) {
    return this.mapRowsToIdKey(await this.getMapperFunc({ ids }))
  }

  getMapperFunc({ ids, names }: { ids?: readonly IdString[], names?: readonly string[] }) {
    return (this.tx[this.modal] as any).findMany({
      ...(ids ? { where: { [this.id]: { in: Array.from(new Set(ids.map(e => e.toString()))) } } } : {}),
      ...(names ? { where: { [this.name]: { in: Array.from(new Set(names.map(e => e))) } } } : {}),
      select: { [this.id]: true, [this.name]: true },
    });
  }

  mapRowsToIdKey(rows: any[]) {
    return recordKeyMapper<IdString, string>(new Map(rows.map((row: any) => [row[this.id], row[this.name]])), this.tabid)
  }

  mapRowsToNameKey(rows: any[]) {
    return recordKeyMapper<string, IdString>(new Map(rows.map((row: any) => [row[this.name], new IdString(row[this.id])])), this.tabid);
  }

  abstract upsert(rows: unknown[], role_ids: readonly IdString[]): Promise<unknown[]>;
}

// #region ROLES
export class RoleImportWriter extends PerClassImportWriter<"roles"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "users", "roles", "role_name", "role_id", undefined, initStore);
  }

  async upsert(roles: UpsertRoleInput[]) {
    this.assertPermissions();
    this.validateProtectedRoles(roles);
    return Promise.all(roles.map((role) => this.tx.roles.upsert({
      where: { role_name: role.name },
      update: { description: role.description },
      create: { role_name: role.name, description: role.description },
    })));
  }


  private validateProtectedRoles(roles: UpsertRoleInput[]) {
    if (!this.initStore) {
      if (roles.some((entry) => entry.name === "ADMIN"))
        throw new SendError("CANNOT_WRITE_STATIC_ROWS", 400, { table: "roles", name: "ADMIN" })
      if (roles.some((entry) => entry.name === "USER"))
        throw new SendError("CANNOT_WRITE_STATIC_ROWS", 400, { table: "roles", name: "USER" })

    }
  }

}

// #region USERS
export class UserImportWriter extends PerClassImportWriter<"users"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "users", "users", "username", "user_id", undefined, initStore)
  }

  async upsert(users: UpsertUserInput[]) {
    this.assertPermissions();
    return Promise.all(users.map((user) => {
      const roleLinks = user.roleIds.map((roleId) => ({ role_id: IdString.cast(roleId) }));
      return this.tx.users.upsert({
        where: { username: user.username },
        update: {
          email: user.email,
          roles: { set: roleLinks },
          resetCode: user.resetCode,
        },
        create: {
          username: user.username,
          email: user.email,
          password: "",
          roles: { connect: roleLinks },
          resetCode: user.resetCode,
        },
      });
    }));
  }
}

// #region BAGS

export class BagImportWriter extends PerClassImportWriter<"bag"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "bags", "bag", "name", "id", "C_admin", initStore);
  }

  async rename(renames: [string, string][]) {
    this.assertPermissions();
    const renamesMap = new Map(renames);
    this.debug("renames", ...renamesMap.entries());
    const bags = await this.tx.bag.findMany({
      where: { name: { in: Array.from(renamesMap.keys()) } },
      include: { recipe_bags: { select: { recipe: { select: { id: true, template_id: true } } } }, }
    });

    const recipesInvolved = new Map<string, Set<string>>();
    const templatesInvolved = new Map<string, Set<string>>();

    bags.forEach(bag => {
      bag.recipe_bags.forEach(rb => {
        mapGetInit(recipesInvolved, bag.name, () => new Set()).add(rb.recipe.id);
        mapGetInit(templatesInvolved, bag.name, () => new Set()).add(rb.recipe.template_id);
      });
      this.debug(bag.name, "recipes involved", recipesInvolved.size);
      this.debug(bag.name, "templates involved", templatesInvolved.size);
    });

    const recipesToEdit = Array.from(new Set(Array.from(recipesInvolved.values(), e => [...e]).flat()));

    const recipes = await this.tx.recipe.findMany({
      where: { id: { in: recipesToEdit } }
    });

    for (const recipe of recipes) {
      recipe.definition.writablePrefixBags.forEach(e => {
        const newName = renamesMap.get(e.bagName);
        if (newName !== undefined) e.bagName = newName;
      });
      recipe.definition.readonlyBags
        = recipe.definition.readonlyBags
          .map(e => renamesMap.get(e) ?? e);
      await this.tx.recipe.update({
        where: { id: recipe.id },
        data: { definition: recipe.definition },
      })
    }

    const templatesToEdit = Array.from(new Set(Array.from(templatesInvolved.values(), e => [...e]).flat()));

    const templates = await this.tx.template.findMany({
      where: { id: { in: templatesToEdit } }
    });

    for (const template of templates) {
      template.definition.writablePrefixBags.forEach(e => {
        const newName = renamesMap.get(e.bagName);
        if (newName !== undefined) e.bagName = newName;
      });
      template.definition.readonlyBags
        = template.definition.readonlyBags
          .map(e => renamesMap.get(e) ?? e);
      await this.tx.template.update({
        where: { id: template.id },
        data: { definition: template.definition },
      });
    }

    super.rename(renames);

  }

  async upsert(bags: UpsertBagInput[]) {
    this.assertPermissions();
    const bagRows = await Promise.all(bags.map((bag) => this.tx.bag.upsert({
      where: { name: bag.name },
      update: {
        description: bag.description,
        permissions: {
          deleteMany: {},
          create: bag.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
        }
      },
      create: {
        name: bag.name,
        description: bag.description,
        permissions: {
          create: bag.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
        }
      },
      select: { id: true, _count: { select: { permissions: true } } },
    })));

    for (let i = 0; i < bags.length; i++) {
      if (bagRows[i]._count.permissions !== bags[i].permissions.length)
        throw new Error("Permissions length did not match");
    }

    return bagRows;
  }
}


// #region TEMPLATES
export class TemplateImportWriter extends PerClassImportWriter<"template"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "templates", "template", "name", "id", "B_write", initStore)
  }

  /** 
   * Saving a template without an id will always create one if the name does not exist 
   * and modify it if it does exist. 
   * You must include the existing id if you want to rename a template.
   */
  async upsert(templates: UpsertTemplateInput[]) {
    this.assertPermissions();

    const templateRows = await Promise.all(templates.map((template) => {

      const name = template.name;
      const type = template.definition.type;
      const definition = template.definition;

      return this.tx.template.upsert({
        create: {
          name,
          type,
          definition,
          permissions: {
            create: template.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
          }
        },
        update: {
          name,
          type,
          definition,
          permissions: {
            deleteMany: {},
            create: template.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) })),
          }
        },
        // prevents the template type from changing if it exists
        where: { name, type },
        select: { id: true, updated: true }
      });

    }));

    return templateRows;
  }
}


// #region RECIPES

export class RecipeImportWriter extends PerClassImportWriter<"recipe"> {
  constructor(tx: PrismaTxnClient, initStore: boolean) {
    super(tx, "wikis", "recipe", "slug", "id", "B_write", initStore)
  }


  async upsert(recipes: UpsertRecipeInput[]) {
    this.assertPermissions();
    const upserter = async (recipe: UpsertRecipeInput, compiledAt: Date) => {
      recipe.compiledBags.sort((a, b) => a.priority - b.priority);
      return await this.tx.recipe.upsert({
        where: { slug: recipe.slug },
        update: {
          definition: recipe.definition,
          template_id: IdString.cast(recipe.templateId),
          plugins: recipe.plugins,
          compiledAt,
          recipe_bags: {
            deleteMany: {},
            create: recipe.compiledBags.map(e => ({
              bag: { connect: { name: e.bagName } },
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            }))
          },
          permissions: {
            deleteMany: {},
            create: recipe.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) }))
          }
        },
        create: {
          slug: recipe.slug,
          definition: recipe.definition,
          template_id: IdString.cast(recipe.templateId),
          plugins: recipe.plugins,
          compiledAt,
          recipe_bags: {
            create: recipe.compiledBags.map(e => ({
              bag: { connect: { name: e.bagName } },
              is_writable: e.isWritable,
              prefix: e.prefix,
              priority: e.priority,
            })),
          },
          permissions: {
            create: recipe.permissions.map(e => ({ level: e.level, role_id: IdString.cast(e.role_id) }))
          }
        },
        select: {
          id: true,
          _count: { select: { permissions: true, recipe_bags: true } },
        }
      });
    }
    const results: [string, Date][] = [];
    for (const recipe of recipes) {
      const compiledAt = new Date();
      const row = await upserter(recipe, compiledAt);
      // if either of these ever throws, it is very likely because 
      // having deleteMany and create in the same nested operation 
      // is undocumented but appears to work.
      if (recipe.permissions.length !== row._count.permissions)
        throw new Error("Permissions length did not match");
      if (recipe.compiledBags.length !== row._count.recipe_bags)
        throw new Error("Compiled bags length did not match");
      results.push([row.id, compiledAt]);
    }

    return results;

  }
  // #region COMPILE
  compileRecipeSimpleV1(
    recipeDefinition: RecipeDefinition,
    templateDefinition: TemplateDefinition
  ): { bags: CompiledRecipeBagInput[], plugins: string[] } {
    // Set takes the order of first appearance.
    const plugins = Array.from(new Set([
      ...recipeDefinition.plugins,
      ...templateDefinition.plugins,
    ]));
    const readonlyBags = Array.from(new Set([
      ...recipeDefinition.readonlyBags,
      ...templateDefinition.readonlyBags,
    ]));
    // Object spread takes the last occurance of a value.
    const writablePrefixBags = Object.entries({
      ...toMappingObject(templateDefinition.writablePrefixBags),
      ...toMappingObject(recipeDefinition.writablePrefixBags),
    })
      .sort(([a], [b]) => b.length - a.length)
      .map(([prefix, bagName]) => ({ prefix, bagName }));

    return {
      plugins,
      bags: [
        ...writablePrefixBags
          .map((e, i) => ({
            // bagId: bagLookup.get(e.bagName)!.id,
            bagName: e.bagName,
            isWritable: true,
            priority: i,
            prefix: e.prefix,
          } satisfies CompiledRecipeBagInput)),
        ...readonlyBags
          .map((e, i) => ({
            // bagId: bagLookup.get(e)!.id,
            bagName: e,
            isWritable: false,
            priority: i + writablePrefixBags.length,
            prefix: "",
          } satisfies CompiledRecipeBagInput))
      ],
    }
  }



}
// #region OTHER

export function toMappingRows(obj: Record<string, string>) {
  return Object.entries(obj).map(([prefix, bagName]) => ({ prefix, bagName }));
}

export function toMappingObject(rows: readonly { prefix: string; bagName: string }[]) {
  return Object.fromEntries(rows.map(({ prefix, bagName }) => [prefix, bagName]));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}


function recordKeyMapper<K extends String, T>(map: Map<string, T>, table: TabId): (key: K) => T {
  return key => map.get(key.toString()) ?? thrower(new SendError("RECORD_KEY_NOT_FOUND", 400, { table, name: key.toString() }))
}