import { Wiki } from "tiddlywiki";
import { createStrictAwaitProxy } from "../helpers";
import { StateObject } from "../StateObject";
import { DataChecks } from "./data-checks";
import { SqlTiddlerDatabase, TiddlerFields } from "./new-sql-tiddler-database";
import { Readable } from "stream";
import { resolve } from "path";


interface SqlTiddlerStoreEvents {
  change: [];
}

/**
Create a tiddler store. Options include:

databasePath - path to the database file (can be ":memory:" to get a temporary database)
adminWiki - reference to $tw.Wiki object used for configuration
attachmentStore - reference to associated attachment store
engine - wasm | better
*/
export class SqlTiddlerStore extends DataChecks {
  // attachmentStore: any;
  // adminWiki: any;
  eventListeners: Record<string, Function[]>;
  eventOutstanding: Record<string, boolean>;
  // databasePath: any;
  // sql: SqlTiddlerDatabase;
  sqlTiddlerDatabase: SqlTiddlerDatabase;
  constructor(
    public sql: SqlTiddlerDatabase,
    public attachmentStore: any,
    public adminWiki: Wiki,
    public config: any
  ) {
    ok(config);
    super();
    this.sqlTiddlerDatabase = sql;

    this.eventListeners = {}; // Hashmap by type of array of event listener functions
    this.eventOutstanding = {}; // Hashmap by type of boolean true of outstanding events
  }

  addEventListener<K extends keyof SqlTiddlerStoreEvents>(type: K, listener: (...args: SqlTiddlerStoreEvents[K]) => void) {
    this.eventListeners[type] = this.eventListeners[type] || [];
    this.eventListeners[type].push(listener);
  }
  removeEventListener<K extends keyof SqlTiddlerStoreEvents>(type: K, listener: (...args: SqlTiddlerStoreEvents[K]) => void) {
    const listeners = this.eventListeners[type];
    if (listeners) {
      var p = listeners.indexOf(listener);
      if (p !== -1) {
        listeners.splice(p, 1);
      }
    }
  }
  dispatchEvent<K extends keyof SqlTiddlerStoreEvents>(type: K, ...args: SqlTiddlerStoreEvents[K]) {
    const self = this;
    if (!this.eventOutstanding[type]) {
      process.nextTick(function () {
        self.eventOutstanding[type] = false;
        const listeners = self.eventListeners[type];
        if (listeners) {
          for (var p = 0; p < listeners.length; p++) {
            var listener = listeners[p];
            listener?.apply(listener, args);
          }
        }
      });
      this.eventOutstanding[type] = true;
    }
  }
  /**
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
  /**
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

  /**
  Given tiddler fields, tiddler_id and a bag_name, return the tiddler fields after the following process:
  - Apply the tiddler_id as the revision field
  - Apply the bag_name as the bag field
  */
  async processOutgoingTiddler(
    tiddlerFields: TiddlerFields,
    tiddler_id: PrismaField<"tiddlers", "tiddler_id">,
    bag_name: PrismaField<"bags", "bag_name">,
    attachment_blob: PrismaField<"tiddlers", "attachment_blob"> | null
  ) {
    if (attachment_blob !== null) {
      return Object.assign({}, tiddlerFields, {
        text: undefined,
        _canonical_uri: `/bags/${encodeURIComponentExtended(bag_name)}/tiddlers/${encodeURIComponentExtended(tiddlerFields.title)}/blob`
      }
      );
    } else {
      return tiddlerFields;
    }
  }
  /**
  */
  async processIncomingTiddler(
    tiddlerFields: TiddlerFields,
    existing_attachment_blob: PrismaField<"tiddlers", "attachment_blob">,
    existing_canonical_uri: string | undefined,
  ) {
    let attachmentSizeLimit = parseFloat(this.adminWiki.getTiddlerText("$:/config/MultiWikiServer/AttachmentSizeLimit") ?? "") || 0;
    if (attachmentSizeLimit < 100 * 1024) {
      attachmentSizeLimit = 100 * 1024;
    }
    const attachmentsEnabled = this.adminWiki.getTiddlerText("$:/config/MultiWikiServer/EnableAttachments", "yes") === "yes";
    const contentTypeInfo = this.config.contentTypeInfo[tiddlerFields.type || "text/vnd.tiddlywiki"];
    const isBinary = !!contentTypeInfo && contentTypeInfo.encoding === "base64";

    let shouldProcessAttachment = tiddlerFields.text && tiddlerFields.text.length > attachmentSizeLimit;

    if (existing_attachment_blob) {
      const fileSize = this.attachmentStore.getAttachmentFileSize(existing_attachment_blob);
      if (fileSize <= attachmentSizeLimit) {
        const existingAttachmentMeta = this.attachmentStore.getAttachmentMetadata(existing_attachment_blob);
        const hasCanonicalField = !!tiddlerFields._canonical_uri;
        const skipAttachment = hasCanonicalField && (tiddlerFields._canonical_uri === (existingAttachmentMeta ? existingAttachmentMeta._canonical_uri : existing_canonical_uri));
        shouldProcessAttachment = !skipAttachment;
      } else {
        shouldProcessAttachment = false;
      }
    }

    if (attachmentsEnabled && isBinary && shouldProcessAttachment) {
      const attachment_blob = existing_attachment_blob || this.attachmentStore.saveAttachment({
        text: tiddlerFields.text,
        type: tiddlerFields.type,
        reference: tiddlerFields.title,
        _canonical_uri: tiddlerFields._canonical_uri
      });

      if (tiddlerFields && tiddlerFields._canonical_uri) {
        delete tiddlerFields._canonical_uri;
      }

      return {
        tiddlerFields: Object.assign({}, tiddlerFields, { text: undefined }),
        attachment_blob: attachment_blob
      };
    } else {
      return {
        tiddlerFields: tiddlerFields,
        attachment_blob: existing_attachment_blob
      };
    }
  }
  /** For backward-compatibility reasons, this is retained, but the $tw global is required to be passed in. */
  async saveTiddlersFromPath($tw: any, tiddler_files_path: string, bag_name: PrismaField<"bags", "bag_name">) {
    // var self = this;
    // await this.sql.$transaction(async store => {
    // Clear out the bag
    await this.deleteAllTiddlersInBag(bag_name);
    // Get the tiddlers
    var tiddlersFromPath = $tw.loadTiddlersFromPath(resolve($tw.boot.corePath, this.config.editionsPath, tiddler_files_path));
    // Save the tiddlers
    for (const tiddlersFromFile of tiddlersFromPath) {
      for (const tiddler of tiddlersFromFile.tiddlers) {
        await this.saveBagTiddler(tiddler, bag_name);
      }
    }
    // });
    this.dispatchEvent("change");
  }
  async listBags() {
    return await this.sql.listBags();
  }
  /**
  Options include:
  
  allowPrivilegedCharacters - allows "$", ":" and "/" to appear in recipe name
  */
  async createBag(
    bag_name: PrismaField<"bags", "bag_name">,
    description: PrismaField<"bags", "description">,
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean; } = {}
  ) {
    // return await this.sql.transaction(function () {
    const validationBagName = this.validateItemName(bag_name, allowPrivilegedCharacters);
    if (validationBagName) { return { message: validationBagName }; }
    await this.sql.createBag(bag_name, description, null);
    this.dispatchEvent("change");
    return null;
    // });
  }
  async listRecipes() {
    return await this.sql.listRecipes();
  }
  /**
  Returns null on success, or {message:} on error
  
  Options include:
  
  allowPrivilegedCharacters - allows "$", ":" and "/" to appear in recipe name
  */
  async createRecipe(
    recipe_name: PrismaField<"recipes", "recipe_name">,
    bag_names: PrismaField<"bags", "bag_name">[] = [],
    description: PrismaField<"recipes", "description">,
    { allowPrivilegedCharacters = false }: { allowPrivilegedCharacters?: boolean } = {}
  ) {

    const validationRecipeName = this.validateItemName(recipe_name, allowPrivilegedCharacters);
    if (validationRecipeName) {
      return { message: validationRecipeName };
    }
    if (bag_names.length === 0) {
      return { message: "Recipes must contain at least one bag" };
    }

    // return await this.sql.transaction(function () {
    await this.sql.createRecipe(recipe_name, bag_names, description);
    this.dispatchEvent("change");
    return null;
    // });
  }
  /**
  Returns {tiddler_id:}
  */
  async saveBagTiddler(
    incomingTiddlerFields: TiddlerFields,
    bag_name: PrismaField<"bags", "bag_name">
  ) {

    let _canonical_uri;
    const existing_attachment_blob = await this.sql.getBagTiddlerAttachmentBlob(incomingTiddlerFields.title as PrismaField<"tiddlers", "title">, bag_name);
    if (existing_attachment_blob) {
      _canonical_uri = `/bags/${encodeURIComponentExtended(bag_name)}/tiddlers/${encodeURIComponentExtended(incomingTiddlerFields.title)}/blob`;
    }
    const { tiddlerFields, attachment_blob } = await this.processIncomingTiddler(incomingTiddlerFields, existing_attachment_blob, _canonical_uri);
    const result = this.sql.saveBagTiddler(tiddlerFields, bag_name, attachment_blob);
    this.dispatchEvent("change");
    return result;
  }
  /**
  Create a tiddler in a bag adopting the specified file as the attachment. The attachment file must be on the same disk as the attachment store
  Options include:
  
  filepath - filepath to the attachment file
  hash - string hash of the attachment file
  type - content type of file as uploaded
  
  Returns {tiddler_id:}
  */
  async saveBagTiddlerWithAttachment(
    incomingTiddlerFields: TiddlerFields,
    bag_name: PrismaField<"bags", "bag_name">,
    options: {
      filepath: string;
      hash: string;
      type: string;
      _canonical_uri: string;
    }
  ) {
    const attachment_blob = await this.attachmentStore.adoptAttachment(options.filepath, options.type, options.hash, options._canonical_uri);
    if (attachment_blob) {
      const result = await this.sql.saveBagTiddler(incomingTiddlerFields, bag_name, attachment_blob);
      this.dispatchEvent("change");
      return result;
    } else {
      return null;
    }
  }
  /**
  Returns {tiddler_id:,bag_name:}
  */
  async saveRecipeTiddler(incomingTiddlerFields: TiddlerFields, recipe_name: PrismaField<"recipes", "recipe_name">) {
    this.okTiddlerFields(incomingTiddlerFields);
    this.okTiddlerTitle(incomingTiddlerFields.title);
    const existing_attachment_blob = await this.sql.getRecipeTiddlerAttachmentBlob(incomingTiddlerFields.title, recipe_name);
    const { tiddlerFields, attachment_blob } = await this.processIncomingTiddler(incomingTiddlerFields, existing_attachment_blob, incomingTiddlerFields._canonical_uri);
    const result = this.sql.saveRecipeTiddler(tiddlerFields, recipe_name, attachment_blob);
    this.dispatchEvent("change");
    return result;
  }
  deleteTiddler(
    title: PrismaField<"tiddlers", "title">,
    bag_name: PrismaField<"bags", "bag_name">
  ) {
    const result = this.sql.deleteTiddler(title, bag_name);
    this.dispatchEvent("change");
    return result;
  }
  /**
  returns {tiddler_id:,tiddler:}
  */
  async getBagTiddler(
    title: PrismaField<"tiddlers", "title">,
    bag_name: PrismaField<"bags", "bag_name">
  ) {
    var tiddlerInfo = await this.sql.getBagTiddler(title, bag_name);
    if (tiddlerInfo) {
      return Object.assign(
        {},
        tiddlerInfo,
        {
          tiddler: await this.processOutgoingTiddler(tiddlerInfo.tiddler, tiddlerInfo.tiddler_id, bag_name, tiddlerInfo.attachment_blob)
        });
    } else {
      return null;
    }
  }
  /**
  Get an attachment ready to stream. Returns null if there is an error or:
  tiddler_id: revision of tiddler
  stream: stream of file
  type: type of file
  Returns {tiddler_id:,bag_name:}
  */
  async getBagTiddlerStream(
    title: PrismaField<"tiddlers", "title">,
    bag_name: PrismaField<"bags", "bag_name">
  ) {
    const self = this;
    const tiddlerInfo = await this.sql.getBagTiddler(title, bag_name);
    if (tiddlerInfo) {
      if (tiddlerInfo.attachment_blob) {
        return Object.assign(
          {},
          this.attachmentStore.getAttachmentStream(tiddlerInfo.attachment_blob),
          {
            tiddler_id: tiddlerInfo.tiddler_id,
            bag_name: bag_name
          }
        );
      } else {
        require
        const stream = new Readable();
        const type = tiddlerInfo.tiddler.type || "text/plain";
        const { encoding } = (this.config.contentTypeInfo[type] || { encoding: "utf8" });
        stream._read = function () {
          // Push data

          stream.push(tiddlerInfo.tiddler.text || "", encoding);
          // Push null to indicate the end of the stream
          stream.push(null);
        };
        return {
          tiddler_id: tiddlerInfo.tiddler_id,
          bag_name: bag_name,
          stream: stream,
          type: tiddlerInfo.tiddler.type || "text/plain"
        };
      }
    } else {
      return null;
    }
  }
  /**
  Returns {bag_name:, tiddler: {fields}, tiddler_id:}
  */
  async getRecipeTiddler(
    title: PrismaField<"tiddlers", "title">,
    recipe_name: PrismaField<"recipes", "recipe_name">
  ) {
    var tiddlerInfo = await this.sql.getRecipeTiddler(title, recipe_name, { attachment_blob: true, fields: true });
    if (tiddlerInfo) {
      return Object.assign({}, tiddlerInfo, {
        tiddler: await this.processOutgoingTiddler(tiddlerInfo.tiddler, tiddlerInfo.tiddler_id, tiddlerInfo.bag_name, tiddlerInfo.attachment_blob ?? null)
      });
    } else {
      return null;
    }
  }
  /**
  Get the titles of the tiddlers in a bag. Returns an empty array for bags that do not exist
  */
  getBagTiddlers(bag_name: PrismaField<"bags", "bag_name">) {
    return this.sql.getBagTiddlers(bag_name);
  }
  /**
  Get the tiddler_id of the newest tiddler in a bag. Returns null for bags that do not exist
  */
  getBagLastTiddlerId(bag_name: PrismaField<"bags", "bag_name">) {
    return this.sql.getBagLastTiddlerId(bag_name);
  }
  /**
  Get the titles of the tiddlers in a recipe as {title:,bag_name:}. Returns null for recipes that do not exist
  */
  async getRecipeTiddlers(
    recipe_name: PrismaField<"recipes", "recipe_name">,
    options: {
      last_known_tiddler_id?: number;
      include_deleted?: boolean;
    } = {}
  ) {
    return await this.sql.getRecipeTiddlers(recipe_name, options);
  }
  /**
  Get the tiddler_id of the newest tiddler in a recipe. Returns null for recipes that do not exist
  */
  async getRecipeLastTiddlerId(recipe_name: PrismaField<"recipes", "recipe_name">) {
    return await this.sql.getRecipeLastTiddlerId(recipe_name);
  }
  async deleteAllTiddlersInBag(bag_name: PrismaField<"bags", "bag_name">) {

    // return await this.sql.transaction(function () {
    const result = this.sql.deleteAllTiddlersInBag(bag_name);
    this.dispatchEvent("change");
    return result;
    // });
  }
  /**
  Get the names of the bags in a recipe. Returns an empty array for recipes that do not exist
  */
  getRecipeBags(recipe_name: PrismaField<"recipes", "recipe_name">) {
    return this.sql.getRecipeBags(recipe_name);
  }
}
