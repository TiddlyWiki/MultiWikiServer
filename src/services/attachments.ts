import { tryParseJSON } from "../utils";
import * as path from "path";
import * as fs from "fs";
import { SiteConfig } from "../commander";
import sjcl from "sjcl";
export interface TiddlerFields extends Record<string, any> {
  title: PrismaField<"Tiddlers", "title">;
}
const $tw: any = {};


/*

Class to handle the attachments in the filing system

The store folder looks like this:

store/
	inbox/ - files that are in the process of being uploaded via a multipart form upload
		202402282125432742/
			0
			1
			...
		...
	files/ - files that are the text content of large tiddlers
		b7def178-79c4-4d88-b7a4-39763014a58b/
			data.jpg - the extension is provided for convenience when directly inspecting the file system
			meta.json - contains:
				{
					"filename": "data.jpg",
					"type": "video/mp4",
					"uploaded": "2024021821224823"
				}
	database.sql - The database file (managed by sql-tiddler-database.js)

*/

export class AttachmentService {

  constructor(
    protected config: SiteConfig,
    protected prisma: PrismaTxnClient,
  ) { 

  }

  makeCanonicalUri(bag_name: string, title: string) {
    return `/bags/${encodeURIComponentExtended(bag_name)}/tiddlers/${encodeURIComponentExtended(title)}/blob`;
  }
  /*
  Given tiddler fields, tiddler_id and a bag_name, return the tiddler fields after the following process:
  - Apply the tiddler_id as the revision field
  - Apply the bag_name as the bag field
  */
  processOutgoingTiddler({ tiddler, tiddler_id, bag_name, attachment_hash }: {
    tiddler: TiddlerFields;
    tiddler_id: any;
    bag_name: PrismaField<"Bags", "bag_name">;
    attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
  }) {
    if (attachment_hash !== null) {
      return Object.assign(
        {},
        tiddler,
        {
          text: undefined,
          _canonical_uri: this.makeCanonicalUri(bag_name, tiddler.title),
          revision: tiddler_id,
          bag: bag_name
        }
      );
    } else {
      return tiddler;
    }
  }
  /*
  */
  async processIncomingTiddler({
    tiddlerFields, existing_attachment_hash, existing_canonical_uri
  }: {
    tiddlerFields: TiddlerFields;
    existing_attachment_hash: PrismaField<"Tiddlers", "attachment_hash">;
    existing_canonical_uri: any;
  }) {
    const { attachmentSizeLimit, attachmentsEnabled, } = this.config;
    const contentTypeInfo = this.config.contentTypeInfo[tiddlerFields.type || "text/vnd.tiddlywiki"];
    const isBinary = !!contentTypeInfo && contentTypeInfo.encoding === "base64";

    let shouldProcessAttachment = tiddlerFields.text && tiddlerFields.text.length > attachmentSizeLimit;

    if (existing_attachment_hash) {
      const fileSize = await this.getAttachmentFileSize(existing_attachment_hash);
      if (fileSize && fileSize <= attachmentSizeLimit) {
        const existingAttachmentMeta = await this.getAttachmentMetadata(existing_attachment_hash);
        const hasCanonicalField = !!tiddlerFields._canonical_uri;
        const skipAttachment = hasCanonicalField && (tiddlerFields._canonical_uri === (existingAttachmentMeta ? existingAttachmentMeta._canonical_uri : existing_canonical_uri));
        shouldProcessAttachment = !skipAttachment;
      } else {
        shouldProcessAttachment = false;
      }
    }

    if (attachmentsEnabled && isBinary && shouldProcessAttachment) {
      const attachment_hash = existing_attachment_hash || await this.saveAttachment({
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
        attachment_hash: attachment_hash
      };
    } else {
      return {
        tiddlerFields: tiddlerFields,
        attachment_hash: existing_attachment_hash
      };
    }
  }

  /*
  Check if an attachment name is valid (is a 64 character hex string)
  */
  isValidAttachmentName(content_hash: string) {
    const re = new RegExp('^[a-f0-9]{64}$');
    return re.test(content_hash);
  }
  /*
  Saves an attachment to a file. Options include:
  
  text: text content (may be binary)
  type: MIME type of content
  reference: reference to use for debugging
  _canonical_uri: canonical uri of the content
  */
  async saveAttachment(options: {
    text: string;
    type: string;
    reference: string;
    _canonical_uri: string;
  }) {

    // Compute the content hash for naming the attachment
    const contentHash = sjcl.codec.hex.fromBits($tw.sjcl.hash.sha256.hash(options.text)).slice(0, 64).toString();
    // Choose the best file extension for the attachment given its type
    const contentTypeInfo = this.config.contentTypeInfo[options.type] || this.config.contentTypeInfo["application/octet-stream"];
    // Creat the attachment directory
    const attachmentPath = path.resolve(this.config.storePath, "files", contentHash);
    createDirectory(attachmentPath);
    // Save the data file
    const dataFilename = "data" + contentTypeInfo.extension;
    fs.writeFileSync(path.resolve(attachmentPath, dataFilename), options.text, contentTypeInfo.encoding);
    // Save the meta.json file
    this.writeMetaFile(fs, path, attachmentPath, options, contentHash, dataFilename);
    return contentHash as PrismaField<"Tiddlers", "attachment_hash">;
  }
  private writeMetaFile(fs: any, path: any, attachmentPath: any, options: { text: string; type: string; reference: string; _canonical_uri: string; }, contentHash: any, dataFilename: string) {
    fs.writeFileSync(path.resolve(attachmentPath, "meta.json"), JSON.stringify({
      _canonical_uri: options._canonical_uri,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      contentHash: contentHash,
      filename: dataFilename,
      type: options.type
    }, null, 4));
  }

  /*
  Adopts an attachment file into the store (e.g. move from a temp upload directory)
  */
  async adoptAttachment({ incomingFilepath, type, hash, _canonical_uri }: {
    incomingFilepath: any;
    type: string | number;
    hash: any;
    _canonical_uri: any;
  }) {
    // Choose the best file extension for the attachment given its type
    const contentTypeInfo = this.config.contentTypeInfo[type] || this.config.contentTypeInfo["application/octet-stream"];
    // Creat the attachment directory
    const attachmentPath = path.resolve(this.config.storePath, "files", hash);
    createDirectory(attachmentPath);
    // Rename the data file
    const dataFilename = "data" + contentTypeInfo.extension, dataFilepath = path.resolve(attachmentPath, dataFilename);
    fs.renameSync(incomingFilepath, dataFilepath);
    // Save the meta.json file
    fs.writeFileSync(path.resolve(attachmentPath, "meta.json"), JSON.stringify({
      _canonical_uri: _canonical_uri,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      contentHash: hash,
      filename: dataFilename,
      type: type
    }, null, 4));
    return hash;
  }
  /*
  Get an attachment ready to stream. Returns null if there is an error or:
  stream: filestream of file
  type: type of file
  */
  async getAttachmentStream(content_hash: string) {
    // Check the attachment name
    if (!this.isValidAttachmentName(content_hash)) return null;

    // Construct the path to the attachment directory
    const attachmentPath = path.resolve(this.config.storePath, "files", content_hash);

    // Read the meta.json file
    const metaJsonPath = path.resolve(attachmentPath, "meta.json");
    if (!fs.existsSync(metaJsonPath) || !fs.statSync(metaJsonPath).isFile()) return null;

    const meta = tryParseJSON<any>(fs.readFileSync(metaJsonPath, "utf8"));
    if (!meta) return null;

    const dataFilepath = path.resolve(attachmentPath, meta.filename);
    // Check if the data file exists
    if (!fs.existsSync(dataFilepath) || !fs.statSync(dataFilepath).isFile()) return null

    // Stream the file
    return {
      stream: fs.createReadStream(dataFilepath),
      type: meta.type
    };


  }
  /*
  Get the size of an attachment file given the contentHash.
  Returns the size in bytes, or null if the file doesn't exist.
  */
  async getAttachmentFileSize(content_hash: PrismaField<"Tiddlers", "attachment_hash"> & {}) {
    // Construct the path to the attachment directory
    const attachmentPath = path.resolve(this.config.storePath, "files", content_hash);
    // Read the meta.json file
    const metaJsonPath = path.resolve(attachmentPath, "meta.json");
    if (!(fs.existsSync(metaJsonPath) && fs.statSync(metaJsonPath).isFile())) return null
    const meta = tryParseJSON<any>(fs.readFileSync(metaJsonPath, "utf8"));
    if (!meta) return null;
    const dataFilepath = path.resolve(attachmentPath, meta.filename);
    // Check if the data file exists and return its size
    if (!(fs.existsSync(dataFilepath) && fs.statSync(dataFilepath).isFile())) return null;
    return fs.statSync(dataFilepath).size;
  }

  async getAttachmentMetadata(content_hash: PrismaField<"Tiddlers", "attachment_hash"> & {}) {
    const attachmentPath = path.resolve(this.config.storePath, "files", content_hash);
    const metaJsonPath = path.resolve(attachmentPath, "meta.json");
    if (!fs.existsSync(metaJsonPath)) return null;
    return JSON.parse(fs.readFileSync(metaJsonPath, "utf8"));
  }

}

