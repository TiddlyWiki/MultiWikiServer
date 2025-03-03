/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-system.js
type: application/javascript
module-type: mws-route

Retrieves a system file. System files are stored in configuration tiddlers with the following fields:

* title: "$:/plugins/tiddlywiki/multiwikiserver/system-files/" suffixed with the name of the file
* tags: tagged $:/tags/MWS/SystemFile or $:/tags/MWS/SystemFileWikified
* system-file-type: optionally specify the MIME type that should be returned for the file

GET /.system/:filename

\*/
"use strict";
const SYSTEM_FILE_TITLE_PREFIX = "$:/plugins/tiddlywiki/multiwikiserver/system-files/";

export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["GET"],
	path: /^\/\.system\/(.+)$/,
	pathParams: ["filename"],
	useACL: {},
}, async state => {
	zodAssert.pathParams(state, z => ({
		filename: z.prismaField("tiddlers", "title", "string"),
	}));
	// Get the  parameters
	const filename = state.pathParams.filename,
	title = SYSTEM_FILE_TITLE_PREFIX + filename,
	tiddler = state.store.adminWiki.getTiddler(title),
	isSystemFile = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFile"),
	isSystemFileWikified = tiddler && tiddler.hasTag("$:/tags/MWS/SystemFileWikified");

	if(tiddler && (isSystemFile || isSystemFileWikified)) {
		let text = tiddler.fields.text || "";
		const sysFileType = tiddler.fields["system-file-type"];
		const type = typeof sysFileType === "string" && sysFileType || tiddler.fields.type || "text/plain",
			encoding = (state.config.contentTypeInfo[type] || {encoding: "utf8"}).encoding;
		if(isSystemFileWikified) {
			text = state.store.adminWiki.renderTiddler("text/plain", title);
		}
		return state.sendString(200, {
			"content-type": type
		}, text, encoding);
	} else {
		return state.sendEmpty(404);
	}
});
