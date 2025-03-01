/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-add-permission.js
type: application/javascript
module-type: command

Command to create a permission

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.info = {
		name: "mws-add-permission",
		synchronous: false
	};

	var Command = function(params, commander, callback) {
		this.params = params;
		this.commander = commander;
		this.callback = callback;
	};

	Command.prototype.execute = async function() {
		var self = this;

		if(this.params.length < 2) {
			return "Usage: --mws-add-permission <permission_name> <description>";
		}

		if(!await $tw.mws || !await $tw.mws.store || !await $tw.mws.store.sqlTiddlerDatabase) {
			return "Error: MultiWikiServer or SQL database not initialized.";
		}

		var permission_name = this.params[0];
		var description = this.params[1];

		await $tw.mws.store.sqlTiddlerDatabase.createPermission(permission_name, description)
			.then(e => e, e => console.log(e instanceof PrismaClientKnownRequestError ? e.stack : e));

		self.callback();
		return null;
	};

	exports.Command = Command;

})();