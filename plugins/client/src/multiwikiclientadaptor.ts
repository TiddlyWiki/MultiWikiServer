/*\
title: $:/plugins/tiddlywiki/tiddlyweb/tiddlywebadaptor.js
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
import type { Logger } from "$:/core/modules/utils/logger.js";
import type { Syncer, Tiddler, ITiddlyWiki } from "tiddlywiki";

declare module 'tiddlywiki' {
	export interface Syncer {
		wiki: Wiki;
		logger: Logger;
		tiddlerInfo: Record<string, { bag: string; revision: string }>;
		enqueueLoadTiddler(title: string): void;
		storeTiddler(tiddler: Tiddler): void;
		processTaskQueue(): void;
	}
	interface ITiddlyWiki {
		browserStorage: any;
	}
}

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
	ENABLE_SSE_TIDDLER = "$:/config/multiwikiclient/use-server-sent-events";

var SERVER_NOT_CONNECTED = "NOT CONNECTED",
	SERVER_CONNECTING_SSE = "CONNECTING SSE",
	SERVER_CONNECTED_SSE = "CONNECTED SSE",
	SERVER_POLLING = "SERVER POLLING";

class MultiWikiClientAdaptor {
	wiki;
	host;
	recipe;
	useServerSentEvents;
	last_known_revision_id;
	outstandingRequests;
	lastRecordedUpdate;
	logger;
	isLoggedIn;
	isReadOnly;
	logoutIsAvailable;
	incomingUpdatesFilterFn;
	serverUpdateConnectionStatus!: string;

	name = "multiwikiclient";
	supportsLazyLoading = true;
	constructor(options: { wiki: any }) {
		this.wiki = options.wiki;
		this.host = this.getHost();
		this.recipe = this.wiki.getTiddlerText("$:/config/multiwikiclient/recipe");
		this.useServerSentEvents = this.wiki.getTiddlerText(ENABLE_SSE_TIDDLER) === "yes";
		this.last_known_revision_id = $tw.utils.parseNumber(this.wiki.getTiddlerText("$:/state/multiwikiclient/recipe/last_revision_id", "0"));
		this.outstandingRequests = Object.create(null); // Hashmap by title of outstanding request object: {type: "PUT"|"GET"|"DELETE"}
		this.lastRecordedUpdate = Object.create(null); // Hashmap by title of last recorded update via SSE: {type: "update"|"detetion", revision_id:}
		this.logger = new $tw.utils.Logger("MultiWikiClientAdaptor");
		this.isLoggedIn = false;
		this.isReadOnly = false;
		this.logoutIsAvailable = true;
		// Compile the dirty tiddler filter
		this.incomingUpdatesFilterFn = this.wiki.compileFilter(this.wiki.getTiddlerText(INCOMING_UPDATES_FILTER_TIDDLER));
		this.setUpdateConnectionStatus(SERVER_NOT_CONNECTED);
	}

	setUpdateConnectionStatus(status: string) {
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
	getHost() {
		var text = this.wiki.getTiddlerText(CONFIG_HOST_TIDDLER, DEFAULT_HOST_TIDDLER), substitutions = [
			{ name: "protocol", value: document.location.protocol },
			{ name: "host", value: document.location.host },
			{ name: "pathname", value: document.location.pathname }
		];
		for (var t = 0; t < substitutions.length; t++) {
			var s = substitutions[t];
			text = $tw.utils.replaceString(text, new RegExp("\\$" + s.name + "\\$", "mg"), s.value);
		}
		return text;
	}
	getTiddlerInfo(tiddler: Tiddler) {
		var title = tiddler.fields.title, revision = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title), bag = this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
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
	getTiddlerBag(title: string) {
		return this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
	}
	getTiddlerRevision(title: string) {
		return this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title);
	}
	setTiddlerInfo(title: string, revision: string, bag: string) {
		this.wiki.setText(BAG_STATE_TIDDLER, null, title, bag, { suppressTimestamp: true });
		this.wiki.setText(REVISION_STATE_TIDDLER, null, title, revision, { suppressTimestamp: true });
	}
	removeTiddlerInfo(title: string) {
		this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
		this.wiki.setText(REVISION_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
	}

	httpRequest<RT extends "text" | "arraybuffer" | "json">(options: {
		/** url to retrieve (must not contain `?` if GET or HEAD) */
		url: string;
		/** hashmap of headers to send */
		headers?: Record<string, string>;
		/** request method: GET, PUT, POST etc */
		type?: string;
		/** optional function invoked with (lengthComputable,loaded,total) */
		progress?: (lengthComputable: boolean, loaded: number, total: number) => void;
		/** name of the property to return as first argument of callback */
		returnProp?: string;
		responseType?: RT;
		useDefaultHeaders?: boolean;
		/** urlencoded string or hashmap of data to send. If type is GET or HEAD, this is appended to the URL as a query string */
		data?: object | string;
	}) {
		type ResponseErr = [false, any, undefined];
		type ResponseOk = [true, undefined, {
			data:
			"json" extends RT ? any :
			"text" extends RT ? string :
			"arraybuffer" extends RT ? ArrayBuffer :
			unknown;
			headers: Record<string, string>
		}];
		return (new Promise<ResponseErr | ResponseOk>((resolve) => {
			$tw.utils.httpRequest({
				...options,
				responseType: options.responseType === "json" ? "text" : options.responseType,
				callback: (err: any, data: any, request: XMLHttpRequest) => {
					if (err) return resolve([false, err || new Error("Unknown error"), undefined]);

					// Create a map of header names to values

					const headers = {} as any;
					request.getAllResponseHeaders()?.trim().split(/[\r\n]+/).forEach((line) => {
						const parts = line.split(": ");
						const header = parts.shift()?.toLowerCase();
						const value = parts.join(": ");
						if (header) headers[header] = value;
					});
					// Resolve the promise with the response data and headers
					resolve([true, undefined, {
						headers,
						data: options.responseType === "json" ? $tw.utils.parseJSONSafe(data, () => undefined) : data,
					}]);
				},
			});
		}));
	}
	/*
	Get the current status of the server connection
	*/
	async getStatus(callback: (
		err: any,
		isLoggedIn?: boolean,
		username?: string,
		isReadOnly?: boolean,
		isAnonymous?: boolean,
	) => void) {
		interface UserAuthStatus {
			isAdmin: boolean;
			user_id: number;
			username: string;
			isLoggedIn: boolean;
			isReadOnly: boolean;
			allowAnonReads: boolean;
			allowAnonWrites: boolean;
		}

		const [ok, error, data] = await this.httpRequest({
			url: this.host + "recipes/" + this.recipe + "/status",
			type: "GET",
			responseType: "json",
			headers: {
				'Content-Type': 'application/json',
				"X-Requested-With": "TiddlyWiki"
			},
		});
		if (!ok) {
			this.logger.log("Error getting status", error);
			if (callback) callback(error);
			return;
		}
		/** @type {Partial<UserAuthStatus>} */
		const status = data.data;
		if (callback) {
			callback(
				// Error
				null,
				// Is logged in
				status.isLoggedIn ?? false,
				// Username
				status.username ?? "(anon)",
				// Is read only
				status.isReadOnly ?? true,
				// Is anonymous
				!status.isLoggedIn,
			);
		}
	}
	/*
	Get details of changed tiddlers from the server
	*/
	getUpdatedTiddlers(syncer: Syncer, callback: (err: any, changes?: { modifications: string[]; deletions: string[] }) => void) {
		if (!this.useServerSentEvents) {
			this.pollServer({
				callback: function (err, changes) {
					callback(null, changes);
				}
			});
			return;
		}

		var self = this;
		// Do nothing if there's already a connection in progress.
		if (this.serverUpdateConnectionStatus !== SERVER_NOT_CONNECTED) {
			return callback(null, {
				modifications: [],
				deletions: []
			});
		}
		// Try to connect a server stream
		this.setUpdateConnectionStatus(SERVER_CONNECTING_SSE);
		this.connectServerStream({
			syncer: syncer,
			onerror: function (err) {
				self.logger.log("Error connecting SSE stream", err);
				// If the stream didn't work, try polling
				self.setUpdateConnectionStatus(SERVER_POLLING);
				self.pollServer({
					callback: function (err, changes) {
						self.setUpdateConnectionStatus(SERVER_NOT_CONNECTED);
						callback(null, changes);
					}
				});
			},
			onopen: function () {
				self.setUpdateConnectionStatus(SERVER_CONNECTED_SSE);
				// The syncer is expecting a callback but we don't have any data to send
				callback(null, {
					modifications: [],
					deletions: []
				});
			}
		});

	}
	/*
	Attempt to establish an SSE stream with the server and transfer tiddler changes. Options include:
  
	syncer: reference to syncer object used for storing data
	onopen: invoked when the stream is successfully opened
	onerror: invoked if there is an error
	*/
	connectServerStream(options: {
		syncer: Syncer;
		onopen: (event: Event) => void;
		onerror: (event: Event) => void;
	}) {
		var self = this;
		const eventSource = new EventSource("/recipes/" + this.recipe + "/events?last_known_revision_id=" + this.last_known_revision_id);
		eventSource.onerror = function (event) {
			if (options.onerror) {
				options.onerror(event);
			}
		};
		eventSource.onopen = function (event) {
			if (options.onopen) {
				options.onopen(event);
			}
		};
		eventSource.addEventListener("change", function (event) {

			const data: {
				title: string;
				revision_id: number;
				is_deleted: boolean;
				bag_name: string;
				tiddler: any;
			} = $tw.utils.parseJSONSafe(event.data);
			if (!data) return;

			console.log("SSE data", data);
			// Update last seen revision_id
			if (data.revision_id > self.last_known_revision_id) {
				self.last_known_revision_id = data.revision_id;
			}
			// Record the last update to this tiddler
			self.lastRecordedUpdate[data.title] = {
				type: data.is_deleted ? "deletion" : "update",
				revision_id: data.revision_id
			};
			console.log(`Oustanding requests is ${JSON.stringify(self.outstandingRequests[data.title])}`);
			// Process the update if the tiddler is not the subject of an outstanding request
			if (self.outstandingRequests[data.title]) return;
			if (data.is_deleted) {
				self.removeTiddlerInfo(data.title);
				delete options.syncer.tiddlerInfo[data.title];
				options.syncer.logger.log("Deleting tiddler missing from server:", data.title);
				options.syncer.wiki.deleteTiddler(data.title);
				options.syncer.processTaskQueue();
			} else {
				var result = self.incomingUpdatesFilterFn.call(self.wiki, self.wiki.makeTiddlerIterator([data.title]));
				if (result.length > 0) {
					self.setTiddlerInfo(data.title, data.revision_id.toString(), data.bag_name);
					options.syncer.storeTiddler(data.tiddler);
				}
			}


		});
	}
	/*
	Poll the server for changes. Options include:
  
	callback: invoked on completion as (err,changes)
	*/
	async pollServer(options: {
		callback: (err: any, changes?: { modifications: string[]; deletions: string[] }) => void;
	}) {
		var self = this;
		const [ok, err, result] = await this.httpRequest({
			url: this.host + "recipes/" + this.recipe + "/tiddlers.json",
			data: {
				last_known_revision_id: this.last_known_revision_id,
				include_deleted: "true"
			},
			responseType: "json",
		});

		if (!ok) { return options.callback(err); }
		const { data: tiddlerInfoArray = [] } = result;

		var modifications: string[] = [], deletions: string[] = [];

		$tw.utils.each(tiddlerInfoArray,
			/**
			 * @param {{ title: string; revision_id: number; is_deleted: boolean; bag_name: string; }} tiddlerInfo 
			 */
			function (tiddlerInfo) {
				if (tiddlerInfo.revision_id > self.last_known_revision_id) {
					self.last_known_revision_id = tiddlerInfo.revision_id;
				}
				if (tiddlerInfo.is_deleted) {
					deletions.push(tiddlerInfo.title);
				} else {
					modifications.push(tiddlerInfo.title);
				}
			}
		);

		// Invoke the callback with the results
		options.callback(null, {
			modifications: modifications,
			deletions: deletions
		});

		setTimeout(() => {
			// If Browswer Storage tiddlers were cached on reloading the wiki, add them after sync from server completes in the above callback.
			if ($tw.browserStorage && $tw.browserStorage.isEnabled()) {
				$tw.browserStorage.addCachedTiddlers();
			}
		});
	}
	/*
	Queue a load for a tiddler if there has been an update for it since the specified revision
	*/
	checkLastRecordedUpdate(title: string, revision: string) {
		var lru = this.lastRecordedUpdate[title];
		if (lru) {
			var numRevision = $tw.utils.getInt(revision, 0);
			if (!numRevision) {
				this.logger.log("Error: revision is not a number", revision);
				return;
			}
			console.log(`Checking for updates to ${title} since ${JSON.stringify(revision)} comparing to ${numRevision}`);
			if (lru.revision_id > numRevision) {
				this.syncer && this.syncer.enqueueLoadTiddler(title);
			}
		}
	}
	get syncer() {
		//@ts-expect-error
		if ($tw.syncadaptor === this) return $tw.syncer;
	}
	/*
	Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
	*/
	async saveTiddler(
		tiddler: Tiddler,
		callback: (err: any, adaptorInfo?: { bag: string }, revision?: string) => void,
		options?: {}
	) {
		var self = this, title = tiddler.fields.title;
		if (this.isReadOnly || title.substr(0, MWC_STATE_TIDDLER_PREFIX.length) === MWC_STATE_TIDDLER_PREFIX) {
			return callback(null);
		}
		self.outstandingRequests[title] = { type: "PUT" };
		// TODO: not using getFieldStringBlock because what happens if a field name has a colon in it?
		let body = JSON.stringify(tiddler.getFieldStrings({ exclude: ["text"] }));
		if (tiddler.hasField("text")) {
			if (typeof tiddler.fields.text !== "string" && tiddler.fields.text)
				return callback(new Error("Error saving tiddler " + tiddler.fields.title + ": the text field is truthy but not a string"));
			body += `\n\n${tiddler.fields.text}`
		}

		const [ok, err, result] = await this.httpRequest({
			url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
			type: "PUT",
			headers: {
				"Content-type": "application/x-mws-tiddler"
			},
			data: body,
			responseType: "json",
		});
		delete self.outstandingRequests[title];
		if (!ok) return callback(err);
		const { headers, data } = result;

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
		callback(null, { bag: bag_name }, revision);

	}
	/*
	Load a tiddler and invoke the callback with (err,tiddlerFields)

	The syncer does not pass itself into options.
	*/
	async loadTiddler(title: string, callback: (err: any, fields?: any) => void, options: any) {
		var self = this;
		self.outstandingRequests[title] = { type: "GET" };
		const [ok, err, result] = await this.httpRequest({
			url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
		});
		delete self.outstandingRequests[title];
		if (err === 404) {
			return callback(null, null);
		} else if (!ok) {
			return callback(err);
		}
		const { data, headers } = result;
		const revision = headers["x-revision-number"], bag_name = headers["x-bag-name"];
		// If there has been a more recent update from the server then enqueue a load of this tiddler
		self.checkLastRecordedUpdate(title, revision);
		// Invoke the callback
		self.setTiddlerInfo(title, revision, bag_name);
		callback(null, $tw.utils.parseJSONSafe(data));
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
		const [ok, err, result] = await this.httpRequest({
			url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
			type: "DELETE",
		});
		delete self.outstandingRequests[title];
		if (!ok) { return callback(err); }
		const { data } = result;
		const revision = data.revision_id, bag_name = data.bag_name;
		// If there has been a more recent update from the server then enqueue a load of this tiddler
		self.checkLastRecordedUpdate(title, revision);
		self.removeTiddlerInfo(title);
		// Invoke the callback & return null adaptorInfo
		callback(null, null);
	}
}


if ($tw.browser && document.location.protocol.startsWith("http")) {
	exports.adaptorClass = MultiWikiClientAdaptor;
}
