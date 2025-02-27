/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-recipe-events.js
type: application/javascript
module-type: mws-route

GET /recipes/:recipe_name/events

headers:

Last-Event-ID: 

\*/
"use strict";
const SSE_HEARTBEAT_INTERVAL_MS = 10 * 1000;

/** @type {ServerRouteDefinition} */
export const route = (root) => root.defineRoute({
	method: ["GET"],
	path: /^\/recipes\/([^\/]+)\/events$/,
	pathParams: ["recipe_name"],
	useACL: {},
}, async state => {
	// Get the  parameters
	zodAssert.pathParams(state, z => ({
		recipe_name: z.prismaField("recipes", "recipe_name", "string"),
	}));

	zodAssert.queryParams(state, z => ({
		last_known_tiddler_id: z.array(z.prismaField("tiddlers", "tiddler_id", "parse-number")).optional()
	}));

	const recipe_name = state.pathParams.recipe_name;

	/** @type {<T>(a: T) => T extends (infer X)[] ? X : T} */
	const first = (a) => Array.isArray(a) ? a[0] : a;

	let last_known_tiddler_id = 0;
	const lastEventID = asPrismaField("tiddlers", "tiddler_id", +(first(state.headers["Last-Event-ID"]) ?? 0));
	const lastTiddlerID = state.queryParams.last_known_tiddler_id?.[0];
	if(lastEventID) {
		last_known_tiddler_id = lastEventID;
	} else if(lastTiddlerID) {
		last_known_tiddler_id = lastTiddlerID;
	}

	if(!recipe_name) return state.sendEmpty(404);

	const sse = state.sendSSE()
	// Start streaming the response
	state.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive"
	});
	// Setup the heartbeat timer
	var heartbeatTimer = setInterval(function() {
		sse.emitComment("keep-alive");//  state.write(':keep-alive\n\n');
	}, SSE_HEARTBEAT_INTERVAL_MS);
	// Method to get changed tiddler events and send to the client
	async function sendUpdates() {
		// Get the tiddlers in the recipe since the last known tiddler_id
		var allTiddlers = await state.store.getRecipeTiddlers(recipe_name, {
			include_deleted: true,
			last_known_tiddler_id
		});
		// the original method seems wrong. 
		// The client should get the changes from all bags, not just the top for each title.
		// I guess it depends on how the client handles bags. 
		allTiddlers.sort((a, b) => a.position - b.position);
		const recipeTiddlers = Array.from(new Map(allTiddlers.flatMap(bag => bag.tiddlers.map(tiddler => {
			return [tiddler.title, tiddler];
		})))).map(e => e[1]);
		// Send to the client
		if(recipeTiddlers) {


			for(let index = recipeTiddlers.length - 1; index >= 0; index--) {
				// /** @type {any} */
				const tiddlerInfo = recipeTiddlers[index];
				ok(tiddlerInfo);
				if(tiddlerInfo.tiddler_id > last_known_tiddler_id) {
					last_known_tiddler_id = tiddlerInfo.tiddler_id;
				}
				let data = tiddlerInfo;
				if(!tiddlerInfo.is_deleted) {
					const tiddler = await state.store.getRecipeTiddler(tiddlerInfo.title, recipe_name);
					if(tiddler) {
						data = Object.assign({}, data, {tiddler: tiddler.tiddler})
					}
				}
				sse.emitEvent("change", data, `${tiddlerInfo.tiddler_id}`);
			}
		}
	}
	// Send current and future changes
	await sendUpdates();
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	state.store.addEventListener("change", sendUpdates);
	// Clean up when the connection closes
	sse.onClose(function() {
		clearInterval(heartbeatTimer);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		state.store.removeEventListener("change", sendUpdates);
	});
	return state.STREAM_ENDED;


});

