/*\
title: $:/plugins/mws/client/tiddlywebadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with MultiWikiServer-compatible servers. 

It has three key areas of concern:

* Basic operations like put, get, and delete a tiddler on the server
* Real time updates from the server (handled by SSE)
* Bags and recipes, which are unknown to the syncer

A key aspect of the design is that the syncer never overlaps basic server operations; it waits for the
previous operation to complete before sending a new one.

\*/

// the blank line is important, and so is the following use strict
"use strict";

import type { WikiRoutes, ZodRoute, ServerEventsMap } from './mws';
// import type { WikiRoutes, ZodRoute } from '@tiddlywiki/mws';
import type { Syncer, Tiddler, TiddlerFields } from 'tiddlywiki';
declare global { const fflate: typeof import("./fflate"); }
declare const self: never;

declare class Logger {
	constructor(componentName: any, options: any);
	componentName: any;
	colour: any;
	enable: any;
	save: any;
	saveLimit: any;
	saveBufferLogger: this;
	buffer: string;
	alertCount: number;
	setSaveBuffer(logger: any): void;
	log(...args: any[]): any;
	getBuffer(): string;
	table(value: any): void;
	alert(...args: any[]): void;
	clearAlerts(): void;
}

type TiddlerRouterResponse = {
	[K in keyof WikiRoutes]: WikiRoutes[K] extends ZodRoute<infer M, infer B, infer P, infer Q, infer T, infer R>
	? { M: M, B: B, P: P, Q: Q, T: T, R: R }
	: never
}

declare module 'tiddlywiki' {
	export interface Syncer {
		wiki: Wiki;
		logger: Logger;
		tiddlerInfo: Record<string, { bag: string; revision: string }>;
		enqueueLoadTiddler(title: string): void;
		storeTiddler(tiddler: Tiddler): void;
		processTaskQueue(): void;
		syncFromServer(): void;
		chooseNextTask(): Task | null;
		updateDirtyStatus(): void;
	}
	interface ITiddlyWiki {
		browserStorage: any;
	}
}

type ServerStatusCallback = (
	err: any,
	/** 
	 * $:/status/IsLoggedIn mostly appears alongside the username 
	 * or other login-conditional behavior. 
	 */
	isLoggedIn?: boolean,
	/**
	 * $:/status/UserName is still used for things like drafts even if the 
	 * user isn't logged in, although the username is less likely to be shown 
	 * to the user. 
	 */
	username?: string,
	/** 
	 * $:/status/IsReadOnly puts the UI in readonly mode, 
	 * but does not prevent automatic changes from attempting to save. 
	 */
	isReadOnly?: boolean,
	/** 
	 * $:/status/IsAnonymous does not appear anywhere in the TW5 repo! 
	 * So it has no apparent purpose. 
	 */
	isAnonymous?: boolean
) => void

interface SyncAdaptor<AD> {
	name?: string;

	isReady?(): boolean;

	getStatus?(
		cb: ServerStatusCallback
	): void;

	getSkinnyTiddlers?(
		cb: (err: any, tiddlerFields: Record<string, string>[]) => void
	): void;
	getUpdatedTiddlers?(
		syncer: Syncer,
		cb: (
			err: any,
			/** Arrays of titles that have been modified or deleted */
			updates?: { modifications: string[], deletions: string[] }
		) => void
	): void;

	/** 
	 * used to override the default Syncer getTiddlerRevision behavior
	 * of returning the revision field
	 * 
	 */
	getTiddlerRevision?(title: string): string;
	/** 
	 * used to get the adapter info from a tiddler in situations
	 * other than the saveTiddler callback
	 */
	getTiddlerInfo(tiddler: Tiddler): AD | undefined;

	saveTiddler(
		tiddler: any,
		cb: (
			err: any,
			adaptorInfo?: AD,
			revision?: string
		) => void,
		extra: { tiddlerInfo: SyncerTiddlerInfo<AD> }
	): void;

	setLoggerSaveBuffer?: (loggerForSaving: Logger) => void;
	displayLoginPrompt?(syncer: Syncer): void;
	login?(username: string, password: string, cb: (err: any) => void): void;
	logout?(cb: (err: any) => void): any;
}
interface SyncerTiddlerInfo<AD> {
	/** this comes from the wiki changeCount record */
	changeCount: number;
	/** Adapter info returned by the sync adapter */
	adaptorInfo: AD;
	/** Revision return by the sync adapter */
	revision: string;
	/** Timestamp set in the callback of the previous save */
	timestampLastSaved: Date;
}
interface Task { type: string; syncer: Syncer; run: (callback: () => void) => void; }

declare const $tw: any;

declare const exports: {
	adaptorClass: typeof MultiWikiClientAdaptor;
};

var CONFIG_HOST_TIDDLER = "$:/config/multiwikiclient/host",
	DEFAULT_HOST_TIDDLER = "$protocol$//$host$/",
	MWC_STATE_TIDDLER_PREFIX = "$:/state/multiwikiclient/",
	BAG_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/bag",
	REVISION_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/revision",
	CONNECTION_STATE_TIDDLER = "$:/state/multiwikiclient/connection",
	INCOMING_UPDATES_FILTER_TIDDLER = "$:/config/multiwikiclient/incoming-updates-filter",
	ENABLE_SSE_TIDDLER = "$:/config/multiwikiclient/use-server-sent-events",
	IS_DEV_MODE_TIDDLER = `$:/state/multiwikiclient/dev-mode`,
	ENABLE_GZIP_STREAM_TIDDLER = `$:/state/multiwikiclient/gzip-stream`;


var SERVER_NOT_CONNECTED = "NOT CONNECTED",
	SERVER_CONNECTING_SSE = "CONNECTING SSE",
	SERVER_CONNECTED_SSE = "CONNECTED SSE",
	SERVER_POLLING = "SERVER POLLING";

interface MWSAdaptorInfo {
	bag: string
}


class MultiWikiClientAdaptor implements SyncAdaptor<MWSAdaptorInfo> {
	private wiki;
	private host;
	private recipe;
	private useServerSentEvents;
	private last_known_revision_id;
	private outstandingRequests;
	private lastRecordedUpdate;
	private logger;
	private isLoggedIn;
	private isReadOnly;
	private offline;
	private username;
	private incomingUpdatesFilterFn;
	private serverUpdateConnectionStatus!: string;
	private isDevMode: boolean;
	private useGzipStream: boolean;

	name = "multiwikiclient";
	private supportsLazyLoading = true;
	constructor(options: { wiki: any }) {
		this.wiki = options.wiki;
		this.host = this.getHost();
		this.recipe = this.wiki.getTiddlerText("$:/config/multiwikiclient/recipe");
		this.useServerSentEvents = this.wiki.getTiddlerText(ENABLE_SSE_TIDDLER) === "yes";
		this.isDevMode = this.wiki.getTiddlerText(IS_DEV_MODE_TIDDLER) === "yes";
		this.useGzipStream = this.wiki.getTiddlerText(ENABLE_GZIP_STREAM_TIDDLER) === "yes";
		this.last_known_revision_id = this.wiki.getTiddlerText("$:/state/multiwikiclient/recipe/last_revision_id", "0")
		this.outstandingRequests = Object.create(null); // Hashmap by title of outstanding request object: {type: "PUT"|"GET"|"DELETE"}
		this.lastRecordedUpdate = Object.create(null); // Hashmap by title of last recorded update via SSE: {type: "update"|"detetion", revision_id:}
		this.logger = new $tw.utils.Logger("MultiWikiClientAdaptor");
		this.isLoggedIn = false;
		this.isReadOnly = false;
		this.offline = false;
		this.username = "";
		// Compile the dirty tiddler filter
		this.incomingUpdatesFilterFn = this.wiki.compileFilter(this.wiki.getTiddlerText(INCOMING_UPDATES_FILTER_TIDDLER));
		this.setUpdateConnectionStatus(SERVER_NOT_CONNECTED);
	}

	private setUpdateConnectionStatus(status: string) {
		this.serverUpdateConnectionStatus = status;
		this.wiki.addTiddler({
			title: CONNECTION_STATE_TIDDLER,
			text: status
		});
	}
	setLoggerSaveBuffer(loggerForSaving: Logger) {
		this.logger.setSaveBuffer(loggerForSaving);
	}
	isReady() {
		return true;
	}
	private getHost() {
		var text = this.wiki.getTiddlerText(CONFIG_HOST_TIDDLER, DEFAULT_HOST_TIDDLER), substitutions = [
			{ name: "protocol", value: document.location.protocol },
			{ name: "host", value: document.location.host },
			{ name: "pathname", value: document.location.pathname }
		];
		for (var t = 0; t < substitutions.length; t++) {
			var s = substitutions[t]!;
			text = $tw.utils.replaceString(text, new RegExp("\\$" + s.name + "\\$", "mg"), s.value);
		}
		return text;
	}

	getTiddlerInfo(tiddler: Tiddler) {
		var title = tiddler.fields.title,
			revision = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title),
			bag = this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
		if (revision && bag) {
			return {
				title: title,
				revision: revision,
				bag: bag
			};
		} else {
			return undefined;
		}
	}
	private getTiddlerBag(title: string) {
		return this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
	}
	getTiddlerRevision(title: string) {
		return this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title);
	}
	private setTiddlerInfo(title: string, revision: string, bag: string) {
		this.wiki.setText(BAG_STATE_TIDDLER, null, title, bag, { suppressTimestamp: true });
		this.wiki.setText(REVISION_STATE_TIDDLER, null, title, revision, { suppressTimestamp: true });
	}
	private removeTiddlerInfo(title: string) {
		this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
		this.wiki.setText(REVISION_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
	}

	error: string | null = null;
	/*
	Get the current status of the server connection
	*/
	async getStatus(callback: ServerStatusCallback) {

		const [ok, error, data] = await this.recipeRequest({
			key: "handleGetRecipeStatus",
			method: "GET",
			url: "/status",
		});
		this.connectRecipeEvents();
		if (!ok && data?.status === 0) {
			this.error = "The webpage is forbidden from contacting the server."
			this.isLoggedIn = false;
			this.isReadOnly = true;
			this.username = "(offline)";
			this.offline = true;
		} else if (ok) {
			this.error = null;
			const status = data.responseJSON;
			this.isReadOnly = status?.isReadOnly ?? true;
			this.isLoggedIn = status?.isLoggedIn ?? false;
			this.username = status?.username ?? "(anon)";
			this.offline = false;
		} else {
			this.error = error.message ?? `${error}`;
		}
		if (callback) {
			callback(
				// Error
				this.error,
				// Is logged in
				this.isLoggedIn,
				// Username
				this.username,
				// Is read only
				this.isReadOnly,
				// Is anonymous
				// no idea what this means, always return false
				false,
			);
		}
	}
	/*
	Get details of changed tiddlers from the server
	*/
	async getUpdatedTiddlers(syncer: Syncer, callback: (err: any, changes?: { modifications: string[]; deletions: string[] }) => void) {
		if (this.offline) return callback(null);
		if (!this.bags || this.serverUpdateConnectionStatus === SERVER_NOT_CONNECTED) await this.pollServer();
		const { modifications, deletions, last_revision } = this.updateBags();
		this.last_known_revision_id = last_revision;
		// syncer.processTaskQueue = () => { };
		callback(null, { modifications, deletions });
		// // @ts-expect-error
		// delete syncer.processTaskQueue;
		// await this.fastQueue(syncer);
	}

	async fastQueue(syncer: Syncer) {

		let task: Task | null = null;
		let active = [] as Promise<void>[];
		while (task = syncer.chooseNextTask()) {
			if (task.type === "syncfromserver") break;
			active.push(new Promise<void>((r) => task!.run(r)));
		}
		await Promise.all(active);
		syncer.updateDirtyStatus();
		syncer.processTaskQueue();
	}
	syncTimeout: NodeJS.Timeout | null = null;
	debounceSyncFromServer() {
		if (this.syncTimeout) {
			clearTimeout(this.syncTimeout);
		}
		this.syncTimeout = setTimeout(() => {
			this.syncTimeout = null;
			if (this.syncer) {
				this.syncer.syncFromServer();
			} else {
				console.warn("No syncer available to sync from server");
			}
		}, 1000);
	}
	connectRecipeEvents() {
		const event = new EventSource(this.host + "recipe/" + encodeURIComponent(this.recipe) + "/events?first-event-id=" + encodeURIComponent(this.last_known_revision_id));
		this.setUpdateConnectionStatus(SERVER_CONNECTING_SSE);
		const onEvent = (e: MessageEvent) => {
			type Data = | ServerEventsMap["mws.tiddler.save"][0] | ServerEventsMap["mws.tiddler.delete"][0];
			const data: Data = JSON.parse(e.data);
			if (!this.bags) return;
			const bag = this.bags.find(b => b.bag_name === data.bag_name);
			if (!bag) return;
			const tiddler = bag.tiddlers.find(t => t.title === data.title);
			if (!tiddler) {
				if (e.type === "tiddler.delete") return;
				// If the tiddler is not found, it must be a new tiddler
				bag.tiddlers.push({
					title: data.title,
					revision_id: data.revision_id,
					is_deleted: false,
				});
			} else {
				tiddler.is_deleted = (e.type === "tiddler.delete");
				tiddler.revision_id = data.revision_id;
			}
			this.debounceSyncFromServer();
		}
		const onUpdate = (e: MessageEvent) => {
			if (!this.bags) return;
			const updates: {
				bag: {
					bag_name: PrismaField<"Bags", "bag_name">;
					tiddlers: {
						revision_id: PrismaField<"Tiddlers", "revision_id">;
						title: PrismaField<"Tiddlers", "title">;
						is_deleted: PrismaField<"Tiddlers", "is_deleted">;
					}[];
				};
			}[] = JSON.parse(e.data);
			const existBags = new Map(this.bags.map(b => [b.bag_name, b.tiddlers] as const));
			updates.forEach(e => {
				const existBag = existBags.get(e.bag.bag_name);
				if (!existBag) return;
				const existTids = new Map(existBag.map(t => [t.title, t] as const));
				e.bag.tiddlers.forEach(tid => {
					const existTid = existTids.get(tid.title);
					if (existTid) {
						Object.assign(existTid, tid)
					} else {
						existBag.push(tid);
					}
				});
			});
			this.debounceSyncFromServer();
		};
		event.addEventListener("tiddler.save", onEvent);
		event.addEventListener("tiddler.delete", onEvent);
		event.addEventListener("tiddler.since-last-event", onUpdate);
		event.addEventListener("test", console.log);
		event.addEventListener("open", () => {
			this.setUpdateConnectionStatus(SERVER_CONNECTED_SSE);
			console.log("Connected to server events");
		});
		event.addEventListener("error", (e) => {
			if (event.readyState === EventSource.CLOSED) {
				this.setUpdateConnectionStatus(SERVER_NOT_CONNECTED);
				console.error("Server events connection closed");
			} else if (event.readyState === EventSource.CONNECTING) {
				this.setUpdateConnectionStatus(SERVER_CONNECTING_SSE);
				console.warn("Connecting to server events");
			} else {
				console.error("Error in server events connection", e);
			}
		});
	}

	bags?: {
		position: number & {
			__prisma_table: "Recipe_bags";
			__prisma_field: "position";
		};
		bag_id: string;
		bag_name: string;
		tiddlers: {
			title: string;
			revision_id: string;
			is_deleted: boolean;
		}[];
	}[]

	private async pollServer() {
		type t1 = WikiRoutes["handleGetBags"];
		const [ok, err, result] = await this.recipeRequest({
			key: "handleGetBags",
			url: "/bags",
			method: "GET",
		});
		if (!ok) throw err;
		if (!result.responseJSON) throw new Error("no result returned");
		type t2 = WikiRoutes["handleGetBagState"];
		this.bags = await Promise.all(result.responseJSON.map(e => this.recipeRequest({
			key: "handleGetBagState",
			url: "/bags/" + encodeURIComponent(e.bag_name) + "/state",
			method: "GET",
			queryParams: { include_deleted: "yes" },
		}).then(([ok, err, f]) => {
			if (!ok) throw err;
			if (!f.responseJSON) throw new Error("no result returned");
			return {
				...f.responseJSON,
				position: e.position,
			};
		})));

		this.bags.sort((a, b) => b.position - a.position);

	}

	updateBags() {

		if (!this.bags) throw new Error("No bags loaded, call pollServer first");

		const modified = new Set<string>(),
			deleted = new Set<string>();

		const incomingTitles = new Set<string>(this.bags.map(
			// get the titles in each layer that aren't deleted
			e => e.tiddlers.filter(f => !f.is_deleted).map(f => f.title)
			// and flatten them for Set
		).flat());

		let last_revision = this.last_known_revision_id;

		this.bags.forEach(bag => {
			bag.tiddlers.forEach(tid => {
				// if the revision is old, ignore, since deletions create a new revision
				if (tid.revision_id <= this.last_known_revision_id) return;
				if (tid.revision_id > last_revision) last_revision = tid.revision_id;
				// check if this title still exists in any layer
				if (incomingTitles.has(tid.title))
					modified.add(tid.title);
				else
					deleted.add(tid.title);
			})
		});

		return {
			modifications: [...modified.keys()],
			deletions: [...deleted.keys()],
			last_revision,
			incomingTitles,
		}
	}
	/*
	Queue a load for a tiddler if there has been an update for it since the specified revision
	*/
	private checkLastRecordedUpdate(title: string, revision: string) {
		// var lru = this.lastRecordedUpdate[title];
		// if (lru && lru.revision_id > revision) {
		// 	console.log(`Checking for updates to ${title} since ${JSON.stringify(lru)} comparing to ${revision}`);
		// 	this.syncer && this.syncer.enqueueLoadTiddler(title);
		// }
	}
	private get syncer() {
		if ($tw.syncadaptor === this) return $tw.syncer as Syncer;
	}
	/*
	Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
	*/
	async saveTiddler(
		tiddler: Tiddler,
		callback: (
			err: any,
			adaptorInfo?: MWSAdaptorInfo,
			revision?: string
		) => void,
		options?: {}
	) {
		var self = this, title = tiddler.fields.title as string;
		if (title === "$:/StoryList") {
			return callback(null);
		}
		if (this.isReadOnly || title.substr(0, MWC_STATE_TIDDLER_PREFIX.length) === MWC_STATE_TIDDLER_PREFIX) {
			return callback(null);
		}
		self.outstandingRequests[title] = { type: "PUT" };

		// application/x-mws-tiddler
		// The .tid file format does not support field names with colons. 
		// Rather than trying to catch all the unsupported variations that may appear,
		// we'll just use JSON to send it across the wire, since that is the official fallback format anyway.
		// However, parsing a huge string value inside a JSON object is very slow,
		// so we split off the text field and send it after the other fields. 

		const fields = tiddler.getFieldStrings({});
		const text = fields.text;
		delete fields.text;
		let body = JSON.stringify(fields);

		if (tiddler.hasField("text")) {
			if (typeof text !== "string" && text)
				return callback(new Error("Error saving tiddler " + fields.title + ": the text field is truthy but not a string"));
			body += `\n\n${text}`
		}

		type t = TiddlerRouterResponse["handleSaveRecipeTiddler"]
		const [ok, err, result] = await this.recipeRequest({
			key: "handleSaveRecipeTiddler",
			url: "/tiddlers/" + encodeURIComponent(title),
			method: "PUT",
			requestBodyString: body,
			headers: {
				"content-type": "application/x-mws-tiddler"
			}
		});

		delete self.outstandingRequests[title];
		if (!ok) return callback(err);

		const data = result.responseJSON;
		if (!data) return callback(null); // a 2xx response without a body is unlikely

		//If Browser-Storage plugin is present, remove tiddler from local storage after successful sync to the server
		if ($tw.browserStorage && $tw.browserStorage.isEnabled()) {
			$tw.browserStorage.removeTiddlerFromLocalStorage(title);
		}


		// Save the details of the new revision of the tiddler
		const revision = data.revision_id, bag_name = data.bag_name;
		console.log(`Saved ${title} with revision ${revision} and bag ${bag_name}`);
		// If there has been a more recent update from the server then enqueue a load of this tiddler
		self.checkLastRecordedUpdate(title, revision);
		// Invoke the callback
		self.setTiddlerInfo(title, revision, bag_name);
		if (false) {
			// this.syncer.processTaskQueue = () => { };
			// callback(null, { bag: bag_name }, revision);
			// // @ts-expect-error
			// delete this.syncer.processTaskQueue;
			// await this.fastQueue(this.syncer);
		} else {
			callback(null, { bag: bag_name }, revision);
		}

	}
	async saveTiddlers({ syncer, tiddlers, callback }: { syncer: Syncer, tiddlers: Tiddler[], callback: (err: any, adaptorInfo?: MWSAdaptorInfo, revision?: string) => void }) {
		if (this.isReadOnly) {
			return callback(null);
		}
		if (!tiddlers || tiddlers.length === 0) {
			return callback(null);
		}

	}
	/*
	Load a tiddler and invoke the callback with (err,tiddlerFields)

	The syncer does not pass itself into options.
	*/
	async loadTiddler(title: string, callback: (err: any, fields?: any) => void, options: any) {
		const self = this;
		if (!self.syncer) return callback(new Error("No syncer available"));
		self.outstandingRequests[title] = { type: "GET" };
		const [ok, err, result] = await this.recipeRequest({
			key: "handleLoadRecipeTiddler",
			url: "/tiddlers/" + encodeURIComponent(title),
			method: "GET",
		})
		delete self.outstandingRequests[title];

		if (!ok) return callback(err);

		const { responseJSON: data, headers } = result;
		const revision = headers.get("x-revision-number") ?? "",
			bag_name = headers.get("x-bag-name") ?? "";

		if (!revision || !bag_name || !data) return callback(null, null);

		// If there has been a more recent update from the server then enqueue a load of this tiddler
		self.checkLastRecordedUpdate(title, revision);
		// Invoke the callback
		self.setTiddlerInfo(title, revision, bag_name);
		callback(null, data);
	}
	/*
	Delete a tiddler and invoke the callback with (err)
	options include:
	tiddlerInfo: the syncer's tiddlerInfo for this tiddler
	*/
	async deleteTiddler(title: string, callback: (err: any, adaptorInfo?: any) => void, options: any) {
		var self = this;
		if (this.isReadOnly) { return callback(null); }
		// If we don't have a bag it means that the tiddler hasn't been seen by the server, so we don't need to delete it
		// var bag = this.getTiddlerBag(title);
		// if(!bag) { return callback(null, options.tiddlerInfo.adaptorInfo); }
		self.outstandingRequests[title] = { type: "DELETE" };
		// Issue HTTP request to delete the tiddler
		const [ok, err, result] = await this.recipeRequest({
			key: "handleDeleteRecipeTiddler",
			url: "/tiddlers/" + encodeURIComponent(title),
			method: "DELETE",
		});
		delete self.outstandingRequests[title];
		if (!ok) return callback(err);
		const { responseJSON: data } = result;
		if (!data) return callback(null);

		const revision = data.revision_id, bag_name = data.bag_name;
		// If there has been a more recent update from the server then enqueue a load of this tiddler
		self.checkLastRecordedUpdate(title, revision);
		self.removeTiddlerInfo(title);
		// Invoke the callback & return null adaptorInfo
		callback(null, null);
	}

	private async rpcRequest<KEY extends (string & keyof TiddlerRouterResponse)>(
		options: {
			key: KEY,
			body: TiddlerRouterResponse[KEY]["T"];
		}
	) {
		return await httpRequest({
			method: "PUT",
			url: this.host + "recipe/" + encodeURIComponent(this.recipe) + "/rpc/" + options.key,
			headers: { "content-type": "application/json" },
			requestBodyString: JSON.stringify(options.body),
			responseType: "text",
		}).then(async e => [!!e.ok, !e.ok ? new Error(
			`The server return a status code ${e.status} with the following reason: `
			+ `${e.headers.get("x-reason") ?? "(no reason given)"}`
		) : undefined, {
			...e,
			responseString: e.response,
			/** this is undefined if status is not 200 */
			responseJSON: e.status === 200
				? tryParseJSON(e.response) as TiddlerRouterResponse[KEY]["R"]
				: undefined,
		}] as const);
	}

	/** 
	 * This throws an error if the response status is not 2xx, but will still return the response alongside the error.
	 * 
	 * So if the first parameter is false, the third parameter may still contain the response.
	 */
	private async recipeRequest<KEY extends (string & keyof TiddlerRouterResponse)>(
		options: Omit<HttpRequestOptions<"arraybuffer">, "responseType"> & { key: KEY }
	) {
		if (!options.url.startsWith("/"))
			throw new Error("The url does not start with a slash");

		return await httpRequest({
			...options,
			responseType: "blob",
			url: this.host + "recipe/" + encodeURIComponent(this.recipe) + options.url,
		}).then(async e => {
			if (!e.ok) return [
				false, new Error(
					`The server return a status code ${e.status} with the following reason: `
					+ `${e.headers.get("x-reason") ?? "(no reason given)"}`
				), {
					...e,
					responseString: "",
					responseJSON: undefined,
				}
			] as const;
			let responseString: string = "";
			if (e.headers.get("x-gzip-stream") === "yes") {
				// Browsers only decode the first stream, 
				// so we cant use content-encoding or DecompressionStream

				await new Promise<void>(async resolve => {

					const gunzip = new fflate.AsyncGunzip((err, chunk, final) => {
						if (err) return console.log(err);
						responseString += fflate.strFromU8(chunk);
						if (final) resolve();
					});

					if (this.isDevMode) gunzip.onmember = e => console.log("gunzip member", e);

					gunzip.push(new Uint8Array(await readBlobAsArrayBuffer(e.response)));
					// this has to be on a separate line
					gunzip.push(new Uint8Array(), true);

				});

				if (this.isDevMode) console.log("gunzip result", responseString.length);

			} else {
				responseString = fflate.strFromU8(new Uint8Array(await readBlobAsArrayBuffer(e.response)));
			}

			return [true, void 0, {
				...e,
				responseString,
				/** this is undefined if status is not 200 */
				responseJSON: e.status === 200
					? tryParseJSON(responseString) as TiddlerRouterResponse[KEY]["R"]
					: undefined,
			}] as const;
		}, e => [false, e, void 0] as const);


	}

}

function tryParseJSON(data: string) {
	try {
		return JSON.parse(data);
	} catch (e) {
		console.error("Error parsing JSON, returning undefined", e);
		// console.log(data);
		return undefined;
	}
}

if ($tw.browser && document.location.protocol.startsWith("http")) {
	exports.adaptorClass = MultiWikiClientAdaptor;
}

type ParamsInput = URLSearchParams | [string, string][] | object | string | undefined;

interface HttpRequestOptions<TYPE extends "arraybuffer" | "blob" | "text"> {
	/** The request METHOD. Maybe be anything except CONNECT, TRACE, or TRACK.  */
	method: string;
	/** The url may also contain query params. */
	url: string;
	/** The response types */
	responseType: TYPE;
	headers?: HeadersInit;
	/** This is parsed separately from the url and appended to it. */
	queryParams?: ParamsInput;
	/** 
	 * The string to send as the request body. Not valid for GET and HEAD.
	 * 
	 * For `application/x-www-form-urlencoded`, use `new URLSearchParams().toString()`.
	 * 
	 * For `application/json`, use `JSON.stringify()`
	 */
	requestBodyString?: string;
	progress?: (event: ProgressEvent<EventTarget>) => void;
}


function httpRequest<TYPE extends "arraybuffer" | "blob" | "text">(options: HttpRequestOptions<TYPE>) {

	return new Promise<{
		/** Shorthand to check if the response is in the 2xx range. */
		ok: boolean;
		status: number;
		statusText: string;
		headers: Headers;
		response:
		TYPE extends "arraybuffer" ? ArrayBuffer :
		TYPE extends "blob" ? Blob :
		TYPE extends "text" ? string :
		never;
	}>((resolve, reject) => {
		// if this throws sync'ly, the promise will reject.

		options.method = options.method.toUpperCase();

		if ((options.method === "GET" || options.method === "HEAD") && options.requestBodyString)
			throw new Error("requestBodyString must be falsy if method is GET or HEAD");


		const url = new URL(options.url, location.href);
		const query = paramsInput(options.queryParams);
		query.forEach((v, k) => { url.searchParams.append(k, v); });

		const headers = new Headers(options.headers || {});

		const request = new XMLHttpRequest();
		request.responseType = options.responseType || "text";

		try {
			request.open(options.method, url, true);
		} catch (e) { console.log(e, { e }); throw e; }

		if (!headers.has("content-type"))
			headers.set("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

		if (!headers.has("x-requested-with"))
			headers.set("x-requested-with", "TiddlyWiki");

		headers.set("accept", "application/json");


		headers.forEach((v, k) => {
			request.setRequestHeader(k, v);
		});

		request.onreadystatechange = function () {
			if (this.readyState !== 4) return;

			const headers = new Headers();
			request.getAllResponseHeaders()?.trim().split(/[\r\n]+/).forEach((line) => {
				const parts = line.split(": ");
				const header = parts.shift()?.toLowerCase();
				const value = parts.join(": ");
				if (header) headers.append(header, value);
			});
			resolve({
				ok: this.status >= 200 && this.status < 300,
				status: this.status,
				statusText: this.statusText,
				response: this.response,
				headers,
			});

		};

		if (options.progress)
			request.onprogress = options.progress;

		try { request.send(options.requestBodyString); } catch (e) { console.log(e, { e }); throw e; }


	});


	function paramsInput(input: ParamsInput) {
		if (!input) return new URLSearchParams();
		if (input instanceof URLSearchParams) return input;
		if (Array.isArray(input) || typeof input === "string") return new URLSearchParams(input);
		return new URLSearchParams(Object.entries(input));
	}

}

function readBlobAsArrayBuffer(blob: Blob) {
	const error = new Error("Error reading blob");
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as ArrayBuffer)
		};
		reader.onerror = () => {
			reject(error);
		};
		reader.readAsArrayBuffer(blob);
	});

}

