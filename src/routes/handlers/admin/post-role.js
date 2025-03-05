/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/post-role.js
type: application/javascript
module-type: mws-route

POST /admin/post-role

\*/
"use strict";
export const route = (
	/** @type {rootRoute} */ root, 
	/** @type {ZodAssert} */ zodAssert
) => root.defineRoute({
	method: ["POST"],
	path: /^\/admin\/post-role\/?$/,
	bodyFormat: "www-form-urlencoded",
	useACL: {csrfDisable: true},
}, async state => {
	zodAssert.data(state, z => z.object({
		role_name: z.prismaField("Roles", "role_name", "string"),
		role_description: z.prismaField("Roles", "description", "string"),
	}));

	const {role_name, role_description} = state.data;

	if(!state.authenticatedUser || !state.authenticatedUser.isAdmin) {
		state.store.adminWiki.addTiddler(new state.Tiddler({
			title: "$:/temp/mws/post-role/error",
			text: "Unauthorized access. Admin privileges required."
		}));
		return state.redirect("/login");
	}

	if(!role_name || !role_description) {
		state.store.adminWiki.addTiddler(new state.Tiddler({
			title: "$:/temp/mws/post-role/error",
			text: "Role name and description are required"
		}));
		return state.redirect("/admin/roles");
	}

	try {
		// Check if role already exists
		var existingRole = await state.store.sql.getRoleByName(role_name);
		if(existingRole) {
			state.store.adminWiki.addTiddler(new state.Tiddler({
				title: "$:/temp/mws/post-role/error",
				text: "Role already exists"
			}));
			return state.redirect("/admin/roles");
		}

		await state.store.sql.createRole(role_name, role_description);

		state.store.adminWiki.addTiddler(new state.Tiddler({
			title: "$:/temp/mws/post-role/success",
			text: "Role created successfully"
		}));

		return state.redirect("/admin/roles");

	} catch(error) {
		console.error("Error creating role:", error);
		state.store.adminWiki.addTiddler(new state.Tiddler({
			title: "$:/temp/mws/post-role/error",
			text: `Error creating role: ${error}`
		}));
		return state.redirect("/admin/roles")
	}
});
