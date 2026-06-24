/*\
title: $:/plugins/mws/client/new-multiwikiclientadaptor.js
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

// import type { ServerEventsMap } from '@tiddlywiki/events';
// import type { ZodRoute, WikiStatusRoutes, WikiRecipeRoutes } from '@tiddlywiki/mws';
// import type { zod } from '@tiddlywiki/server';
import type { Syncer, Tiddler, TiddlerFields, Wiki } from 'tiddlywiki';

// import {} from "@tiddlywiki/mws-prisma";
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

declare module 'tiddlywiki' {
	export interface Syncer<AD> {
		wiki: Wiki;
		logger: Logger;
		tiddlerInfo: Record<string, {
			changeCount: number,
			adaptorInfo: AD,
			revision: string,
			timestampLastSaved: Date
		}>;
		enqueueLoadTiddler(title: string): void;
		storeTiddler(tiddler: Tiddler): void;
		processTaskQueue(): void;
		syncFromServer(): void;
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

	registerSyncer?(syncer: Syncer<AD>): void;

	getStatus?(
		cb: ServerStatusCallback
	): void;

	getSkinnyTiddlers?(
		cb: (err: any, tiddlerFields: Record<string, string>[]) => void
	): void;
	getUpdatedTiddlers?(
		syncer: Syncer<AD>,
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

	saveTiddlers?(options: {
		syncer: Syncer<AD>,
		tiddlers: Tiddler[],
		onNext: (title: string, adaptorInfo: any, revision: string) => void,
		onDone: () => void,
		onError: (err: Error) => void
	}): void;

	loadTiddlers?(options: {
		syncer: Syncer<AD>,
		titles: string[],
		onNext: (tiddlerFields: TiddlerFields) => void,
		onDone: () => void,
		onError: (err: Error) => void
	}): void;

	deleteTiddlers?(options: {
		syncer: Syncer<AD>,
		titles: string[],
		onNext: (title: string) => void,
		onDone: () => void,
		onError: (err: Error) => void
	}): void;

	setLoggerSaveBuffer?: (loggerForSaving: Logger) => void;
	displayLoginPrompt?(syncer: Syncer<AD>): void;
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

declare const $tw: any;

declare const exports: {
	adaptorClass: typeof MultiWikiClientAdaptor;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONFIG_HOST_TIDDLER = "$:/config/multiwikiclient/host";
const DEFAULT_HOST_TIDDLER = "$protocol$//$host$/";
const CONFIG_RECIPE_TIDDLER = "$:/config/multiwikiclient/recipe";
const IS_DEV_MODE_TIDDLER = "$:/state/multiwikiclient/dev-mode";
const LAST_REVISION_ID_TIDDLER = "$:/state/multiwikiclient/recipe/last_revision_id";
const MWC_STATE_TIDDLER_PREFIX = "$:/state/multiwikiclient/";
const BAG_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/bag";
const REVISION_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/revision";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MWSAdaptorInfo {
	bag: string;
	revision: string;
	title: string;
}

// Status response from GET /recipe/:id/status
interface RecipeStatus {
	isAdmin: boolean;
	user_id: string;
	username: string;
	isLoggedIn: boolean;
	template: { type: string; definition: unknown; parameters: unknown };
	bags: { bag_id: string; bag_name: string; is_writable: boolean; priority: number; canUserWrite: boolean; info: unknown }[];
}

// TiddlerInfo from resolver
interface TiddlerInfo {
	title: string;
	writeTo: string | null;
	readFrom: string | null;
	existsIn: string[];
	canWrite: boolean;
}

type BatchMutationResult = { title: string; info: TiddlerInfo; revision?: string };
type BatchReadResult = { fields: Record<string, any> & { title: string }; info: TiddlerInfo } | null;

// ---------------------------------------------------------------------------
// Adaptor
// ---------------------------------------------------------------------------

class MultiWikiClientAdaptor implements SyncAdaptor<MWSAdaptorInfo> {
	name = "multiwikiclient";

	private wiki: Wiki;
	private host: string;
	private recipe: string;
	private isDevMode: boolean;
	private logger: Logger;
	private syncer: Syncer<MWSAdaptorInfo> | null = null;

	private isLoggedIn = false;
	private isReadOnly = true;
	private offline = false;
	private username = "";
	error: string | null = null;

	private lastSeq = "0";
	private initialLoadDone = false;
	/** title → bag name, populated on load/save */
	private tiddlerBag = new Map<string, string>();
	/** title → revision, populated on save */
	private tiddlerRevision = new Map<string, string>();

	constructor(options: { wiki: Wiki }) {
		this.wiki = options.wiki;
		this.host = this.getHost();
		this.recipe = this.wiki.getTiddlerText(CONFIG_RECIPE_TIDDLER, "")!;
		this.isDevMode = this.wiki.getTiddlerText(IS_DEV_MODE_TIDDLER) === "yes";
		this.lastSeq = this.wiki.getTiddlerText(LAST_REVISION_ID_TIDDLER, "0")!;
		this.initialLoadDone = this.lastSeq !== "0";
		this.logger = new $tw.utils.Logger("MultiWikiClientAdaptor");
	}

	isReady() { return true; }

	setLoggerSaveBuffer(logger: Logger) { this.logger.setSaveBuffer(logger); }

	registerSyncer(syncer: Syncer<MWSAdaptorInfo>) { this.syncer = syncer; }

	private isStateTiddler(title: string) {
		return title.startsWith(MWC_STATE_TIDDLER_PREFIX);
	}

	private setTiddlerInfo(title: string, bag: string | null, revision?: string) {
		if (bag) {
			this.tiddlerBag.set(title, bag);
			this.wiki.setText(BAG_STATE_TIDDLER, null, title, bag, { suppressTimestamp: true });
		} else {
			this.tiddlerBag.delete(title);
			this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
		}
		if (revision) {
			this.tiddlerRevision.set(title, revision);
			this.wiki.setText(REVISION_STATE_TIDDLER, null, title, revision, { suppressTimestamp: true });
		}
	}

	private clearTiddlerInfo(title: string) {
		this.tiddlerBag.delete(title);
		this.tiddlerRevision.delete(title);
		this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
		this.wiki.setText(REVISION_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
	}

	private setLastSeq(seq: string) {
		this.lastSeq = seq;
		this.wiki.setText(LAST_REVISION_ID_TIDDLER, null, "text", seq, { suppressTimestamp: true });
	}

	getTiddlerRevision(title: string) {
		return this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title) ?? "";
	}

	getTiddlerInfo(tiddler: Tiddler): MWSAdaptorInfo | undefined {
		const title = tiddler.fields.title as string;
		const bag = this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title) ?? this.tiddlerBag.get(title);
		const revision = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title) ?? this.tiddlerRevision.get(title);
		return bag && revision ? { bag, revision, title } : undefined;
	}

	private getHost() {
		let text = this.wiki.getTiddlerText(CONFIG_HOST_TIDDLER, DEFAULT_HOST_TIDDLER)!;
		[
			{ name: "protocol", value: document.location.protocol },
			{ name: "host",     value: document.location.host },
			{ name: "pathname", value: document.location.pathname },
		].forEach(({ name, value }) => {
			text = $tw.utils.replaceString(text, new RegExp("\\$" + name + "\\$", "mg"), value);
		});
		return text;
	}

	// -------------------------------------------------------------------------
	// Status
	// -------------------------------------------------------------------------

	async getStatus(callback: ServerStatusCallback) {
		const [ok, , result] = await this.recipeRequest({ method: "GET", url: "/status" });
		if (!ok && result?.status === 0) {
			this.offline = true;
			this.isLoggedIn = false;
			this.isReadOnly = true;
			this.username = "(offline)";
			this.error = "The webpage is forbidden from contacting the server.";
		} else if (ok) {
			const status = result!.responseJSON as RecipeStatus;
			this.offline = false;
			this.error = null;
			this.isLoggedIn = status?.isLoggedIn ?? false;
			this.username = status?.username ?? "(anon)";
			this.isReadOnly = !(status?.bags?.some(b => b.canUserWrite) ?? false);
		} else {
			this.error = `Server error ${result?.status}`;
		}
		callback(this.error, this.isLoggedIn, this.username, this.isReadOnly, false);
	}

	// -------------------------------------------------------------------------
	// Update polling
	// -------------------------------------------------------------------------

	async getUpdatedTiddlers(
		_syncer: Syncer<MWSAdaptorInfo>,
		callback: (err: any, updates?: { modifications: string[]; deletions: string[] }) => void
	) {
		if (this.offline) return callback(null);
		try {
			if (!this.initialLoadDone) {
				// Fetch full list + current lastSeq in parallel on first load
				const [[listOk, , listResult], [updOk, , updResult]] = await Promise.all([
					this.recipeRequest({ method: "GET", url: "/list.json" }),
					this.recipeRequest({ method: "GET", url: "/updates", queryParams: { since: "0" } }),
				]);
				if (!listOk) throw new Error("Failed to fetch tiddler list");
				if (!updOk) throw new Error("Failed to fetch updates");
				const list = listResult!.responseJSON as TiddlerInfo[];
				const upd = updResult!.responseJSON as { modifications: string[]; deletions: string[]; lastSeq: string };
				this.setLastSeq(upd.lastSeq);
				this.initialLoadDone = true;
				callback(null, { modifications: list.map(t => t.title), deletions: [] });
			} else {
				const [ok, , result] = await this.recipeRequest({
					method: "GET",
					url: "/updates",
					queryParams: { since: this.lastSeq },
				});
				if (!ok) throw new Error("Failed to fetch updates");
				const upd = result!.responseJSON as { modifications: string[]; deletions: string[]; lastSeq: string };
				this.setLastSeq(upd.lastSeq);
				callback(null, { modifications: upd.modifications, deletions: upd.deletions });
			}
		} catch (e: any) {
			callback(e);
		}
	}

	// -------------------------------------------------------------------------
	// Batch operations (new API)
	// -------------------------------------------------------------------------

	async loadTiddlers(options: {
		syncer: Syncer<MWSAdaptorInfo>;
		titles: string[];
		onNext: (fields: TiddlerFields) => void;
		onDone: () => void;
		onError: (err: Error) => void;
	}) {
		const { titles, onNext, onDone, onError } = options;
		try {
			const results = await this.batchOp<BatchReadResult[]>("read", { titles });
			for (const item of results) {
				if (!item) continue;
				this.setTiddlerInfo(item.fields.title, item.info.readFrom, typeof item.fields.revision === "string" ? item.fields.revision : undefined);
				onNext(item.fields as TiddlerFields);
			}
			onDone();
		} catch (e: any) { onError(e); }
	}

	async saveTiddlers(options: {
		syncer: Syncer<MWSAdaptorInfo>;
		tiddlers: Tiddler[];
		onNext: (title: string, adaptorInfo: MWSAdaptorInfo, revision: string) => void;
		onDone: () => void;
		onError: (err: Error) => void;
	}) {
		const { tiddlers, onNext, onDone, onError } = options;
		try {
			const results = await this.batchOp<BatchMutationResult[]>("save", {
				tiddlers: tiddlers.map(t => t.getFieldStrings()),
			});
			for (const item of results) {
				const bag = item.info.writeTo ?? item.info.readFrom ?? "";
				this.setTiddlerInfo(item.title, bag || null, item.revision ?? "");
				if ($tw.browserStorage?.isEnabled()) $tw.browserStorage.removeTiddlerFromLocalStorage(item.title);
				onNext(item.title, { bag, revision: item.revision ?? "", title: item.title }, item.revision ?? "");
			}
			onDone();
		} catch (e: any) { onError(e); }
	}

	async deleteTiddlers(options: {
		syncer: Syncer<MWSAdaptorInfo>;
		titles: string[];
		onNext: (title: string) => void;
		onDone: () => void;
		onError: (err: Error) => void;
	}) {
		const { titles, onNext, onDone, onError } = options;
		try {
			const results = await this.batchOp<BatchMutationResult[]>("delete", { titles });
			for (const item of results) {
				this.clearTiddlerInfo(item.title);
				onNext(item.title);
			}
			onDone();
		} catch (e: any) { onError(e); }
	}

	// -------------------------------------------------------------------------
	// Single-tiddler operations (fallback for older server versions)
	// -------------------------------------------------------------------------

	async saveTiddler(
		tiddler: Tiddler,
		callback: (err: any, adaptorInfo?: MWSAdaptorInfo, revision?: string) => void
	) {
		const title = tiddler.fields.title as string;
		if (title === "$:/StoryList" || this.isReadOnly || this.isStateTiddler(title)) return callback(null);
		try {
			const results = await this.batchOp<BatchMutationResult[]>("save", { tiddlers: [tiddler.getFieldStrings()] });
			const item = results[0];
			if (!item) return callback(new Error("No result returned"));
			const bag = item.info.writeTo ?? item.info.readFrom ?? "";
			this.setTiddlerInfo(title, bag || null, item.revision ?? "");
			if ($tw.browserStorage?.isEnabled()) $tw.browserStorage.removeTiddlerFromLocalStorage(title);
			callback(null, { bag, revision: item.revision ?? "", title }, item.revision ?? "");
		} catch (e: any) { callback(e); }
	}

	async loadTiddler(title: string, callback: (err: any, fields?: any) => void, _options: any) {
		try {
			const results = await this.batchOp<BatchReadResult[]>("read", { titles: [title] });
			const item = results[0];
			if (!item) return callback(null, null);
			this.setTiddlerInfo(title, item.info.readFrom, typeof item.fields.revision === "string" ? item.fields.revision : undefined);
			callback(null, item.fields);
		} catch (e: any) { callback(e); }
	}

	async deleteTiddler(title: string, callback: (err: any, adaptorInfo?: any) => void, _options: any) {
		if (this.isReadOnly) return callback(null);
		try {
			const results = await this.batchOp<BatchMutationResult[]>("delete", { titles: [title] });
			const item = results[0];
			if (!item) return callback(new Error("No result returned"));
			this.clearTiddlerInfo(title);
			callback(null, null);
		} catch (e: any) { callback(e); }
	}

	// -------------------------------------------------------------------------
	// HTTP helpers
	// -------------------------------------------------------------------------

	private async batchOp<T>(op: string, body: Record<string, any>): Promise<T> {
		const [ok, err, result] = await this.recipeRequest({
			method: "PUT",
			url: "/batch/" + op,
			requestBodyString: JSON.stringify(body),
			headers: { "content-type": "application/json" },
		});
		if (!ok) throw err;
		if (!result!.responseJSON) throw new Error("No response JSON from batch/" + op);
		return result!.responseJSON as T;
	}

	private async recipeRequest(options: {
		method: string;
		url: string;
		headers?: HeadersInit;
		queryParams?: Record<string, string>;
		requestBodyString?: string;
	}) {
		if (!options.url.startsWith("/")) throw new Error("URL must start with /");
		const isDevMode = this.isDevMode;
		return httpRequest({
			...options,
			responseType: "blob",
			url: this.host + "recipe/" + encodeURIComponent(this.recipe) + options.url,
		}).then(async e => {
			if (!e.ok) return [false, new Error(
				`Server returned ${e.status}: ${e.headers.get("x-reason") ?? "(no reason)"}`
			), { ...e, responseJSON: undefined }] as const;

			let responseString: string;
			if (e.headers.get("x-gzip-stream") === "yes") {
				responseString = await new Promise<string>((resolve) => {
					let s = "";
					const gz = new fflate.AsyncGunzip((err, chunk, final) => {
						if (err) return;
						s += fflate.strFromU8(chunk);
						if (final) resolve(s);
					});
					if (isDevMode) gz.onmember = m => console.log("gunzip member", m);
					readBlobAsArrayBuffer(e.response as Blob).then(buf => {
						gz.push(new Uint8Array(buf));
						gz.push(new Uint8Array(0), true);
					});
				});
			} else {
				responseString = fflate.strFromU8(new Uint8Array(await readBlobAsArrayBuffer(e.response as Blob)));
			}

			return [true, undefined, {
				...e,
				responseJSON: e.status === 200 ? tryParseJSON(responseString) : undefined,
			}] as const;
		}, e => [false, e, undefined] as const);
	}
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function tryParseJSON(s: string) {
	try { return JSON.parse(s); } catch (e) { console.error("JSON parse error", e); return undefined; }
}

type ParamsInput = URLSearchParams | [string, string][] | object | string | undefined;

interface HttpRequestOptions<TYPE extends "arraybuffer" | "blob" | "text"> {
	method: string;
	url: string;
	responseType: TYPE;
	headers?: HeadersInit;
	queryParams?: ParamsInput;
	requestBodyString?: string;
}

function httpRequest<TYPE extends "arraybuffer" | "blob" | "text">(options: HttpRequestOptions<TYPE>) {
	return new Promise<{
		ok: boolean; status: number; statusText: string; headers: Headers;
		response: TYPE extends "arraybuffer" ? ArrayBuffer : TYPE extends "blob" ? Blob : string;
	}>((resolve, reject) => {
		options.method = options.method.toUpperCase();
		const url = new URL(options.url, location.href);
		paramsInput(options.queryParams).forEach((v, k) => url.searchParams.append(k, v));
		const headers = new Headers(options.headers || {});
		const request = new XMLHttpRequest();
		request.responseType = options.responseType;
		request.open(options.method, url, true);
		if (!headers.has("content-type")) headers.set("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
		if (!headers.has("x-requested-with")) headers.set("x-requested-with", "TiddlyWiki");
		headers.set("accept", "application/json");
		headers.forEach((v, k) => request.setRequestHeader(k, v));
		request.onreadystatechange = function () {
			if (this.readyState !== 4) return;
			const h = new Headers();
			request.getAllResponseHeaders()?.trim().split(/[\r\n]+/).forEach(line => {
				const parts = line.split(": ");
				const key = parts.shift()?.toLowerCase();
				if (key) h.append(key, parts.join(": "));
			});
			resolve({ ok: this.status >= 200 && this.status < 300, status: this.status, statusText: this.statusText, response: this.response, headers: h });
		};
		request.send(options.requestBodyString);
	});

	function paramsInput(input: ParamsInput) {
		if (!input) return new URLSearchParams();
		if (input instanceof URLSearchParams) return input;
		if (Array.isArray(input) || typeof input === "string") return new URLSearchParams(input);
		const params = new URLSearchParams();
		for (const key in input) {
			if (Object.prototype.hasOwnProperty.call(input, key)) {
				params.append(key, (input as Record<string, string>)[key]);
			}
		}
		return params;
	}
}

function readBlobAsArrayBuffer(blob: Blob) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = () => reject(new Error("Error reading blob"));
		reader.readAsArrayBuffer(blob);
	});
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

if ($tw.browser && document.location.protocol.startsWith("http")) {
	exports.adaptorClass = MultiWikiClientAdaptor;
}
