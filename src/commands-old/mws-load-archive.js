/*\
title: $:/plugins/tiddlywiki/multiwikiserver/commands/mws-load-archive.js
type: application/javascript
module-type: command

Command to load archive of recipes, bags and tiddlers from a directory

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.info = {
	name: "mws-load-archive",
	synchronous: true
};

var Command = function(params,commander,callback) {
	this.params = params;
	this.commander = commander;
	this.callback = callback;
};

Command.prototype.execute = async function() {
	var self = this;
	// Check parameters
	if(this.params.length < 1) {
		return "Missing pathname";
	}
	var archivePath = this.params[0];
	await loadBackupArchive(archivePath);
	return null;
};

async function loadBackupArchive(archivePath) {
	const fs = require("fs"),
	path = require("path");
	// Iterate the bags
	const bagNames = fs.readdirSync(path.resolve(archivePath,"Bags")).filter(filename => filename !== ".DS_Store");
	for(const bagFilename of bagNames) {
		const bagName = decodeURIComponent(bagFilename);
		console.log(`Reading bag ${bagName}`);
		const bagInfo = JSON.parse(fs.readFileSync(path.resolve(archivePath,"Bags",bagFilename,"meta.json"),"utf8"));
		await $tw.mws.store.createBag(bagName,bagInfo.description,bagInfo.accesscontrol);
		if(fs.existsSync(path.resolve(archivePath,"Bags",bagFilename,"Tiddlers"))) {
			const tiddlerFilenames = fs.readdirSync(path.resolve(archivePath,"Bags",bagFilename,"Tiddlers"));
			for(const tiddlerFilename of tiddlerFilenames) {
				if(tiddlerFilename.endsWith(".json")) {
					const tiddlerPath = path.resolve(archivePath,"Bags",bagFilename,"Tiddlers",tiddlerFilename),
						jsonTiddler = fs.readFileSync(tiddlerPath,"utf8"),
						tiddler = sanitiseTiddler(JSON.parse(jsonTiddler));
					if(tiddler && tiddler.title) {
						await $tw.mws.store.saveBagTiddler(tiddler,bagName);
					} else {
						console.log(`Malformed JSON tiddler in file ${tiddlerPath}`);
					}
				}
			}	
		}
	}
	// Iterate the recipes
	const recipeNames = fs.readdirSync(path.resolve(archivePath,"Recipes"));
	for(const recipeFilename of recipeNames) {
		if(recipeFilename.endsWith(".json")) {
			const recipeName = decodeURIComponent(recipeFilename.substring(0,recipeFilename.length - ".json".length));
			const jsonInfo = JSON.parse(fs.readFileSync(path.resolve(archivePath,"Recipes",recipeFilename),"utf8"));
			await $tw.mws.store.createRecipe(recipeName,jsonInfo.bag_names,jsonInfo.description,jsonInfo.accesscontrol);
		}
	}
};

function sanitiseTiddler(tiddler) {
	var sanitisedFields = Object.create(null);
	for(const fieldName in tiddler) {
		const fieldValue = tiddler[fieldName];
		let sanitisedValue = "";
		if(typeof fieldValue === "string") {
			sanitisedValue = fieldValue;
		} else if($tw.utils.isDate(fieldValue)) {
			sanitisedValue = $tw.utils.stringifyDate(fieldValue);
		} else if($tw.utils.isArray(fieldValue)) {
			sanitisedValue = $tw.utils.stringifyList(fieldValue);
		}
		sanitisedFields[fieldName] = sanitisedValue;
	}
	return sanitisedFields;
}

exports.Command = Command;

})();
