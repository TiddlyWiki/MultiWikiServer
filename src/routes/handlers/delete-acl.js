/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/delete-acl.js
type: application/javascript
module-type: mws-route

POST /admin/delete-acl

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";


	var aclMiddleware = require("$:/plugins/tiddlywiki/multiwikiserver/routes/helpers/acl-middleware.js").middleware;

	exports.method = "POST";

	exports.path = /^\/admin\/delete-acl\/?$/;


	exports.bodyFormat = "www-form-urlencoded-object";

	exports.csrfDisable = true;

	/** @type {ServerRouteHandler<0, "www-form-urlencoded">} */
	exports.handler = async function(request, response, state) {

		ok(state.zod(z => z.object({
			recipe_name: z.string(),
			bag_name: z.string(),
			acl_id: z.string()
				.transform(x => parseInt(x))
				.refine(x => !isNaN(x))
				.describe("acl_id must be an integer"),
			entity_type: z.string()
				.refine(x => ["recipe", "bag"].includes(x))
				.describe("entity_type must be 'recipe' or 'bag'")
		})));

		const {
			recipe_name,
			bag_name,
			acl_id,
			entity_type
		} = state.data;

		// mark this as the acl_id field
		okField("acl", "acl_id", acl_id);

		await aclMiddleware(request, response, state, entity_type, "WRITE");

		await state.store.sql.deleteACL(acl_id);

		response.writeHead(302, {"Location": "/admin/acl/" + recipe_name + "/" + bag_name});
		response.end();
	};

}());