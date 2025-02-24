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
		recipe_name: z.uriComponent(),
	}));

	const recipe_name = state.pathParams.recipe_name;

	/** @type {<T>(a: T) => T extends (infer X)[] ? X : T} */
	const first = (a) => Array.isArray(a) ? a[0] : a;

	let last_known_tiddler_id = 0;
	const lastEventID = first(state.headers["Last-Event-ID"]);
	const lastTiddlerID = state.queryParams.last_known_tiddler_id?.[0];
	if(lastEventID) {
		last_known_tiddler_id = $tw.utils.parseNumber(lastEventID);
	} else if(lastTiddlerID) {
		last_known_tiddler_id = $tw.utils.parseNumber(lastTiddlerID);
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
		var recipeTiddlers = await state.store.getRecipeTiddlers(recipe_name, {
			include_deleted: true,
			last_known_tiddler_id: last_known_tiddler_id
		});
		// Send to the client
		if(recipeTiddlers) {
			for(let index = recipeTiddlers.length - 1; index >= 0; index--) {
				const tiddlerInfo = recipeTiddlers[index];
				if(tiddlerInfo.tiddler_id > last_known_tiddler_id) {
					last_known_tiddler_id = tiddlerInfo.tiddler_id;
				}
				let data = tiddlerInfo;
				if(!tiddlerInfo.is_deleted) {
					const tiddler = await state.store.getRecipeTiddler(tiddlerInfo.title, recipe_name);
					if(tiddler) {
						data = $tw.utils.extend({}, data, {tiddler: tiddler.tiddler})
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

