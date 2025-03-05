/*\
title: $:/plugins/tiddlywiki/multiwikiserver/store/attachments.js
type: application/javascript
module-type: library

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

\*/


"use strict";

import { tryParseJSON } from "../utils";
import * as path from "path";
import * as fs from "fs";
/*
Class to handle an attachment store. Options include:

storePath - path to the store
*/
export class AttachmentStore {

	constructor(
		public storePath: string,
		public sjcl: any,
		public config: any
	) {

	}

	/*
	Check if an attachment name is valid
	*/
	isValidAttachmentName(attachment_name: string) {
		const re = new RegExp("^[a-f0-9]{64}$");
		return re.test(attachment_name);
	}

	/*
	Saves an attachment to a file. Options include:
	
	text: text content (may be binary)
	type: MIME type of content
	reference: reference to use for debugging
	_canonical_uri: canonical uri of the content
	*/
	saveAttachment(options: { text: string | Buffer; type: string; reference?: string; _canonical_uri: string; }) {

		// Compute the content hash for naming the attachment
		const contentHash = this.sjcl.codec.hex.fromBits(this.sjcl.hash.sha256.hash(options.text)).slice(0, 64).toString();
		// Choose the best file extension for the attachment given its type
		const contentTypeInfo = this.config.contentTypeInfo[options.type] || this.config.contentTypeInfo["application/octet-stream"];
		// Creat the attachment directory
		const attachmentPath = path.resolve(this.storePath, "files", contentHash);
		createDirectory(attachmentPath);
		// Save the data file
		const dataFilename = "data" + contentTypeInfo.extension;
		fs.writeFileSync(path.resolve(attachmentPath, dataFilename), options.text, contentTypeInfo.encoding);
		// Save the meta.json file
		fs.writeFileSync(path.resolve(attachmentPath, "meta.json"), JSON.stringify({
			_canonical_uri: options._canonical_uri,
			created: new Date().toISOString(),
			modified: new Date().toISOString(),
			contentHash: contentHash,
			filename: dataFilename,
			type: options.type
		}, null, 4));
		return contentHash;
	}

	/*
	Adopts an attachment file into the store
	*/
	adoptAttachment(incomingFilepath: string, type: string, hash: string, _canonical_uri: string) {

		// Choose the best file extension for the attachment given its type
		const contentTypeInfo = this.config.contentTypeInfo[type] || this.config.contentTypeInfo["application/octet-stream"];
		// Creat the attachment directory
		const attachmentPath = path.resolve(this.storePath, "files", hash);
		createDirectory(attachmentPath);
		// Rename the data file
		const dataFilename = "data" + contentTypeInfo.extension,
			dataFilepath = path.resolve(attachmentPath, dataFilename);
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
	getAttachmentStream(attachment_name: string) {

		// Check the attachment name
		if (this.isValidAttachmentName(attachment_name)) {
			// Construct the path to the attachment directory
			const attachmentPath = path.resolve(this.storePath, "files", attachment_name);
			// Read the meta.json file
			const metaJsonPath = path.resolve(attachmentPath, "meta.json");
			if (fs.existsSync(metaJsonPath) && fs.statSync(metaJsonPath).isFile()) {
				const meta: any = tryParseJSON(fs.readFileSync(metaJsonPath, "utf8"));
				if (meta) {
					const dataFilepath = path.resolve(attachmentPath, meta.filename);
					// Check if the data file exists
					if (fs.existsSync(dataFilepath) && fs.statSync(dataFilepath).isFile()) {
						// Stream the file
						return {
							stream: fs.createReadStream(dataFilepath),
							type: meta.type
						};
					}
				}
			}
		}
		// An error occured
		return null;
	}

	/*
	Get the size of an attachment file given the contentHash.
	Returns the size in bytes, or null if the file doesn't exist.
	*/
	getAttachmentFileSize(contentHash: string) {

		// Construct the path to the attachment directory
		const attachmentPath = path.resolve(this.storePath, "files", contentHash);
		// Read the meta.json file
		const metaJsonPath = path.resolve(attachmentPath, "meta.json");
		if (fs.existsSync(metaJsonPath) && fs.statSync(metaJsonPath).isFile()) {
			const meta = tryParseJSON<any>(fs.readFileSync(metaJsonPath, "utf8"));
			if (meta) {
				const dataFilepath = path.resolve(attachmentPath, meta.filename);
				// Check if the data file exists and return its size
				if (fs.existsSync(dataFilepath) && fs.statSync(dataFilepath).isFile()) {
					return fs.statSync(dataFilepath).size;
				}
			}
		}
		// Return null if the file doesn't exist or there was an error
		return null;
	}

	getAttachmentMetadata(attachmentBlob: string) {

		const attachmentPath = path.resolve(this.storePath, "files", attachmentBlob);
		const metaJsonPath = path.resolve(attachmentPath, "meta.json");
		if (fs.existsSync(metaJsonPath)) {
			const metadata = JSON.parse(fs.readFileSync(metaJsonPath, "utf8"));
			return metadata;
		}
		return null;
	}
}

