/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-add-role.js
type: application/javascript
module-type: command

Command to create a role

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
	
exports.info = {
	name: "mws-add-role",
	synchronous: false
};

var Command = function(params,commander,callback) {
	this.params = params;
	this.commander = commander;
	this.callback = callback;
};

Command.prototype.execute = async function() {
	var self = this;

	if(this.params.length < 2) {
		return "Usage: --mws-add-role <role_name> <description>";
	}

	if(!await $tw.mws || !await $tw.mws.store || !await $tw.mws.store.sqlTiddlerDatabase) {
		return "Error: MultiWikiServer or SQL database not initialized.";
	}

	var role_name = this.params[0];
	var description = this.params[1];

	await $tw.mws.store.sqlTiddlerDatabase.createRole(role_name, description);
	self.callback(null, "Role Created Successfully!");
	return null;
};

exports.Command = Command;

})();