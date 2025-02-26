/*\
title: $:/plugins/tiddlywiki/multiwikiserver/startup-old.js
type: application/javascript
module-type: 

Multi wiki server initialisation

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "multiwikiserver";
exports.platforms = ["node"];
exports.before = ["story"];
exports.synchronous = true;

exports.startup = function() {
	const store = setupStore();
	$tw.mws = {
		store: store,
		serverManager: new ServerManager()
	};
}

function setupStore() {
	const path = require("path");
	const fs = require("fs");
	const runsql = !fs.existsSync(path.resolve($tw.boot.wikiPath,"store"));
	// Create and initialise the attachment store and the tiddler store
	const AttachmentStore = require("$:/plugins/tiddlywiki/multiwikiserver/store/attachments.js").AttachmentStore,
		attachmentStore = new AttachmentStore({
			storePath: path.resolve($tw.boot.wikiPath,"store/")
		}),
		SqlTiddlerStore = require("$:/plugins/tiddlywiki/multiwikiserver/store/sql-tiddler-store.js").SqlTiddlerStore,
		store = new SqlTiddlerStore({
			databasePath: path.resolve($tw.boot.wikiPath,"store/database.sqlite"),
			engine: $tw.wiki.getTiddlerText("$:/config/MultiWikiServer/Engine","better"), // better || wasm
			attachmentStore: attachmentStore,
			adminWiki: $tw.wiki,
		});
	if(runsql) try {store.sql.engine.db.exec(require("fs").readFileSync("./prisma/schema.prisma.sql", "utf8"));} catch(e) { console.log(e);}
	return store;
}

function ServerManager() {
	this.servers = [];
}

ServerManager.prototype.createServer = function(options) {
	const MWSServer = require("$:/plugins/tiddlywiki/multiwikiserver/mws-server.js").Server,
		server = new MWSServer(options);
	this.servers.push(server);
	return server;
}

})();
