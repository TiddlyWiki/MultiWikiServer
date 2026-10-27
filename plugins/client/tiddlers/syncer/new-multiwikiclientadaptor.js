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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const STATUS_TIDDLER = "$:/config/multiwikiclient/status";
// ---------------------------------------------------------------------------
// Adaptor
// ---------------------------------------------------------------------------
class MultiWikiClientAdaptor {
    constructor(options) {
        this.name = "multiwikiclient";
        this.syncer = null;
        this.isLoggedIn = false;
        this.isReadOnly = true;
        this.offline = false;
        this.username = "";
        this.error = null;
        this.lastSeq = "0";
        this.initialLoadDone = false;
        /** title → bag name, populated on load/save */
        this.tiddlerBag = new Map();
        /** title → revision, populated on save */
        this.tiddlerRevision = new Map();
        this.wiki = options.wiki;
        this.host = this.getHost();
        this.recipe = this.wiki.getTiddlerText(CONFIG_RECIPE_TIDDLER, "");
        this.isDevMode = this.wiki.getTiddlerText(IS_DEV_MODE_TIDDLER) === "yes";
        this.lastSeq = this.wiki.getTiddlerText(LAST_REVISION_ID_TIDDLER, "0");
        this.status = JSON.parse(this.wiki.getTiddlerText(STATUS_TIDDLER));
        this.initialLoadDone = this.lastSeq !== "0";
        this.logger = new $tw.utils.Logger("MultiWikiClientAdaptor");
    }
    isReady() { return true; }
    setLoggerSaveBuffer(logger) { this.logger.setSaveBuffer(logger); }
    registerSyncer(syncer) { this.syncer = syncer; }
    isStateTiddler(title) {
        return title.startsWith(MWC_STATE_TIDDLER_PREFIX);
    }
    setTiddlerInfo(title, bag, revision) {
        if (bag) {
            this.tiddlerBag.set(title, bag);
            this.wiki.setText(BAG_STATE_TIDDLER, null, title, bag, { suppressTimestamp: true });
        }
        else {
            this.tiddlerBag.delete(title);
            this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
        }
        if (revision) {
            this.tiddlerRevision.set(title, revision);
            this.wiki.setText(REVISION_STATE_TIDDLER, null, title, revision, { suppressTimestamp: true });
        }
    }
    clearTiddlerInfo(title) {
        this.tiddlerBag.delete(title);
        this.tiddlerRevision.delete(title);
        this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
        this.wiki.setText(REVISION_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
    }
    setLastSeq(seq) {
        this.lastSeq = seq;
        this.wiki.setText(LAST_REVISION_ID_TIDDLER, null, "text", seq, { suppressTimestamp: true });
    }
    getTiddlerRevision(title) {
        var _a;
        return (_a = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title)) !== null && _a !== void 0 ? _a : "";
    }
    getTiddlerInfo(tiddler) {
        var _a, _b;
        const title = tiddler.fields.title;
        const bag = (_a = this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title)) !== null && _a !== void 0 ? _a : this.tiddlerBag.get(title);
        const revision = (_b = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title)) !== null && _b !== void 0 ? _b : this.tiddlerRevision.get(title);
        return bag && revision ? { bag, revision, title } : undefined;
    }
    getHost() {
        let text = this.wiki.getTiddlerText(CONFIG_HOST_TIDDLER, DEFAULT_HOST_TIDDLER);
        [
            { name: "protocol", value: document.location.protocol },
            { name: "host", value: document.location.host },
            { name: "pathname", value: document.location.pathname },
        ].forEach(({ name, value }) => {
            text = $tw.utils.replaceString(text, new RegExp("\\$" + name + "\\$", "mg"), value);
        });
        return text;
    }
    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    getStatus(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const status = this.status;
            this.offline = false;
            this.error = null;
            this.isLoggedIn = (_a = status === null || status === void 0 ? void 0 : status.isLoggedIn) !== null && _a !== void 0 ? _a : false;
            this.username = (_b = status === null || status === void 0 ? void 0 : status.username) !== null && _b !== void 0 ? _b : "(anon)";
            this.isReadOnly = !((_d = (_c = status === null || status === void 0 ? void 0 : status.bags) === null || _c === void 0 ? void 0 : _c.some(b => b.canUserWrite)) !== null && _d !== void 0 ? _d : false);
            callback(this.error, this.isLoggedIn, this.username, this.isReadOnly, false);
        });
    }
    // -------------------------------------------------------------------------
    // Update polling
    // -------------------------------------------------------------------------
    getUpdatedTiddlers(_syncer, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.offline)
                return callback(null);
            try {
                if (!this.initialLoadDone) {
                    // Fetch full list + current lastSeq in parallel on first load
                    const [[listOk, , listResult], [updOk, , updResult]] = yield Promise.all([
                        this.recipeRequest({ method: "GET", url: "/list.json" }),
                        this.recipeRequest({ method: "GET", url: "/updates", queryParams: { since: "0" } }),
                    ]);
                    if (!listOk)
                        throw new Error("Failed to fetch tiddler list");
                    if (!updOk)
                        throw new Error("Failed to fetch updates");
                    const list = listResult.responseJSON;
                    const upd = updResult.responseJSON;
                    this.setLastSeq(upd.lastSeq);
                    this.initialLoadDone = true;
                    callback(null, { modifications: list.map(t => t.title), deletions: [] });
                }
                else {
                    const [ok, , result] = yield this.recipeRequest({
                        method: "GET",
                        url: "/updates",
                        queryParams: { since: this.lastSeq },
                    });
                    if (!ok)
                        throw new Error("Failed to fetch updates");
                    const upd = result.responseJSON;
                    this.setLastSeq(upd.lastSeq);
                    callback(null, { modifications: upd.modifications, deletions: upd.deletions });
                }
            }
            catch (e) {
                callback(e);
            }
        });
    }
    // -------------------------------------------------------------------------
    // Batch operations (new API)
    // -------------------------------------------------------------------------
    loadTiddlers(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { titles, onNext, onDone, onError } = options;
            try {
                const results = yield this.batchOp("read", { titles });
                for (const item of results) {
                    if (!item)
                        continue;
                    this.setTiddlerInfo(item.fields.title, item.info.readFrom, typeof item.fields.revision === "string" ? item.fields.revision : undefined);
                    onNext(item.fields);
                }
                onDone();
            }
            catch (e) {
                onError(e);
            }
        });
    }
    saveTiddlers(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const { tiddlers, onNext, onDone, onError } = options;
            try {
                const results = yield this.batchOp("save", {
                    tiddlers: tiddlers.map(t => t.getFieldStrings()),
                });
                for (const item of results) {
                    const bag = (_b = (_a = item.info.writeTo) !== null && _a !== void 0 ? _a : item.info.readFrom) !== null && _b !== void 0 ? _b : "";
                    this.setTiddlerInfo(item.title, bag || null, (_c = item.revision) !== null && _c !== void 0 ? _c : "");
                    if ((_d = $tw.browserStorage) === null || _d === void 0 ? void 0 : _d.isEnabled())
                        $tw.browserStorage.removeTiddlerFromLocalStorage(item.title);
                    onNext(item.title, { bag, revision: (_e = item.revision) !== null && _e !== void 0 ? _e : "", title: item.title }, (_f = item.revision) !== null && _f !== void 0 ? _f : "");
                }
                onDone();
            }
            catch (e) {
                onError(e);
            }
        });
    }
    deleteTiddlers(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { titles, onNext, onDone, onError } = options;
            try {
                const results = yield this.batchOp("delete", { titles });
                for (const item of results) {
                    this.clearTiddlerInfo(item.title);
                    onNext(item.title);
                }
                onDone();
            }
            catch (e) {
                onError(e);
            }
        });
    }
    // -------------------------------------------------------------------------
    // Single-tiddler operations (fallback for older server versions)
    // -------------------------------------------------------------------------
    saveTiddler(tiddler, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const title = tiddler.fields.title;
            if (title === "$:/StoryList" || this.isReadOnly || this.isStateTiddler(title))
                return callback(null);
            try {
                const results = yield this.batchOp("save", { tiddlers: [tiddler.getFieldStrings()] });
                const item = results[0];
                if (!item)
                    return callback(new Error("No result returned"));
                const bag = (_b = (_a = item.info.writeTo) !== null && _a !== void 0 ? _a : item.info.readFrom) !== null && _b !== void 0 ? _b : "";
                this.setTiddlerInfo(title, bag || null, (_c = item.revision) !== null && _c !== void 0 ? _c : "");
                if ((_d = $tw.browserStorage) === null || _d === void 0 ? void 0 : _d.isEnabled())
                    $tw.browserStorage.removeTiddlerFromLocalStorage(title);
                callback(null, { bag, revision: (_e = item.revision) !== null && _e !== void 0 ? _e : "", title }, (_f = item.revision) !== null && _f !== void 0 ? _f : "");
            }
            catch (e) {
                callback(e);
            }
        });
    }
    loadTiddler(title, callback, _options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield this.batchOp("read", { titles: [title] });
                const item = results[0];
                if (!item)
                    return callback(null, null);
                this.setTiddlerInfo(title, item.info.readFrom, typeof item.fields.revision === "string" ? item.fields.revision : undefined);
                callback(null, item.fields);
            }
            catch (e) {
                callback(e);
            }
        });
    }
    deleteTiddler(title, callback, _options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isReadOnly)
                return callback(null);
            try {
                const results = yield this.batchOp("delete", { titles: [title] });
                const item = results[0];
                if (!item)
                    return callback(new Error("No result returned"));
                this.clearTiddlerInfo(title);
                callback(null, null);
            }
            catch (e) {
                callback(e);
            }
        });
    }
    // -------------------------------------------------------------------------
    // HTTP helpers
    // -------------------------------------------------------------------------
    batchOp(op, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ok, err, result] = yield this.recipeRequest({
                method: "PUT",
                url: "/batch/" + op,
                requestBodyString: JSON.stringify(body),
                headers: { "content-type": "application/json" },
            });
            if (!ok)
                throw err;
            if (!result.responseJSON)
                throw new Error("No response JSON from batch/" + op);
            return result.responseJSON;
        });
    }
    recipeRequest(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options.url.startsWith("/"))
                throw new Error("URL must start with /");
            if (!options.headers)
                options.headers = {};
            if (!options.headers.authorization) {
                options.headers.authorization = "Bearer " + this.status.pageToken;
            }
            const isDevMode = this.isDevMode;
            return httpRequest(Object.assign(Object.assign({}, options), { responseType: "blob", url: this.host + "/" + encodeURIComponent(this.recipe) + options.url })).then((e) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!e.ok)
                    return [false, new Error(`Server returned ${e.status}: ${(_a = e.headers.get("x-reason")) !== null && _a !== void 0 ? _a : "(no reason)"}`), Object.assign(Object.assign({}, e), { responseJSON: undefined })];
                let responseString;
                if (e.headers.get("x-gzip-stream") === "yes") {
                    responseString = yield new Promise((resolve) => {
                        let s = "";
                        const gz = new fflate.AsyncGunzip((err, chunk, final) => {
                            if (err)
                                return;
                            s += fflate.strFromU8(chunk);
                            if (final)
                                resolve(s);
                        });
                        if (isDevMode)
                            gz.onmember = m => console.log("gunzip member", m);
                        readBlobAsArrayBuffer(e.response).then(buf => {
                            gz.push(new Uint8Array(buf));
                            gz.push(new Uint8Array(0), true);
                        });
                    });
                }
                else {
                    responseString = fflate.strFromU8(new Uint8Array(yield readBlobAsArrayBuffer(e.response)));
                }
                return [true, undefined, Object.assign(Object.assign({}, e), { responseJSON: e.status === 200 ? tryParseJSON(responseString) : undefined })];
            }), e => [false, e, undefined]);
        });
    }
}
// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function tryParseJSON(s) {
    try {
        return JSON.parse(s);
    }
    catch (e) {
        console.error("JSON parse error", e);
        return undefined;
    }
}
function httpRequest(options) {
    return new Promise((resolve, reject) => {
        options.method = options.method.toUpperCase();
        const url = new URL(options.url, location.href);
        paramsInput(options.queryParams).forEach((v, k) => url.searchParams.append(k, v));
        const headers = new Headers(options.headers || {});
        const request = new XMLHttpRequest();
        request.responseType = options.responseType;
        request.open(options.method, url, true);
        if (!headers.has("content-type"))
            headers.set("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        if (!headers.has("x-requested-with"))
            headers.set("x-requested-with", "TiddlyWiki");
        headers.set("accept", "application/json");
        headers.forEach((v, k) => request.setRequestHeader(k, v));
        request.onreadystatechange = function () {
            var _a;
            if (this.readyState !== 4)
                return;
            const h = new Headers();
            (_a = request.getAllResponseHeaders()) === null || _a === void 0 ? void 0 : _a.trim().split(/[\r\n]+/).forEach(line => {
                var _a;
                const parts = line.split(": ");
                const key = (_a = parts.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (key)
                    h.append(key, parts.join(": "));
            });
            resolve({ ok: this.status >= 200 && this.status < 300, status: this.status, statusText: this.statusText, response: this.response, headers: h });
        };
        request.send(options.requestBodyString);
    });
    function paramsInput(input) {
        if (!input)
            return new URLSearchParams();
        if (input instanceof URLSearchParams)
            return input;
        if (Array.isArray(input) || typeof input === "string")
            return new URLSearchParams(input);
        const params = new URLSearchParams();
        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                params.append(key, input[key]);
            }
        }
        return params;
    }
}
function readBlobAsArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LW11bHRpd2lraWNsaWVudGFkYXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmV3LW11bHRpd2lraWNsaWVudGFkYXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFFSCxrRUFBa0U7QUFDbEUsWUFBWSxDQUFDOzs7Ozs7Ozs7OztBQXNLYiw4RUFBOEU7QUFDOUUsWUFBWTtBQUNaLDhFQUE4RTtBQUU5RSxNQUFNLG1CQUFtQixHQUFHLGdDQUFnQyxDQUFDO0FBQzdELE1BQU0sb0JBQW9CLEdBQUcscUJBQXFCLENBQUM7QUFDbkQsTUFBTSxxQkFBcUIsR0FBRyxrQ0FBa0MsQ0FBQztBQUNqRSxNQUFNLG1CQUFtQixHQUFHLG1DQUFtQyxDQUFDO0FBQ2hFLE1BQU0sd0JBQXdCLEdBQUcsa0RBQWtELENBQUM7QUFDcEYsTUFBTSx3QkFBd0IsR0FBRywyQkFBMkIsQ0FBQztBQUM3RCxNQUFNLGlCQUFpQixHQUFHLHVDQUF1QyxDQUFDO0FBQ2xFLE1BQU0sc0JBQXNCLEdBQUcsNENBQTRDLENBQUM7QUFDNUUsTUFBTSxjQUFjLEdBQUcsa0NBQWtDLENBQUM7QUFtQzFELDhFQUE4RTtBQUM5RSxVQUFVO0FBQ1YsOEVBQThFO0FBRTlFLE1BQU0sc0JBQXNCO0lBd0IzQixZQUFZLE9BQXVCO1FBdkJuQyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFPakIsV0FBTSxHQUFrQyxJQUFJLENBQUM7UUFFN0MsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN0QixVQUFLLEdBQWtCLElBQUksQ0FBQztRQUVwQixZQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2Qsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDaEMsK0NBQStDO1FBQ3ZDLGVBQVUsR0FBRyxJ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QUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFHLEtBQWdDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1RCxDQUFDO1FBQ0YsQ0FBQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztBQUNGLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQVU7SUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFxQixDQUFDLENBQUM7UUFDNUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCw4RUFBOEU7QUFDOUUsU0FBUztBQUNULDhFQUE4RTtBQUU5RSxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDbEUsT0FBTyxDQUFDLFlBQVksR0FBRyxzQkFBc0IsQ0FBQztBQUMvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcXFxudGl0bGU6ICQ6L3BsdWdpbnMvbXdzL2NsaWVudC9uZXctbXVsdGl3aWtpY2xpZW50YWRhcHRvci5qc1xudHlwZTogYXBwbGljYXRpb24vamF2YXNjcmlwdFxubW9kdWxlLXR5cGU6IHN5bmNhZGFwdG9yXG5cbkEgc3luYyBhZGFwdG9yIG1vZHVsZSBmb3Igc3luY2hyb25pc2luZyB3aXRoIE11bHRpV2lraVNlcnZlci1jb21wYXRpYmxlIHNlcnZlcnMuIFxuXG5JdCBoYXMgdGhyZWUga2V5IGFyZWFzIG9mIGNvbmNlcm46XG5cbiogQmFzaWMgb3BlcmF0aW9ucyBsaWtlIHB1dCwgZ2V0LCBhbmQgZGVsZXRlIGEgdGlkZGxlciBvbiB0aGUgc2VydmVyXG4qIFJlYWwgdGltZSB1cGRhdGVzIGZyb20gdGhlIHNlcnZlciAoaGFuZGxlZCBieSBTU0UpXG4qIEJhZ3MgYW5kIHJlY2lwZXMsIHdoaWNoIGFyZSB1bmtub3duIHRvIHRoZSBzeW5jZXJcblxuQSBrZXkgYXNwZWN0IG9mIHRoZSBkZXNpZ24gaXMgdGhhdCB0aGUgc3luY2VyIG5ldmVyIG92ZXJsYXBzIGJhc2ljIHNlcnZlciBvcGVyYXRpb25zOyBpdCB3YWl0cyBmb3IgdGhlXG5wcmV2aW91cyBvcGVyYXRpb24gdG8gY29tcGxldGUgYmVmb3JlIHNlbmRpbmcgYSBuZXcgb25lLlxuXG5cXCovXG5cbi8vIHRoZSBibGFuayBsaW5lIGlzIGltcG9ydGFudCwgYW5kIHNvIGlzIHRoZSBmb2xsb3dpbmcgdXNlIHN0cmljdFxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIGltcG9ydCB0eXBlIHsgU2VydmVyRXZlbnRzTWFwIH0gZnJvbSAnQHRpZGRseXdpa2kvZXZlbnRzJztcbi8vIGltcG9ydCB0eXBlIHsgWm9kUm91dGUsIFdpa2lTdGF0dXNSb3V0ZXMsIFdpa2lSZWNpcGVSb3V0ZXMgfSBmcm9tICdAdGlkZGx5d2lraS9td3MnO1xuLy8gaW1wb3J0IHR5cGUgeyB6b2QgfSBmcm9tICdAdGlkZGx5d2lraS9zZXJ2ZXInO1xuaW1wb3J0IHR5cGUgeyBTeW5jZXIsIFRpZGRsZXIsIFRpZGRsZXJGaWVsZHMsIFdpa2kgfSBmcm9tICd0aWRkbHl3aWtpJztcblxuLy8gaW1wb3J0IHt9IGZyb20gXCJAdGlkZGx5d2lraS9td3MtcHJpc21hXCI7XG5kZWNsYXJlIGdsb2JhbCB7IGNvbnN0IGZmbGF0ZTogdHlwZW9mIGltcG9ydChcIi4vZmZsYXRlXCIpOyB9XG5kZWNsYXJlIGNvbnN0IHNlbGY6IG5ldmVyO1xuXG5kZWNsYXJlIGNsYXNzIExvZ2dlciB7XG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudE5hbWU6IGFueSwgb3B0aW9uczogYW55KTtcblx0Y29tcG9uZW50TmFtZTogYW55O1xuXHRjb2xvdXI6IGFueTtcblx0ZW5hYmxlOiBhbnk7XG5cdHNhdmU6IGFueTtcblx0c2F2ZUxpbWl0OiBhbnk7XG5cdHNhdmVCdWZmZXJMb2dnZXI6IHRoaXM7XG5cdGJ1ZmZlcjogc3RyaW5nO1xuXHRhbGVydENvdW50OiBudW1iZXI7XG5cdHNldFNhdmVCdWZmZXIobG9nZ2VyOiBhbnkpOiB2b2lkO1xuXHRsb2coLi4uYXJnczogYW55W10pOiBhbnk7XG5cdGdldEJ1ZmZlcigpOiBzdHJpbmc7XG5cdHRhYmxlKHZhbHVlOiBhbnkpOiB2b2lkO1xuXHRhbGVydCguLi5hcmdzOiBhbnlbXSk6IHZvaWQ7XG5cdGNsZWFyQWxlcnRzKCk6IHZvaWQ7XG59XG5cbmRlY2xhcmUgbW9kdWxlICd0aWRkbHl3aWtpJyB7XG5cdGV4cG9ydCBpbnRlcmZhY2UgU3luY2VyPEFEPiB7XG5cdFx0d2lraTogV2lraTtcblx0XHRsb2dnZXI6IExvZ2dlcjtcblx0XHR0aWRkbGVySW5mbzogUmVjb3JkPHN0cmluZywge1xuXHRcdFx0Y2hhbmdlQ291bnQ6IG51bWJlcixcblx0XHRcdGFkYXB0b3JJbmZvOiBBRCxcblx0XHRcdHJldmlzaW9uOiBzdHJpbmcsXG5cdFx0XHR0aW1lc3RhbXBMYXN0U2F2ZWQ6IERhdGVcblx0XHR9Pjtcblx0XHRlbnF1ZXVlTG9hZFRpZGRsZXIodGl0bGU6IHN0cmluZyk6IHZvaWQ7XG5cdFx0c3RvcmVUaWRkbGVyKHRpZGRsZXI6IFRpZGRsZXIpOiB2b2lkO1xuXHRcdHByb2Nlc3NUYXNrUXVldWUoKTogdm9pZDtcblx0XHRzeW5jRnJvbVNlcnZlcigpOiB2b2lkO1xuXHR9XG5cdGludGVyZmFjZSBJVGlkZGx5V2lraSB7XG5cdFx0YnJvd3NlclN0b3JhZ2U6IGFueTtcblx0fVxufVxuXG50eXBlIFNlcnZlclN0YXR1c0NhbGxiYWNrID0gKFxuXHRlcnI6IGFueSxcblx0LyoqIFxuXHQgKiAkOi9zdGF0dXMvSXNMb2dnZWRJbiBtb3N0bHkgYXBwZWFycyBhbG9uZ3NpZGUgdGhlIHVzZXJuYW1lIFxuXHQgKiBvciBvdGhlciBsb2dpbi1jb25kaXRpb25hbCBiZWhhdmlvci4gXG5cdCAqL1xuXHRpc0xvZ2dlZEluPzogYm9vbGVhbixcblx0LyoqXG5cdCAqICQ6L3N0YXR1cy9Vc2VyTmFtZSBpcyBzdGlsbCB1c2VkIGZvciB0aGluZ3MgbGlrZSBkcmFmdHMgZXZlbiBpZiB0aGUgXG5cdCAqIHVzZXIgaXNuJ3QgbG9nZ2VkIGluLCBhbHRob3VnaCB0aGUgdXNlcm5hbWUgaXMgbGVzcyBsaWtlbHkgdG8gYmUgc2hvd24gXG5cdCAqIHRvIHRoZSB1c2VyLiBcblx0ICovXG5cdHVzZXJuYW1lPzogc3RyaW5nLFxuXHQvKiogXG5cdCAqICQ6L3N0YXR1cy9Jc1JlYWRPbmx5IHB1dHMgdGhlIFVJIGluIHJlYWRvbmx5IG1vZGUsIFxuXHQgKiBidXQgZG9lcyBub3QgcHJldmVudCBhdXRvbWF0aWMgY2hhbmdlcyBmcm9tIGF0dGVtcHRpbmcgdG8gc2F2ZS4gXG5cdCAqL1xuXHRpc1JlYWRPbmx5PzogYm9vbGVhbixcblx0LyoqIFxuXHQgKiAkOi9zdGF0dXMvSXNBbm9ueW1vdXMgZG9lcyBub3QgYXBwZWFyIGFueXdoZXJlIGluIHRoZSBUVzUgcmVwbyEgXG5cdCAqIFNvIGl0IGhhcyBubyBhcHBhcmVudCBwdXJwb3NlLiBcblx0ICovXG5cdGlzQW5vbnltb3VzPzogYm9vbGVhblxuKSA9PiB2b2lkXG5cbmludGVyZmFjZSBTeW5jQWRhcHRvcjxBRD4ge1xuXHRuYW1lPzogc3RyaW5nO1xuXG5cdGlzUmVhZHk/KCk6IGJvb2xlYW47XG5cblx0cmVnaXN0ZXJTeW5jZXI/KHN5bmNlcjogU3luY2VyPEFEPik6IHZvaWQ7XG5cblx0Z2V0U3RhdHVzPyhcblx0XHRjYjogU2VydmVyU3RhdHVzQ2FsbGJhY2tcblx0KTogdm9pZDtcblxuXHRnZXRTa2lubnlUaWRkbGVycz8oXG5cdFx0Y2I6IChlcnI6IGFueSwgdGlkZGxlckZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPltdKSA9PiB2b2lkXG5cdCk6IHZvaWQ7XG5cdGdldFVwZGF0ZWRUaWRkbGVycz8oXG5cdFx0c3luY2VyOiBTeW5jZXI8QUQ+LFxuXHRcdGNiOiAoXG5cdFx0XHRlcnI6IGFueSxcblx0XHRcdC8qKiBBcnJheXMgb2YgdGl0bGVzIHRoYXQgaGF2ZSBiZWVuIG1vZGlmaWVkIG9yIGRlbGV0ZWQgKi9cblx0XHRcdHVwZGF0ZXM/OiB7IG1vZGlmaWNhdGlvbnM6IHN0cmluZ1tdLCBkZWxldGlvbnM6IHN0cmluZ1tdIH1cblx0XHQpID0+IHZvaWRcblx0KTogdm9pZDtcblxuXHQvKiogXG5cdCAqIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgU3luY2VyIGdldFRpZGRsZXJSZXZpc2lvbiBiZWhhdmlvclxuXHQgKiBvZiByZXR1cm5pbmcgdGhlIHJldmlzaW9uIGZpZWxkXG5cdCAqIFxuXHQgKi9cblx0Z2V0VGlkZGxlclJldmlzaW9uPyh0aXRsZTogc3RyaW5nKTogc3RyaW5nO1xuXHQvKiogXG5cdCAqIHVzZWQgdG8gZ2V0IHRoZSBhZGFwdGVyIGluZm8gZnJvbSBhIHRpZGRsZXIgaW4gc2l0dWF0aW9uc1xuXHQgKiBvdGhlciB0aGFuIHRoZSBzYXZlVGlkZGxlciBjYWxsYmFja1xuXHQgKi9cblx0Z2V0VGlkZGxlckluZm8odGlkZGxlcjogVGlkZGxlcik6IEFEIHwgdW5kZWZpbmVkO1xuXG5cdHNhdmVUaWRkbGVyKFxuXHRcdHRpZGRsZXI6IGFueSxcblx0XHRjYjogKFxuXHRcdFx0ZXJyOiBhbnksXG5cdFx0XHRhZGFwdG9ySW5mbz86IEFELFxuXHRcdFx0cmV2aXNpb24/OiBzdHJpbmdcblx0XHQpID0+IHZvaWQsXG5cdFx0ZXh0cmE6IHsgdGlkZGxlckluZm86IFN5bmNlclRpZGRsZXJJbmZvPEFEPiB9XG5cdCk6IHZvaWQ7XG5cblx0c2F2ZVRpZGRsZXJzPyhvcHRpb25zOiB7XG5cdFx0c3luY2VyOiBTeW5jZXI8QUQ+LFxuXHRcdHRpZGRsZXJzOiBUaWRkbGVyW10sXG5cdFx0b25OZXh0OiAodGl0bGU6IHN0cmluZywgYWRhcHRvckluZm86IGFueSwgcmV2aXNpb246IHN0cmluZykgPT4gdm9pZCxcblx0XHRvbkRvbmU6ICgpID0+IHZvaWQsXG5cdFx0b25FcnJvcjogKGVycjogRXJyb3IpID0+IHZvaWRcblx0fSk6IHZvaWQ7XG5cblx0bG9hZFRpZGRsZXJzPyhvcHRpb25zOiB7XG5cdFx0c3luY2VyOiBTeW5jZXI8QUQ+LFxuXHRcdHRpdGxlczogc3RyaW5nW10sXG5cdFx0b25OZXh0OiAodGlkZGxlckZpZWxkczogVGlkZGxlckZpZWxkcykgPT4gdm9pZCxcblx0XHRvbkRvbmU6ICgpID0+IHZvaWQsXG5cdFx0b25FcnJvcjogKGVycjogRXJyb3IpID0+IHZvaWRcblx0fSk6IHZvaWQ7XG5cblx0ZGVsZXRlVGlkZGxlcnM/KG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjxBRD4sXG5cdFx0dGl0bGVzOiBzdHJpbmdbXSxcblx0XHRvbk5leHQ6ICh0aXRsZTogc3RyaW5nKSA9PiB2b2lkLFxuXHRcdG9uRG9uZTogKCkgPT4gdm9pZCxcblx0XHRvbkVycm9yOiAoZXJyOiBFcnJvcikgPT4gdm9pZFxuXHR9KTogdm9pZDtcblxuXHRzZXRMb2dnZXJTYXZlQnVmZmVyPzogKGxvZ2dlckZvclNhdmluZzogTG9nZ2VyKSA9PiB2b2lkO1xuXHRkaXNwbGF5TG9naW5Qcm9tcHQ/KHN5bmNlcjogU3luY2VyPEFEPik6IHZvaWQ7XG5cdGxvZ2luPyh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBjYjogKGVycjogYW55KSA9PiB2b2lkKTogdm9pZDtcblx0bG9nb3V0PyhjYjogKGVycjogYW55KSA9PiB2b2lkKTogYW55O1xuXG59XG5pbnRlcmZhY2UgU3luY2VyVGlkZGxlckluZm88QUQ+IHtcblx0LyoqIHRoaXMgY29tZXMgZnJvbSB0aGUgd2lraSBjaGFuZ2VDb3VudCByZWNvcmQgKi9cblx0Y2hhbmdlQ291bnQ6IG51bWJlcjtcblx0LyoqIEFkYXB0ZXIgaW5mbyByZXR1cm5lZCBieSB0aGUgc3luYyBhZGFwdGVyICovXG5cdGFkYXB0b3JJbmZvOiBBRDtcblx0LyoqIFJldmlzaW9uIHJldHVybiBieSB0aGUgc3luYyBhZGFwdGVyICovXG5cdHJldmlzaW9uOiBzdHJpbmc7XG5cdC8qKiBUaW1lc3RhbXAgc2V0IGluIHRoZSBjYWxsYmFjayBvZiB0aGUgcHJldmlvdXMgc2F2ZSAqL1xuXHR0aW1lc3RhbXBMYXN0U2F2ZWQ6IERhdGU7XG59XG5cbmRlY2xhcmUgY29uc3QgJHR3OiBhbnk7XG5cbmRlY2xhcmUgY29uc3QgZXhwb3J0czoge1xuXHRhZGFwdG9yQ2xhc3M6IHR5cGVvZiBNdWx0aVdpa2lDbGllbnRBZGFwdG9yO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBDT05GSUdfSE9TVF9USURETEVSID0gXCIkOi9jb25maWcvbXVsdGl3aWtpY2xpZW50L2hvc3RcIjtcbmNvbnN0IERFRkFVTFRfSE9TVF9USURETEVSID0gXCIkcHJvdG9jb2wkLy8kaG9zdCQvXCI7XG5jb25zdCBDT05GSUdfUkVDSVBFX1RJRERMRVIgPSBcIiQ6L2NvbmZpZy9tdWx0aXdpa2ljbGllbnQvcmVjaXBlXCI7XG5jb25zdCBJU19ERVZfTU9ERV9USURETEVSID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvZGV2LW1vZGVcIjtcbmNvbnN0IExBU1RfUkVWSVNJT05fSURfVElERExFUiA9IFwiJDovc3RhdGUvbXVsdGl3aWtpY2xpZW50L3JlY2lwZS9sYXN0X3JldmlzaW9uX2lkXCI7XG5jb25zdCBNV0NfU1RBVEVfVElERExFUl9QUkVGSVggPSBcIiQ6L3N0YXRlL211bHRpd2lraWNsaWVudC9cIjtcbmNvbnN0IEJBR19TVEFURV9USURETEVSID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvdGlkZGxlcnMvYmFnXCI7XG5jb25zdCBSRVZJU0lPTl9TVEFURV9USURETEVSID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvdGlkZGxlcnMvcmV2aXNpb25cIjtcbmNvbnN0IFNUQVRVU19USURETEVSID0gXCIkOi9jb25maWcvbXVsdGl3aWtpY2xpZW50L3N0YXR1c1wiO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFR5cGVzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuaW50ZXJmYWNlIE1XU0FkYXB0b3JJbmZvIHtcblx0YmFnOiBzdHJpbmc7XG5cdHJldmlzaW9uOiBzdHJpbmc7XG5cdHRpdGxlOiBzdHJpbmc7XG59XG5cbi8vIFN0YXR1cyByZXNwb25zZSBmcm9tIEdFVCAvcmVjaXBlLzppZC9zdGF0dXNcbmludGVyZmFjZSBSZWNpcGVTdGF0dXMge1xuXHRpc0FkbWluOiBib29sZWFuO1xuXHR1c2VyX2lkOiBzdHJpbmc7XG5cdHBhZ2VUb2tlbjogc3RyaW5nO1xuXHR1c2VybmFtZTogc3RyaW5nO1xuXHRpc0xvZ2dlZEluOiBib29sZWFuO1xuXHR0ZW1wbGF0ZTogeyB0eXBlOiBzdHJpbmc7IGRlZmluaXRpb246IHVua25vd247IHBhcmFtZXRlcnM6IHVua25vd24gfTtcblx0YmFnczogeyBiYWdfaWQ6IHN0cmluZzsgYmFnX25hbWU6IHN0cmluZzsgaXNfd3JpdGFibGU6IGJvb2xlYW47IHByaW9yaXR5OiBudW1iZXI7IGNhblVzZXJXcml0ZTogYm9vbGVhbjsgaW5mbzogdW5rbm93biB9W107XG59XG5cbi8vIFRpZGRsZXJJbmZvIGZyb20gcmVzb2x2ZXJcbmludGVyZmFjZSBUaWRkbGVySW5mbyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdHdyaXRlVG86IHN0cmluZyB8IG51bGw7XG5cdHJlYWRGcm9tOiBzdHJpbmcgfCBudWxsO1xuXHRleGlzdHNJbjogc3RyaW5nW107XG5cdGNhbldyaXRlOiBib29sZWFuO1xufVxuXG50eXBlIEJhdGNoTXV0YXRpb25SZXN1bHQgPSB7IHRpdGxlOiBzdHJpbmc7IGluZm86IFRpZGRsZXJJbmZvOyByZXZpc2lvbj86IHN0cmluZyB9O1xudHlwZSBCYXRjaFJlYWRSZXN1bHQgPSB7IGZpZWxkczogUmVjb3JkPHN0cmluZywgYW55PiAmIHsgdGl0bGU6IHN0cmluZyB9OyBpbmZvOiBUaWRkbGVySW5mbyB9IHwgbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBZGFwdG9yXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY2xhc3MgTXVsdGlXaWtpQ2xpZW50QWRhcHRvciBpbXBsZW1lbnRzIFN5bmNBZGFwdG9yPE1XU0FkYXB0b3JJbmZvPiB7XG5cdG5hbWUgPSBcIm11bHRpd2lraWNsaWVudFwiO1xuXG5cdHByaXZhdGUgd2lraTogV2lraTtcblx0cHJpdmF0ZSBob3N0OiBzdHJpbmc7XG5cdHByaXZhdGUgcmVjaXBlOiBzdHJpbmc7XG5cdHByaXZhdGUgaXNEZXZNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXHRwcml2YXRlIHN5bmNlcjogU3luY2VyPE1XU0FkYXB0b3JJbmZvPiB8IG51bGwgPSBudWxsO1xuXG5cdHByaXZhdGUgaXNMb2dnZWRJbiA9IGZhbHNlO1xuXHRwcml2YXRlIGlzUmVhZE9ubHkgPSB0cnVlO1xuXHRwcml2YXRlIG9mZmxpbmUgPSBmYWxzZTtcblx0cHJpdmF0ZSB1c2VybmFtZSA9IFwiXCI7XG5cdGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuXHRwcml2YXRlIGxhc3RTZXEgPSBcIjBcIjtcblx0cHJpdmF0ZSBpbml0aWFsTG9hZERvbmUgPSBmYWxzZTtcblx0LyoqIHRpdGxlIOKGkiBiYWcgbmFtZSwgcG9wdWxhdGVkIG9uIGxvYWQvc2F2ZSAqL1xuXHRwcml2YXRlIHRpZGRsZXJCYWcgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXHQvKiogdGl0bGUg4oaSIHJldmlzaW9uLCBwb3B1bGF0ZWQgb24gc2F2ZSAqL1xuXHRwcml2YXRlIHRpZGRsZXJSZXZpc2lvbiA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cdHByaXZhdGUgc3RhdHVzOiBSZWNpcGVTdGF0dXM7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogeyB3aWtpOiBXaWtpIH0pIHtcblx0XHR0aGlzLndpa2kgPSBvcHRpb25zLndpa2k7XG5cdFx0dGhpcy5ob3N0ID0gdGhpcy5nZXRIb3N0KCk7XG5cdFx0dGhpcy5yZWNpcGUgPSB0aGlzLndpa2kuZ2V0VGlkZGxlclRleHQoQ09ORklHX1JFQ0lQRV9USURETEVSLCBcIlwiKSE7XG5cdFx0dGhpcy5pc0Rldk1vZGUgPSB0aGlzLndpa2kuZ2V0VGlkZGxlclRleHQoSVNfREVWX01PREVfVElERExFUikgPT09IFwieWVzXCI7XG5cdFx0dGhpcy5sYXN0U2VxID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KExBU1RfUkVWSVNJT05fSURfVElERExFUiwgXCIwXCIpITtcblx0XHR0aGlzLnN0YXR1cyA9IEpTT04ucGFyc2UodGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KFNUQVRVU19USURETEVSKSEpO1xuXHRcdHRoaXMuaW5pdGlhbExvYWREb25lID0gdGhpcy5sYXN0U2VxICE9PSBcIjBcIjtcblx0XHR0aGlzLmxvZ2dlciA9IG5ldyAkdHcudXRpbHMuTG9nZ2VyKFwiTXVsdGlXaWtpQ2xpZW50QWRhcHRvclwiKTtcblx0fVxuXG5cdGlzUmVhZHkoKSB7IHJldHVybiB0cnVlOyB9XG5cblx0c2V0TG9nZ2VyU2F2ZUJ1ZmZlcihsb2dnZXI6IExvZ2dlcikgeyB0aGlzLmxvZ2dlci5zZXRTYXZlQnVmZmVyKGxvZ2dlcik7IH1cblxuXHRyZWdpc3RlclN5bmNlcihzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz4pIHsgdGhpcy5zeW5jZXIgPSBzeW5jZXI7IH1cblxuXHRwcml2YXRlIGlzU3RhdGVUaWRkbGVyKHRpdGxlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGl0bGUuc3RhcnRzV2l0aChNV0NfU1RBVEVfVElERExFUl9QUkVGSVgpO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRUaWRkbGVySW5mbyh0aXRsZTogc3RyaW5nLCBiYWc6IHN0cmluZyB8IG51bGwsIHJldmlzaW9uPzogc3RyaW5nKSB7XG5cdFx0aWYgKGJhZykge1xuXHRcdFx0dGhpcy50aWRkbGVyQmFnLnNldCh0aXRsZSwgYmFnKTtcblx0XHRcdHRoaXMud2lraS5zZXRUZXh0KEJBR19TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgYmFnLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnRpZGRsZXJCYWcuZGVsZXRlKHRpdGxlKTtcblx0XHRcdHRoaXMud2lraS5zZXRUZXh0KEJBR19TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgdW5kZWZpbmVkLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHRcdH1cblx0XHRpZiAocmV2aXNpb24pIHtcblx0XHRcdHRoaXMudGlkZGxlclJldmlzaW9uLnNldCh0aXRsZSwgcmV2aXNpb24pO1xuXHRcdFx0dGhpcy53aWtpLnNldFRleHQoUkVWSVNJT05fU1RBVEVfVElERExFUiwgbnVsbCwgdGl0bGUsIHJldmlzaW9uLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2xlYXJUaWRkbGVySW5mbyh0aXRsZTogc3RyaW5nKSB7XG5cdFx0dGhpcy50aWRkbGVyQmFnLmRlbGV0ZSh0aXRsZSk7XG5cdFx0dGhpcy50aWRkbGVyUmV2aXNpb24uZGVsZXRlKHRpdGxlKTtcblx0XHR0aGlzLndpa2kuc2V0VGV4dChCQUdfU1RBVEVfVElERExFUiwgbnVsbCwgdGl0bGUsIHVuZGVmaW5lZCwgeyBzdXBwcmVzc1RpbWVzdGFtcDogdHJ1ZSB9KTtcblx0XHR0aGlzLndpa2kuc2V0VGV4dChSRVZJU0lPTl9TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgdW5kZWZpbmVkLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRMYXN0U2VxKHNlcTogc3RyaW5nKSB7XG5cdFx0dGhpcy5sYXN0U2VxID0gc2VxO1xuXHRcdHRoaXMud2lraS5zZXRUZXh0KExBU1RfUkVWSVNJT05fSURfVElERExFUiwgbnVsbCwgXCJ0ZXh0XCIsIHNlcSwgeyBzdXBwcmVzc1RpbWVzdGFtcDogdHJ1ZSB9KTtcblx0fVxuXG5cdGdldFRpZGRsZXJSZXZpc2lvbih0aXRsZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMud2lraS5leHRyYWN0VGlkZGxlckRhdGFJdGVtKFJFVklTSU9OX1NUQVRFX1RJRERMRVIsIHRpdGxlKSA/PyBcIlwiO1xuXHR9XG5cblx0Z2V0VGlkZGxlckluZm8odGlkZGxlcjogVGlkZGxlcik6IE1XU0FkYXB0b3JJbmZvIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCB0aXRsZSA9IHRpZGRsZXIuZmllbGRzLnRpdGxlIGFzIHN0cmluZztcblx0XHRjb25zdCBiYWcgPSB0aGlzLndpa2kuZXh0cmFjdFRpZGRsZXJEYXRhSXRlbShCQUdfU1RBVEVfVElERExFUiwgdGl0bGUpID8/IHRoaXMudGlkZGxlckJhZy5nZXQodGl0bGUpO1xuXHRcdGNvbnN0IHJldmlzaW9uID0gdGhpcy53aWtpLmV4dHJhY3RUaWRkbGVyRGF0YUl0ZW0oUkVWSVNJT05fU1RBVEVfVElERExFUiwgdGl0bGUpID8/IHRoaXMudGlkZGxlclJldmlzaW9uLmdldCh0aXRsZSk7XG5cdFx0cmV0dXJuIGJhZyAmJiByZXZpc2lvbiA/IHsgYmFnLCByZXZpc2lvbiwgdGl0bGUgfSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdHByaXZhdGUgZ2V0SG9zdCgpIHtcblx0XHRsZXQgdGV4dCA9IHRoaXMud2lraS5nZXRUaWRkbGVyVGV4dChDT05GSUdfSE9TVF9USURETEVSLCBERUZBVUxUX0hPU1RfVElERExFUikhO1xuXHRcdFtcblx0XHRcdHsgbmFtZTogXCJwcm90b2NvbFwiLCB2YWx1ZTogZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgfSxcblx0XHRcdHsgbmFtZTogXCJob3N0XCIsIHZhbHVlOiBkb2N1bWVudC5sb2NhdGlvbi5ob3N0IH0sXG5cdFx0XHR7IG5hbWU6IFwicGF0aG5hbWVcIiwgdmFsdWU6IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lIH0sXG5cdFx0XS5mb3JFYWNoKCh7IG5hbWUsIHZhbHVlIH0pID0+IHtcblx0XHRcdHRleHQgPSAkdHcudXRpbHMucmVwbGFjZVN0cmluZyh0ZXh0LCBuZXcgUmVnRXhwKFwiXFxcXCRcIiArIG5hbWUgKyBcIlxcXFwkXCIsIFwibWdcIiksIHZhbHVlKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gU3RhdHVzXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRhc3luYyBnZXRTdGF0dXMoY2FsbGJhY2s6IFNlcnZlclN0YXR1c0NhbGxiYWNrKSB7XG5cdFx0Y29uc3Qgc3RhdHVzID0gdGhpcy5zdGF0dXM7XG5cdFx0dGhpcy5vZmZsaW5lID0gZmFsc2U7XG5cdFx0dGhpcy5lcnJvciA9IG51bGw7XG5cdFx0dGhpcy5pc0xvZ2dlZEluID0gc3RhdHVzPy5pc0xvZ2dlZEluID8/IGZhbHNlO1xuXHRcdHRoaXMudXNlcm5hbWUgPSBzdGF0dXM/LnVzZXJuYW1lID8/IFwiKGFub24pXCI7XG5cdFx0dGhpcy5pc1JlYWRPbmx5ID0gIShzdGF0dXM/LmJhZ3M/LnNvbWUoYiA9PiBiLmNhblVzZXJXcml0ZSkgPz8gZmFsc2UpO1xuXHRcdGNhbGxiYWNrKHRoaXMuZXJyb3IsIHRoaXMuaXNMb2dnZWRJbiwgdGhpcy51c2VybmFtZSwgdGhpcy5pc1JlYWRPbmx5LCBmYWxzZSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVwZGF0ZSBwb2xsaW5nXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRhc3luYyBnZXRVcGRhdGVkVGlkZGxlcnMoXG5cdFx0X3N5bmNlcjogU3luY2VyPE1XU0FkYXB0b3JJbmZvPixcblx0XHRjYWxsYmFjazogKGVycjogYW55LCB1cGRhdGVzPzogeyBtb2RpZmljYXRpb25zOiBzdHJpbmdbXTsgZGVsZXRpb25zOiBzdHJpbmdbXSB9KSA9PiB2b2lkXG5cdCkge1xuXHRcdGlmICh0aGlzLm9mZmxpbmUpIHJldHVybiBjYWxsYmFjayhudWxsKTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCF0aGlzLmluaXRpYWxMb2FkRG9uZSkge1xuXHRcdFx0XHQvLyBGZXRjaCBmdWxsIGxpc3QgKyBjdXJyZW50IGxhc3RTZXEgaW4gcGFyYWxsZWwgb24gZmlyc3QgbG9hZFxuXHRcdFx0XHRjb25zdCBbW2xpc3RPaywgLCBsaXN0UmVzdWx0XSwgW3VwZE9rLCAsIHVwZFJlc3VsdF1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdHRoaXMucmVjaXBlUmVxdWVzdCh7IG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9saXN0Lmpzb25cIiB9KSxcblx0XHRcdFx0XHR0aGlzLnJlY2lwZVJlcXVlc3QoeyBtZXRob2Q6IFwiR0VUXCIsIHVybDogXCIvdXBkYXRlc1wiLCBxdWVyeVBhcmFtczogeyBzaW5jZTogXCIwXCIgfSB9KSxcblx0XHRcdFx0XSk7XG5cdFx0XHRcdGlmICghbGlzdE9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdGlkZGxlciBsaXN0XCIpO1xuXHRcdFx0XHRpZiAoIXVwZE9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlc1wiKTtcblx0XHRcdFx0Y29uc3QgbGlzdCA9IGxpc3RSZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyBUaWRkbGVySW5mb1tdO1xuXHRcdFx0XHRjb25zdCB1cGQgPSB1cGRSZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyB7IG1vZGlmaWNhdGlvbnM6IHN0cmluZ1tdOyBkZWxldGlvbnM6IHN0cmluZ1tdOyBsYXN0U2VxOiBzdHJpbmcgfTtcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VxKHVwZC5sYXN0U2VxKTtcblx0XHRcdFx0dGhpcy5pbml0aWFsTG9hZERvbmUgPSB0cnVlO1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCB7IG1vZGlmaWNhdGlvbnM6IGxpc3QubWFwKHQgPT4gdC50aXRsZSksIGRlbGV0aW9uczogW10gfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBbb2ssICwgcmVzdWx0XSA9IGF3YWl0IHRoaXMucmVjaXBlUmVxdWVzdCh7XG5cdFx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHRcdHVybDogXCIvdXBkYXRlc1wiLFxuXHRcdFx0XHRcdHF1ZXJ5UGFyYW1zOiB7IHNpbmNlOiB0aGlzLmxhc3RTZXEgfSxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmICghb2spIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCB1cGRhdGVzXCIpO1xuXHRcdFx0XHRjb25zdCB1cGQgPSByZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyB7IG1vZGlmaWNhdGlvbnM6IHN0cmluZ1tdOyBkZWxldGlvbnM6IHN0cmluZ1tdOyBsYXN0U2VxOiBzdHJpbmcgfTtcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VxKHVwZC5sYXN0U2VxKTtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgeyBtb2RpZmljYXRpb25zOiB1cGQubW9kaWZpY2F0aW9ucywgZGVsZXRpb25zOiB1cGQuZGVsZXRpb25zIH0pO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGU6IGFueSkge1xuXHRcdFx0Y2FsbGJhY2soZSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBCYXRjaCBvcGVyYXRpb25zIChuZXcgQVBJKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0YXN5bmMgbG9hZFRpZGRsZXJzKG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz47XG5cdFx0dGl0bGVzOiBzdHJpbmdbXTtcblx0XHRvbk5leHQ6IChmaWVsZHM6IFRpZGRsZXJGaWVsZHMpID0+IHZvaWQ7XG5cdFx0b25Eb25lOiAoKSA9PiB2b2lkO1xuXHRcdG9uRXJyb3I6IChlcnI6IEVycm9yKSA9PiB2b2lkO1xuXHR9KSB7XG5cdFx0Y29uc3QgeyB0aXRsZXMsIG9uTmV4dCwgb25Eb25lLCBvbkVycm9yIH0gPSBvcHRpb25zO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5iYXRjaE9wPEJhdGNoUmVhZFJlc3VsdFtdPihcInJlYWRcIiwgeyB0aXRsZXMgfSk7XG5cdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0cykge1xuXHRcdFx0XHRpZiAoIWl0ZW0pIGNvbnRpbnVlO1xuXHRcdFx0XHR0aGlzLnNldFRpZGRsZXJJbmZvKGl0ZW0uZmllbGRzLnRpdGxlLCBpdGVtLmluZm8ucmVhZEZyb20sIHR5cGVvZiBpdGVtLmZpZWxkcy5yZXZpc2lvbiA9PT0gXCJzdHJpbmdcIiA/IGl0ZW0uZmllbGRzLnJldmlzaW9uIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0b25OZXh0KGl0ZW0uZmllbGRzIGFzIFRpZGRsZXJGaWVsZHMpO1xuXHRcdFx0fVxuXHRcdFx0b25Eb25lKCk7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IG9uRXJyb3IoZSk7IH1cblx0fVxuXG5cdGFzeW5jIHNhdmVUaWRkbGVycyhvcHRpb25zOiB7XG5cdFx0c3luY2VyOiBTeW5jZXI8TVdTQWRhcHRvckluZm8+O1xuXHRcdHRpZGRsZXJzOiBUaWRkbGVyW107XG5cdFx0b25OZXh0OiAodGl0bGU6IHN0cmluZywgYWRhcHRvckluZm86IE1XU0FkYXB0b3JJbmZvLCByZXZpc2lvbjogc3RyaW5nKSA9PiB2b2lkO1xuXHRcdG9uRG9uZTogKCkgPT4gdm9pZDtcblx0XHRvbkVycm9yOiAoZXJyOiBFcnJvcikgPT4gdm9pZDtcblx0fSkge1xuXHRcdGNvbnN0IHsgdGlkZGxlcnMsIG9uTmV4dCwgb25Eb25lLCBvbkVycm9yIH0gPSBvcHRpb25zO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5iYXRjaE9wPEJhdGNoTXV0YXRpb25SZXN1bHRbXT4oXCJzYXZlXCIsIHtcblx0XHRcdFx0dGlkZGxlcnM6IHRpZGRsZXJzLm1hcCh0ID0+IHQuZ2V0RmllbGRTdHJpbmdzKCkpLFxuXHRcdFx0fSk7XG5cdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0cykge1xuXHRcdFx0XHRjb25zdCBiYWcgPSBpdGVtLmluZm8ud3JpdGVUbyA/PyBpdGVtLmluZm8ucmVhZEZyb20gPz8gXCJcIjtcblx0XHRcdFx0dGhpcy5zZXRUaWRkbGVySW5mbyhpdGVtLnRpdGxlLCBiYWcgfHwgbnVsbCwgaXRlbS5yZXZpc2lvbiA/PyBcIlwiKTtcblx0XHRcdFx0aWYgKCR0dy5icm93c2VyU3RvcmFnZT8uaXNFbmFibGVkKCkpICR0dy5icm93c2VyU3RvcmFnZS5yZW1vdmVUaWRkbGVyRnJvbUxvY2FsU3RvcmFnZShpdGVtLnRpdGxlKTtcblx0XHRcdFx0b25OZXh0KGl0ZW0udGl0bGUsIHsgYmFnLCByZXZpc2lvbjogaXRlbS5yZXZpc2lvbiA/PyBcIlwiLCB0aXRsZTogaXRlbS50aXRsZSB9LCBpdGVtLnJldmlzaW9uID8/IFwiXCIpO1xuXHRcdFx0fVxuXHRcdFx0b25Eb25lKCk7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IG9uRXJyb3IoZSk7IH1cblx0fVxuXG5cdGFzeW5jIGRlbGV0ZVRpZGRsZXJzKG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz47XG5cdFx0dGl0bGVzOiBzdHJpbmdbXTtcblx0XHRvbk5leHQ6ICh0aXRsZTogc3RyaW5nKSA9PiB2b2lkO1xuXHRcdG9uRG9uZTogKCkgPT4gdm9pZDtcblx0XHRvbkVycm9yOiAoZXJyOiBFcnJvcikgPT4gdm9pZDtcblx0fSkge1xuXHRcdGNvbnN0IHsgdGl0bGVzLCBvbk5leHQsIG9uRG9uZSwgb25FcnJvciB9ID0gb3B0aW9ucztcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaE11dGF0aW9uUmVzdWx0W10+KFwiZGVsZXRlXCIsIHsgdGl0bGVzIH0pO1xuXHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIHJlc3VsdHMpIHtcblx0XHRcdFx0dGhpcy5jbGVhclRpZGRsZXJJbmZvKGl0ZW0udGl0bGUpO1xuXHRcdFx0XHRvbk5leHQoaXRlbS50aXRsZSk7XG5cdFx0XHR9XG5cdFx0XHRvbkRvbmUoKTtcblx0XHR9IGNhdGNoIChlOiBhbnkpIHsgb25FcnJvcihlKTsgfVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBTaW5nbGUtdGlkZGxlciBvcGVyYXRpb25zIChmYWxsYmFjayBmb3Igb2xkZXIgc2VydmVyIHZlcnNpb25zKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0YXN5bmMgc2F2ZVRpZGRsZXIoXG5cdFx0dGlkZGxlcjogVGlkZGxlcixcblx0XHRjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IE1XU0FkYXB0b3JJbmZvLCByZXZpc2lvbj86IHN0cmluZykgPT4gdm9pZFxuXHQpIHtcblx0XHRjb25zdCB0aXRsZSA9IHRpZGRsZXIuZmllbGRzLnRpdGxlIGFzIHN0cmluZztcblx0XHRpZiAodGl0bGUgPT09IFwiJDovU3RvcnlMaXN0XCIgfHwgdGhpcy5pc1JlYWRPbmx5IHx8IHRoaXMuaXNTdGF0ZVRpZGRsZXIodGl0bGUpKSByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmJhdGNoT3A8QmF0Y2hNdXRhdGlvblJlc3VsdFtdPihcInNhdmVcIiwgeyB0aWRkbGVyczogW3RpZGRsZXIuZ2V0RmllbGRTdHJpbmdzKCldIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyByZXN1bHQgcmV0dXJuZWRcIikpO1xuXHRcdFx0Y29uc3QgYmFnID0gaXRlbS5pbmZvLndyaXRlVG8gPz8gaXRlbS5pbmZvLnJlYWRGcm9tID8/IFwiXCI7XG5cdFx0XHR0aGlzLnNldFRpZGRsZXJJbmZvKHRpdGxlLCBiYWcgfHwgbnVsbCwgaXRlbS5yZXZpc2lvbiA/PyBcIlwiKTtcblx0XHRcdGlmICgkdHcuYnJvd3NlclN0b3JhZ2U/LmlzRW5hYmxlZCgpKSAkdHcuYnJvd3NlclN0b3JhZ2UucmVtb3ZlVGlkZGxlckZyb21Mb2NhbFN0b3JhZ2UodGl0bGUpO1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgeyBiYWcsIHJldmlzaW9uOiBpdGVtLnJldmlzaW9uID8/IFwiXCIsIHRpdGxlIH0sIGl0ZW0ucmV2aXNpb24gPz8gXCJcIik7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IGNhbGxiYWNrKGUpOyB9XG5cdH1cblxuXHRhc3luYyBsb2FkVGlkZGxlcih0aXRsZTogc3RyaW5nLCBjYWxsYmFjazogKGVycjogYW55LCBmaWVsZHM/OiBhbnkpID0+IHZvaWQsIF9vcHRpb25zOiBhbnkpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaFJlYWRSZXN1bHRbXT4oXCJyZWFkXCIsIHsgdGl0bGVzOiBbdGl0bGVdIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhudWxsLCBudWxsKTtcblx0XHRcdHRoaXMuc2V0VGlkZGxlckluZm8odGl0bGUsIGl0ZW0uaW5mby5yZWFkRnJvbSwgdHlwZW9mIGl0ZW0uZmllbGRzLnJldmlzaW9uID09PSBcInN0cmluZ1wiID8gaXRlbS5maWVsZHMucmV2aXNpb24gOiB1bmRlZmluZWQpO1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgaXRlbS5maWVsZHMpO1xuXHRcdH0gY2F0Y2ggKGU6IGFueSkgeyBjYWxsYmFjayhlKTsgfVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlVGlkZGxlcih0aXRsZTogc3RyaW5nLCBjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IGFueSkgPT4gdm9pZCwgX29wdGlvbnM6IGFueSkge1xuXHRcdGlmICh0aGlzLmlzUmVhZE9ubHkpIHJldHVybiBjYWxsYmFjayhudWxsKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaE11dGF0aW9uUmVzdWx0W10+KFwiZGVsZXRlXCIsIHsgdGl0bGVzOiBbdGl0bGVdIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyByZXN1bHQgcmV0dXJuZWRcIikpO1xuXHRcdFx0dGhpcy5jbGVhclRpZGRsZXJJbmZvKHRpdGxlKTtcblx0XHRcdGNhbGxiYWNrKG51bGwsIG51bGwpO1xuXHRcdH0gY2F0Y2ggKGU6IGFueSkgeyBjYWxsYmFjayhlKTsgfVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBIVFRQIGhlbHBlcnNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdHByaXZhdGUgYXN5bmMgYmF0Y2hPcDxUPihvcDogc3RyaW5nLCBib2R5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxUPiB7XG5cdFx0Y29uc3QgW29rLCBlcnIsIHJlc3VsdF0gPSBhd2FpdCB0aGlzLnJlY2lwZVJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiBcIlBVVFwiLFxuXHRcdFx0dXJsOiBcIi9iYXRjaC9cIiArIG9wLFxuXHRcdFx0cmVxdWVzdEJvZHlTdHJpbmc6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuXHRcdFx0aGVhZGVyczogeyBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuXHRcdH0pO1xuXHRcdGlmICghb2spIHRocm93IGVycjtcblx0XHRpZiAoIXJlc3VsdCEucmVzcG9uc2VKU09OKSB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXNwb25zZSBKU09OIGZyb20gYmF0Y2gvXCIgKyBvcCk7XG5cdFx0cmV0dXJuIHJlc3VsdCEucmVzcG9uc2VKU09OIGFzIFQ7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHJlY2lwZVJlcXVlc3Qob3B0aW9uczoge1xuXHRcdG1ldGhvZDogc3RyaW5nO1xuXHRcdHVybDogc3RyaW5nO1xuXHRcdGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXHRcdHF1ZXJ5UGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblx0XHRyZXF1ZXN0Qm9keVN0cmluZz86IHN0cmluZztcblx0fSkge1xuXHRcdGlmICghb3B0aW9ucy51cmwuc3RhcnRzV2l0aChcIi9cIikpIHRocm93IG5ldyBFcnJvcihcIlVSTCBtdXN0IHN0YXJ0IHdpdGggL1wiKTtcblx0XHRpZiAoIW9wdGlvbnMuaGVhZGVycykgb3B0aW9ucy5oZWFkZXJzID0ge307XG5cdFx0aWYgKCFvcHRpb25zLmhlYWRlcnMuYXV0aG9yaXphdGlvbikge1xuXHRcdFx0b3B0aW9ucy5oZWFkZXJzLmF1dGhvcml6YXRpb24gPSBcIkJlYXJlciBcIiArIHRoaXMuc3RhdHVzLnBhZ2VUb2tlbjtcblx0XHR9XG5cdFx0Y29uc3QgaXNEZXZNb2RlID0gdGhpcy5pc0Rldk1vZGU7XG5cdFx0cmV0dXJuIGh0dHBSZXF1ZXN0KHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRyZXNwb25zZVR5cGU6IFwiYmxvYlwiLFxuXHRcdFx0dXJsOiB0aGlzLmhvc3QgKyBcIi9cIiArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnJlY2lwZSkgKyBvcHRpb25zLnVybCxcblx0XHR9KS50aGVuKGFzeW5jIGUgPT4ge1xuXHRcdFx0aWYgKCFlLm9rKSByZXR1cm4gW2ZhbHNlLCBuZXcgRXJyb3IoXG5cdFx0XHRcdGBTZXJ2ZXIgcmV0dXJuZWQgJHtlLnN0YXR1c306ICR7ZS5oZWFkZXJzLmdldChcIngtcmVhc29uXCIpID8/IFwiKG5vIHJlYXNvbilcIn1gXG5cdFx0XHQpLCB7IC4uLmUsIHJlc3BvbnNlSlNPTjogdW5kZWZpbmVkIH1dIGFzIGNvbnN0O1xuXG5cdFx0XHRsZXQgcmVzcG9uc2VTdHJpbmc6IHN0cmluZztcblx0XHRcdGlmIChlLmhlYWRlcnMuZ2V0KFwieC1nemlwLXN0cmVhbVwiKSA9PT0gXCJ5ZXNcIikge1xuXHRcdFx0XHRyZXNwb25zZVN0cmluZyA9IGF3YWl0IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRsZXQgcyA9IFwiXCI7XG5cdFx0XHRcdFx0Y29uc3QgZ3ogPSBuZXcgZmZsYXRlLkFzeW5jR3VuemlwKChlcnIsIGNodW5rLCBmaW5hbCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGVycikgcmV0dXJuO1xuXHRcdFx0XHRcdFx0cyArPSBmZmxhdGUuc3RyRnJvbVU4KGNodW5rKTtcblx0XHRcdFx0XHRcdGlmIChmaW5hbCkgcmVzb2x2ZShzKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAoaXNEZXZNb2RlKSBnei5vbm1lbWJlciA9IG0gPT4gY29uc29sZS5sb2coXCJndW56aXAgbWVtYmVyXCIsIG0pO1xuXHRcdFx0XHRcdHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihlLnJlc3BvbnNlIGFzIEJsb2IpLnRoZW4oYnVmID0+IHtcblx0XHRcdFx0XHRcdGd6LnB1c2gobmV3IFVpbnQ4QXJyYXkoYnVmKSk7XG5cdFx0XHRcdFx0XHRnei5wdXNoKG5ldyBVaW50OEFycmF5KDApLCB0cnVlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXNwb25zZVN0cmluZyA9IGZmbGF0ZS5zdHJGcm9tVTgobmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEJsb2JBc0FycmF5QnVmZmVyKGUucmVzcG9uc2UgYXMgQmxvYikpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFt0cnVlLCB1bmRlZmluZWQsIHtcblx0XHRcdFx0Li4uZSxcblx0XHRcdFx0cmVzcG9uc2VKU09OOiBlLnN0YXR1cyA9PT0gMjAwID8gdHJ5UGFyc2VKU09OKHJlc3BvbnNlU3RyaW5nKSA6IHVuZGVmaW5lZCxcblx0XHRcdH1dIGFzIGNvbnN0O1xuXHRcdH0sIGUgPT4gW2ZhbHNlLCBlLCB1bmRlZmluZWRdIGFzIGNvbnN0KTtcblx0fVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFV0aWxpdGllc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIHRyeVBhcnNlSlNPTihzOiBzdHJpbmcpIHtcblx0dHJ5IHsgcmV0dXJuIEpTT04ucGFyc2Uocyk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcihcIkpTT04gcGFyc2UgZXJyb3JcIiwgZSk7IHJldHVybiB1bmRlZmluZWQ7IH1cbn1cblxudHlwZSBQYXJhbXNJbnB1dCA9IFVSTFNlYXJjaFBhcmFtcyB8IFtzdHJpbmcsIHN0cmluZ11bXSB8IG9iamVjdCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuaW50ZXJmYWNlIEh0dHBSZXF1ZXN0T3B0aW9uczxUWVBFIGV4dGVuZHMgXCJhcnJheWJ1ZmZlclwiIHwgXCJibG9iXCIgfCBcInRleHRcIj4ge1xuXHRtZXRob2Q6IHN0cmluZztcblx0dXJsOiBzdHJpbmc7XG5cdHJlc3BvbnNlVHlwZTogVFlQRTtcblx0aGVhZGVycz86IEhlYWRlcnNJbml0O1xuXHRxdWVyeVBhcmFtcz86IFBhcmFtc0lucHV0O1xuXHRyZXF1ZXN0Qm9keVN0cmluZz86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gaHR0cFJlcXVlc3Q8VFlQRSBleHRlbmRzIFwiYXJyYXlidWZmZXJcIiB8IFwiYmxvYlwiIHwgXCJ0ZXh0XCI+KG9wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9uczxUWVBFPikge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8e1xuXHRcdG9rOiBib29sZWFuOyBzdGF0dXM6IG51bWJlcjsgc3RhdHVzVGV4dDogc3RyaW5nOyBoZWFkZXJzOiBIZWFkZXJzO1xuXHRcdHJlc3BvbnNlOiBUWVBFIGV4dGVuZHMgXCJhcnJheWJ1ZmZlclwiID8gQXJyYXlCdWZmZXIgOiBUWVBFIGV4dGVuZHMgXCJibG9iXCIgPyBCbG9iIDogc3RyaW5nO1xuXHR9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0b3B0aW9ucy5tZXRob2QgPSBvcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuXHRcdGNvbnN0IHVybCA9IG5ldyBVUkwob3B0aW9ucy51cmwsIGxvY2F0aW9uLmhyZWYpO1xuXHRcdHBhcmFtc0lucHV0KG9wdGlvbnMucXVlcnlQYXJhbXMpLmZvckVhY2goKHYsIGspID0+IHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKGssIHYpKTtcblx0XHRjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzIHx8IHt9KTtcblx0XHRjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZTtcblx0XHRyZXF1ZXN0Lm9wZW4ob3B0aW9ucy5tZXRob2QsIHVybCwgdHJ1ZSk7XG5cdFx0aWYgKCFoZWFkZXJzLmhhcyhcImNvbnRlbnQtdHlwZVwiKSlcblx0XHRcdGhlYWRlcnMuc2V0KFwiY29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIpO1xuXHRcdGlmICghaGVhZGVycy5oYXMoXCJ4LXJlcXVlc3RlZC13aXRoXCIpKVxuXHRcdFx0aGVhZGVycy5zZXQoXCJ4LXJlcXVlc3RlZC13aXRoXCIsIFwiVGlkZGx5V2lraVwiKTtcblx0XHRoZWFkZXJzLnNldChcImFjY2VwdFwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG5cdFx0aGVhZGVycy5mb3JFYWNoKCh2LCBrKSA9PiByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoaywgdikpO1xuXHRcdHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gNCkgcmV0dXJuO1xuXHRcdFx0Y29uc3QgaCA9IG5ldyBIZWFkZXJzKCk7XG5cdFx0XHRyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpPy50cmltKCkuc3BsaXQoL1tcXHJcXG5dKy8pLmZvckVhY2gobGluZSA9PiB7XG5cdFx0XHRcdGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdChcIjogXCIpO1xuXHRcdFx0XHRjb25zdCBrZXkgPSBwYXJ0cy5zaGlmdCgpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRpZiAoa2V5KSBoLmFwcGVuZChrZXksIHBhcnRzLmpvaW4oXCI6IFwiKSk7XG5cdFx0XHR9KTtcblx0XHRcdHJlc29sdmUoeyBvazogdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwLCBzdGF0dXM6IHRoaXMuc3RhdHVzLCBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsIHJlc3BvbnNlOiB0aGlzLnJlc3BvbnNlLCBoZWFkZXJzOiBoIH0pO1xuXHRcdH07XG5cdFx0cmVxdWVzdC5zZW5kKG9wdGlvbnMucmVxdWVzdEJvZHlTdHJpbmcpO1xuXHR9KTtcblxuXHRmdW5jdGlvbiBwYXJhbXNJbnB1dChpbnB1dDogUGFyYW1zSW5wdXQpIHtcblx0XHRpZiAoIWlucHV0KSByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXHRcdGlmIChpbnB1dCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykgcmV0dXJuIGlucHV0O1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSB8fCB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpIHJldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKGlucHV0KTtcblx0XHRjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoaW5wdXQsIGtleSkpIHtcblx0XHRcdFx0cGFyYW1zLmFwcGVuZChrZXksIChpbnB1dCBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHBhcmFtcztcblx0fVxufVxuXG5mdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYjogQmxvYikge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8QXJyYXlCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdHJlYWRlci5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKHJlYWRlci5yZXN1bHQgYXMgQXJyYXlCdWZmZXIpO1xuXHRcdHJlYWRlci5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihcIkVycm9yIHJlYWRpbmcgYmxvYlwiKSk7XG5cdFx0cmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xuXHR9KTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFeHBvcnRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5pZiAoJHR3LmJyb3dzZXIgJiYgZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wuc3RhcnRzV2l0aChcImh0dHBcIikpIHtcblx0ZXhwb3J0cy5hZGFwdG9yQ2xhc3MgPSBNdWx0aVdpa2lDbGllbnRBZGFwdG9yO1xufVxuIl19