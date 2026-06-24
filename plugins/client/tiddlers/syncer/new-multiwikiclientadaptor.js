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
            const [ok, , result] = yield this.recipeRequest({ method: "GET", url: "/status" });
            if (!ok && (result === null || result === void 0 ? void 0 : result.status) === 0) {
                this.offline = true;
                this.isLoggedIn = false;
                this.isReadOnly = true;
                this.username = "(offline)";
                this.error = "The webpage is forbidden from contacting the server.";
            }
            else if (ok) {
                const status = result.responseJSON;
                this.offline = false;
                this.error = null;
                this.isLoggedIn = (_a = status === null || status === void 0 ? void 0 : status.isLoggedIn) !== null && _a !== void 0 ? _a : false;
                this.username = (_b = status === null || status === void 0 ? void 0 : status.username) !== null && _b !== void 0 ? _b : "(anon)";
                this.isReadOnly = !((_d = (_c = status === null || status === void 0 ? void 0 : status.bags) === null || _c === void 0 ? void 0 : _c.some(b => b.canUserWrite)) !== null && _d !== void 0 ? _d : false);
            }
            else {
                this.error = `Server error ${result === null || result === void 0 ? void 0 : result.status}`;
            }
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
            const isDevMode = this.isDevMode;
            return httpRequest(Object.assign(Object.assign({}, options), { responseType: "blob", url: this.host + "recipe/" + encodeURIComponent(this.recipe) + options.url })).then((e) => __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LW11bHRpd2lraWNsaWVudGFkYXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmV3LW11bHRpd2lraWNsaWVudGFkYXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFFSCxrRUFBa0U7QUFDbEUsWUFBWSxDQUFDOzs7Ozs7Ozs7OztBQXNLYiw4RUFBOEU7QUFDOUUsWUFBWTtBQUNaLDhFQUE4RTtBQUU5RSxNQUFNLG1CQUFtQixHQUFHLGdDQUFnQyxDQUFDO0FBQzdELE1BQU0sb0JBQW9CLEdBQUcscUJBQXFCLENBQUM7QUFDbkQsTUFBTSxxQkFBcUIsR0FBRyxrQ0FBa0MsQ0FBQztBQUNqRSxNQUFNLG1CQUFtQixHQUFHLG1DQUFtQyxDQUFDO0FBQ2hFLE1BQU0sd0JBQXdCLEdBQUcsa0RBQWtELENBQUM7QUFDcEYsTUFBTSx3QkFBd0IsR0FBRywyQkFBMkIsQ0FBQztBQUM3RCxNQUFNLGlCQUFpQixHQUFHLHVDQUF1QyxDQUFDO0FBQ2xFLE1BQU0sc0JBQXNCLEdBQUcsNENBQTRDLENBQUM7QUFrQzVFLDhFQUE4RTtBQUM5RSxVQUFVO0FBQ1YsOEVBQThFO0FBRTlFLE1BQU0sc0JBQXNCO0lBdUIzQixZQUFZLE9BQXVCO1FBdEJuQyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFPakIsV0FBTSxHQUFrQyxJQUFJLENBQUM7UUFFN0MsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUNuQixlQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFDaEIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN0QixVQUFLLEdBQWtCLElBQUksQ0FBQztRQUVwQixZQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2Qsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDaEMsK0NBQStDO1FBQ3ZDLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUMvQywwQ0FBMEM7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QUM7QUFDL0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXFxcbnRpdGxlOiAkOi9wbHVnaW5zL213cy9jbGllbnQvbmV3LW11bHRpd2lraWNsaWVudGFkYXB0b3IuanNcbnR5cGU6IGFwcGxpY2F0aW9uL2phdmFzY3JpcHRcbm1vZHVsZS10eXBlOiBzeW5jYWRhcHRvclxuXG5BIHN5bmMgYWRhcHRvciBtb2R1bGUgZm9yIHN5bmNocm9uaXNpbmcgd2l0aCBNdWx0aVdpa2lTZXJ2ZXItY29tcGF0aWJsZSBzZXJ2ZXJzLiBcblxuSXQgaGFzIHRocmVlIGtleSBhcmVhcyBvZiBjb25jZXJuOlxuXG4qIEJhc2ljIG9wZXJhdGlvbnMgbGlrZSBwdXQsIGdldCwgYW5kIGRlbGV0ZSBhIHRpZGRsZXIgb24gdGhlIHNlcnZlclxuKiBSZWFsIHRpbWUgdXBkYXRlcyBmcm9tIHRoZSBzZXJ2ZXIgKGhhbmRsZWQgYnkgU1NFKVxuKiBCYWdzIGFuZCByZWNpcGVzLCB3aGljaCBhcmUgdW5rbm93biB0byB0aGUgc3luY2VyXG5cbkEga2V5IGFzcGVjdCBvZiB0aGUgZGVzaWduIGlzIHRoYXQgdGhlIHN5bmNlciBuZXZlciBvdmVybGFwcyBiYXNpYyBzZXJ2ZXIgb3BlcmF0aW9uczsgaXQgd2FpdHMgZm9yIHRoZVxucHJldmlvdXMgb3BlcmF0aW9uIHRvIGNvbXBsZXRlIGJlZm9yZSBzZW5kaW5nIGEgbmV3IG9uZS5cblxuXFwqL1xuXG4vLyB0aGUgYmxhbmsgbGluZSBpcyBpbXBvcnRhbnQsIGFuZCBzbyBpcyB0aGUgZm9sbG93aW5nIHVzZSBzdHJpY3RcblwidXNlIHN0cmljdFwiO1xuXG4vLyBpbXBvcnQgdHlwZSB7IFNlcnZlckV2ZW50c01hcCB9IGZyb20gJ0B0aWRkbHl3aWtpL2V2ZW50cyc7XG4vLyBpbXBvcnQgdHlwZSB7IFpvZFJvdXRlLCBXaWtpU3RhdHVzUm91dGVzLCBXaWtpUmVjaXBlUm91dGVzIH0gZnJvbSAnQHRpZGRseXdpa2kvbXdzJztcbi8vIGltcG9ydCB0eXBlIHsgem9kIH0gZnJvbSAnQHRpZGRseXdpa2kvc2VydmVyJztcbmltcG9ydCB0eXBlIHsgU3luY2VyLCBUaWRkbGVyLCBUaWRkbGVyRmllbGRzLCBXaWtpIH0gZnJvbSAndGlkZGx5d2lraSc7XG5cbi8vIGltcG9ydCB7fSBmcm9tIFwiQHRpZGRseXdpa2kvbXdzLXByaXNtYVwiO1xuZGVjbGFyZSBnbG9iYWwgeyBjb25zdCBmZmxhdGU6IHR5cGVvZiBpbXBvcnQoXCIuL2ZmbGF0ZVwiKTsgfVxuZGVjbGFyZSBjb25zdCBzZWxmOiBuZXZlcjtcblxuZGVjbGFyZSBjbGFzcyBMb2dnZXIge1xuXHRjb25zdHJ1Y3Rvcihjb21wb25lbnROYW1lOiBhbnksIG9wdGlvbnM6IGFueSk7XG5cdGNvbXBvbmVudE5hbWU6IGFueTtcblx0Y29sb3VyOiBhbnk7XG5cdGVuYWJsZTogYW55O1xuXHRzYXZlOiBhbnk7XG5cdHNhdmVMaW1pdDogYW55O1xuXHRzYXZlQnVmZmVyTG9nZ2VyOiB0aGlzO1xuXHRidWZmZXI6IHN0cmluZztcblx0YWxlcnRDb3VudDogbnVtYmVyO1xuXHRzZXRTYXZlQnVmZmVyKGxvZ2dlcjogYW55KTogdm9pZDtcblx0bG9nKC4uLmFyZ3M6IGFueVtdKTogYW55O1xuXHRnZXRCdWZmZXIoKTogc3RyaW5nO1xuXHR0YWJsZSh2YWx1ZTogYW55KTogdm9pZDtcblx0YWxlcnQoLi4uYXJnczogYW55W10pOiB2b2lkO1xuXHRjbGVhckFsZXJ0cygpOiB2b2lkO1xufVxuXG5kZWNsYXJlIG1vZHVsZSAndGlkZGx5d2lraScge1xuXHRleHBvcnQgaW50ZXJmYWNlIFN5bmNlcjxBRD4ge1xuXHRcdHdpa2k6IFdpa2k7XG5cdFx0bG9nZ2VyOiBMb2dnZXI7XG5cdFx0dGlkZGxlckluZm86IFJlY29yZDxzdHJpbmcsIHtcblx0XHRcdGNoYW5nZUNvdW50OiBudW1iZXIsXG5cdFx0XHRhZGFwdG9ySW5mbzogQUQsXG5cdFx0XHRyZXZpc2lvbjogc3RyaW5nLFxuXHRcdFx0dGltZXN0YW1wTGFzdFNhdmVkOiBEYXRlXG5cdFx0fT47XG5cdFx0ZW5xdWV1ZUxvYWRUaWRkbGVyKHRpdGxlOiBzdHJpbmcpOiB2b2lkO1xuXHRcdHN0b3JlVGlkZGxlcih0aWRkbGVyOiBUaWRkbGVyKTogdm9pZDtcblx0XHRwcm9jZXNzVGFza1F1ZXVlKCk6IHZvaWQ7XG5cdFx0c3luY0Zyb21TZXJ2ZXIoKTogdm9pZDtcblx0fVxuXHRpbnRlcmZhY2UgSVRpZGRseVdpa2kge1xuXHRcdGJyb3dzZXJTdG9yYWdlOiBhbnk7XG5cdH1cbn1cblxudHlwZSBTZXJ2ZXJTdGF0dXNDYWxsYmFjayA9IChcblx0ZXJyOiBhbnksXG5cdC8qKiBcblx0ICogJDovc3RhdHVzL0lzTG9nZ2VkSW4gbW9zdGx5IGFwcGVhcnMgYWxvbmdzaWRlIHRoZSB1c2VybmFtZSBcblx0ICogb3Igb3RoZXIgbG9naW4tY29uZGl0aW9uYWwgYmVoYXZpb3IuIFxuXHQgKi9cblx0aXNMb2dnZWRJbj86IGJvb2xlYW4sXG5cdC8qKlxuXHQgKiAkOi9zdGF0dXMvVXNlck5hbWUgaXMgc3RpbGwgdXNlZCBmb3IgdGhpbmdzIGxpa2UgZHJhZnRzIGV2ZW4gaWYgdGhlIFxuXHQgKiB1c2VyIGlzbid0IGxvZ2dlZCBpbiwgYWx0aG91Z2ggdGhlIHVzZXJuYW1lIGlzIGxlc3MgbGlrZWx5IHRvIGJlIHNob3duIFxuXHQgKiB0byB0aGUgdXNlci4gXG5cdCAqL1xuXHR1c2VybmFtZT86IHN0cmluZyxcblx0LyoqIFxuXHQgKiAkOi9zdGF0dXMvSXNSZWFkT25seSBwdXRzIHRoZSBVSSBpbiByZWFkb25seSBtb2RlLCBcblx0ICogYnV0IGRvZXMgbm90IHByZXZlbnQgYXV0b21hdGljIGNoYW5nZXMgZnJvbSBhdHRlbXB0aW5nIHRvIHNhdmUuIFxuXHQgKi9cblx0aXNSZWFkT25seT86IGJvb2xlYW4sXG5cdC8qKiBcblx0ICogJDovc3RhdHVzL0lzQW5vbnltb3VzIGRvZXMgbm90IGFwcGVhciBhbnl3aGVyZSBpbiB0aGUgVFc1IHJlcG8hIFxuXHQgKiBTbyBpdCBoYXMgbm8gYXBwYXJlbnQgcHVycG9zZS4gXG5cdCAqL1xuXHRpc0Fub255bW91cz86IGJvb2xlYW5cbikgPT4gdm9pZFxuXG5pbnRlcmZhY2UgU3luY0FkYXB0b3I8QUQ+IHtcblx0bmFtZT86IHN0cmluZztcblxuXHRpc1JlYWR5PygpOiBib29sZWFuO1xuXG5cdHJlZ2lzdGVyU3luY2VyPyhzeW5jZXI6IFN5bmNlcjxBRD4pOiB2b2lkO1xuXG5cdGdldFN0YXR1cz8oXG5cdFx0Y2I6IFNlcnZlclN0YXR1c0NhbGxiYWNrXG5cdCk6IHZvaWQ7XG5cblx0Z2V0U2tpbm55VGlkZGxlcnM/KFxuXHRcdGNiOiAoZXJyOiBhbnksIHRpZGRsZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSkgPT4gdm9pZFxuXHQpOiB2b2lkO1xuXHRnZXRVcGRhdGVkVGlkZGxlcnM/KFxuXHRcdHN5bmNlcjogU3luY2VyPEFEPixcblx0XHRjYjogKFxuXHRcdFx0ZXJyOiBhbnksXG5cdFx0XHQvKiogQXJyYXlzIG9mIHRpdGxlcyB0aGF0IGhhdmUgYmVlbiBtb2RpZmllZCBvciBkZWxldGVkICovXG5cdFx0XHR1cGRhdGVzPzogeyBtb2RpZmljYXRpb25zOiBzdHJpbmdbXSwgZGVsZXRpb25zOiBzdHJpbmdbXSB9XG5cdFx0KSA9PiB2b2lkXG5cdCk6IHZvaWQ7XG5cblx0LyoqIFxuXHQgKiB1c2VkIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IFN5bmNlciBnZXRUaWRkbGVyUmV2aXNpb24gYmVoYXZpb3Jcblx0ICogb2YgcmV0dXJuaW5nIHRoZSByZXZpc2lvbiBmaWVsZFxuXHQgKiBcblx0ICovXG5cdGdldFRpZGRsZXJSZXZpc2lvbj8odGl0bGU6IHN0cmluZyk6IHN0cmluZztcblx0LyoqIFxuXHQgKiB1c2VkIHRvIGdldCB0aGUgYWRhcHRlciBpbmZvIGZyb20gYSB0aWRkbGVyIGluIHNpdHVhdGlvbnNcblx0ICogb3RoZXIgdGhhbiB0aGUgc2F2ZVRpZGRsZXIgY2FsbGJhY2tcblx0ICovXG5cdGdldFRpZGRsZXJJbmZvKHRpZGRsZXI6IFRpZGRsZXIpOiBBRCB8IHVuZGVmaW5lZDtcblxuXHRzYXZlVGlkZGxlcihcblx0XHR0aWRkbGVyOiBhbnksXG5cdFx0Y2I6IChcblx0XHRcdGVycjogYW55LFxuXHRcdFx0YWRhcHRvckluZm8/OiBBRCxcblx0XHRcdHJldmlzaW9uPzogc3RyaW5nXG5cdFx0KSA9PiB2b2lkLFxuXHRcdGV4dHJhOiB7IHRpZGRsZXJJbmZvOiBTeW5jZXJUaWRkbGVySW5mbzxBRD4gfVxuXHQpOiB2b2lkO1xuXG5cdHNhdmVUaWRkbGVycz8ob3B0aW9uczoge1xuXHRcdHN5bmNlcjogU3luY2VyPEFEPixcblx0XHR0aWRkbGVyczogVGlkZGxlcltdLFxuXHRcdG9uTmV4dDogKHRpdGxlOiBzdHJpbmcsIGFkYXB0b3JJbmZvOiBhbnksIHJldmlzaW9uOiBzdHJpbmcpID0+IHZvaWQsXG5cdFx0b25Eb25lOiAoKSA9PiB2b2lkLFxuXHRcdG9uRXJyb3I6IChlcnI6IEVycm9yKSA9PiB2b2lkXG5cdH0pOiB2b2lkO1xuXG5cdGxvYWRUaWRkbGVycz8ob3B0aW9uczoge1xuXHRcdHN5bmNlcjogU3luY2VyPEFEPixcblx0XHR0aXRsZXM6IHN0cmluZ1tdLFxuXHRcdG9uTmV4dDogKHRpZGRsZXJGaWVsZHM6IFRpZGRsZXJGaWVsZHMpID0+IHZvaWQsXG5cdFx0b25Eb25lOiAoKSA9PiB2b2lkLFxuXHRcdG9uRXJyb3I6IChlcnI6IEVycm9yKSA9PiB2b2lkXG5cdH0pOiB2b2lkO1xuXG5cdGRlbGV0ZVRpZGRsZXJzPyhvcHRpb25zOiB7XG5cdFx0c3luY2VyOiBTeW5jZXI8QUQ+LFxuXHRcdHRpdGxlczogc3RyaW5nW10sXG5cdFx0b25OZXh0OiAodGl0bGU6IHN0cmluZykgPT4gdm9pZCxcblx0XHRvbkRvbmU6ICgpID0+IHZvaWQsXG5cdFx0b25FcnJvcjogKGVycjogRXJyb3IpID0+IHZvaWRcblx0fSk6IHZvaWQ7XG5cblx0c2V0TG9nZ2VyU2F2ZUJ1ZmZlcj86IChsb2dnZXJGb3JTYXZpbmc6IExvZ2dlcikgPT4gdm9pZDtcblx0ZGlzcGxheUxvZ2luUHJvbXB0PyhzeW5jZXI6IFN5bmNlcjxBRD4pOiB2b2lkO1xuXHRsb2dpbj8odXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgY2I6IChlcnI6IGFueSkgPT4gdm9pZCk6IHZvaWQ7XG5cdGxvZ291dD8oY2I6IChlcnI6IGFueSkgPT4gdm9pZCk6IGFueTtcblxufVxuaW50ZXJmYWNlIFN5bmNlclRpZGRsZXJJbmZvPEFEPiB7XG5cdC8qKiB0aGlzIGNvbWVzIGZyb20gdGhlIHdpa2kgY2hhbmdlQ291bnQgcmVjb3JkICovXG5cdGNoYW5nZUNvdW50OiBudW1iZXI7XG5cdC8qKiBBZGFwdGVyIGluZm8gcmV0dXJuZWQgYnkgdGhlIHN5bmMgYWRhcHRlciAqL1xuXHRhZGFwdG9ySW5mbzogQUQ7XG5cdC8qKiBSZXZpc2lvbiByZXR1cm4gYnkgdGhlIHN5bmMgYWRhcHRlciAqL1xuXHRyZXZpc2lvbjogc3RyaW5nO1xuXHQvKiogVGltZXN0YW1wIHNldCBpbiB0aGUgY2FsbGJhY2sgb2YgdGhlIHByZXZpb3VzIHNhdmUgKi9cblx0dGltZXN0YW1wTGFzdFNhdmVkOiBEYXRlO1xufVxuXG5kZWNsYXJlIGNvbnN0ICR0dzogYW55O1xuXG5kZWNsYXJlIGNvbnN0IGV4cG9ydHM6IHtcblx0YWRhcHRvckNsYXNzOiB0eXBlb2YgTXVsdGlXaWtpQ2xpZW50QWRhcHRvcjtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29uc3RhbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgQ09ORklHX0hPU1RfVElERExFUiA9IFwiJDovY29uZmlnL211bHRpd2lraWNsaWVudC9ob3N0XCI7XG5jb25zdCBERUZBVUxUX0hPU1RfVElERExFUiA9IFwiJHByb3RvY29sJC8vJGhvc3QkL1wiO1xuY29uc3QgQ09ORklHX1JFQ0lQRV9USURETEVSID0gXCIkOi9jb25maWcvbXVsdGl3aWtpY2xpZW50L3JlY2lwZVwiO1xuY29uc3QgSVNfREVWX01PREVfVElERExFUiA9IFwiJDovc3RhdGUvbXVsdGl3aWtpY2xpZW50L2Rldi1tb2RlXCI7XG5jb25zdCBMQVNUX1JFVklTSU9OX0lEX1RJRERMRVIgPSBcIiQ6L3N0YXRlL211bHRpd2lraWNsaWVudC9yZWNpcGUvbGFzdF9yZXZpc2lvbl9pZFwiO1xuY29uc3QgTVdDX1NUQVRFX1RJRERMRVJfUFJFRklYID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvXCI7XG5jb25zdCBCQUdfU1RBVEVfVElERExFUiA9IFwiJDovc3RhdGUvbXVsdGl3aWtpY2xpZW50L3RpZGRsZXJzL2JhZ1wiO1xuY29uc3QgUkVWSVNJT05fU1RBVEVfVElERExFUiA9IFwiJDovc3RhdGUvbXVsdGl3aWtpY2xpZW50L3RpZGRsZXJzL3JldmlzaW9uXCI7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVHlwZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5pbnRlcmZhY2UgTVdTQWRhcHRvckluZm8ge1xuXHRiYWc6IHN0cmluZztcblx0cmV2aXNpb246IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcbn1cblxuLy8gU3RhdHVzIHJlc3BvbnNlIGZyb20gR0VUIC9yZWNpcGUvOmlkL3N0YXR1c1xuaW50ZXJmYWNlIFJlY2lwZVN0YXR1cyB7XG5cdGlzQWRtaW46IGJvb2xlYW47XG5cdHVzZXJfaWQ6IHN0cmluZztcblx0dXNlcm5hbWU6IHN0cmluZztcblx0aXNMb2dnZWRJbjogYm9vbGVhbjtcblx0dGVtcGxhdGU6IHsgdHlwZTogc3RyaW5nOyBkZWZpbml0aW9uOiB1bmtub3duOyBwYXJhbWV0ZXJzOiB1bmtub3duIH07XG5cdGJhZ3M6IHsgYmFnX2lkOiBzdHJpbmc7IGJhZ19uYW1lOiBzdHJpbmc7IGlzX3dyaXRhYmxlOiBib29sZWFuOyBwcmlvcml0eTogbnVtYmVyOyBjYW5Vc2VyV3JpdGU6IGJvb2xlYW47IGluZm86IHVua25vd24gfVtdO1xufVxuXG4vLyBUaWRkbGVySW5mbyBmcm9tIHJlc29sdmVyXG5pbnRlcmZhY2UgVGlkZGxlckluZm8ge1xuXHR0aXRsZTogc3RyaW5nO1xuXHR3cml0ZVRvOiBzdHJpbmcgfCBudWxsO1xuXHRyZWFkRnJvbTogc3RyaW5nIHwgbnVsbDtcblx0ZXhpc3RzSW46IHN0cmluZ1tdO1xuXHRjYW5Xcml0ZTogYm9vbGVhbjtcbn1cblxudHlwZSBCYXRjaE11dGF0aW9uUmVzdWx0ID0geyB0aXRsZTogc3RyaW5nOyBpbmZvOiBUaWRkbGVySW5mbzsgcmV2aXNpb24/OiBzdHJpbmcgfTtcbnR5cGUgQmF0Y2hSZWFkUmVzdWx0ID0geyBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT4gJiB7IHRpdGxlOiBzdHJpbmcgfTsgaW5mbzogVGlkZGxlckluZm8gfSB8IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQWRhcHRvclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNsYXNzIE11bHRpV2lraUNsaWVudEFkYXB0b3IgaW1wbGVtZW50cyBTeW5jQWRhcHRvcjxNV1NBZGFwdG9ySW5mbz4ge1xuXHRuYW1lID0gXCJtdWx0aXdpa2ljbGllbnRcIjtcblxuXHRwcml2YXRlIHdpa2k6IFdpa2k7XG5cdHByaXZhdGUgaG9zdDogc3RyaW5nO1xuXHRwcml2YXRlIHJlY2lwZTogc3RyaW5nO1xuXHRwcml2YXRlIGlzRGV2TW9kZTogYm9vbGVhbjtcblx0cHJpdmF0ZSBsb2dnZXI6IExvZ2dlcjtcblx0cHJpdmF0ZSBzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz4gfCBudWxsID0gbnVsbDtcblxuXHRwcml2YXRlIGlzTG9nZ2VkSW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBpc1JlYWRPbmx5ID0gdHJ1ZTtcblx0cHJpdmF0ZSBvZmZsaW5lID0gZmFsc2U7XG5cdHByaXZhdGUgdXNlcm5hbWUgPSBcIlwiO1xuXHRlcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cblx0cHJpdmF0ZSBsYXN0U2VxID0gXCIwXCI7XG5cdHByaXZhdGUgaW5pdGlhbExvYWREb25lID0gZmFsc2U7XG5cdC8qKiB0aXRsZSDihpIgYmFnIG5hbWUsIHBvcHVsYXRlZCBvbiBsb2FkL3NhdmUgKi9cblx0cHJpdmF0ZSB0aWRkbGVyQmFnID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblx0LyoqIHRpdGxlIOKGkiByZXZpc2lvbiwgcG9wdWxhdGVkIG9uIHNhdmUgKi9cblx0cHJpdmF0ZSB0aWRkbGVyUmV2aXNpb24gPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IHsgd2lraTogV2lraSB9KSB7XG5cdFx0dGhpcy53aWtpID0gb3B0aW9ucy53aWtpO1xuXHRcdHRoaXMuaG9zdCA9IHRoaXMuZ2V0SG9zdCgpO1xuXHRcdHRoaXMucmVjaXBlID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KENPTkZJR19SRUNJUEVfVElERExFUiwgXCJcIikhO1xuXHRcdHRoaXMuaXNEZXZNb2RlID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KElTX0RFVl9NT0RFX1RJRERMRVIpID09PSBcInllc1wiO1xuXHRcdHRoaXMubGFzdFNlcSA9IHRoaXMud2lraS5nZXRUaWRkbGVyVGV4dChMQVNUX1JFVklTSU9OX0lEX1RJRERMRVIsIFwiMFwiKSE7XG5cdFx0dGhpcy5pbml0aWFsTG9hZERvbmUgPSB0aGlzLmxhc3RTZXEgIT09IFwiMFwiO1xuXHRcdHRoaXMubG9nZ2VyID0gbmV3ICR0dy51dGlscy5Mb2dnZXIoXCJNdWx0aVdpa2lDbGllbnRBZGFwdG9yXCIpO1xuXHR9XG5cblx0aXNSZWFkeSgpIHsgcmV0dXJuIHRydWU7IH1cblxuXHRzZXRMb2dnZXJTYXZlQnVmZmVyKGxvZ2dlcjogTG9nZ2VyKSB7IHRoaXMubG9nZ2VyLnNldFNhdmVCdWZmZXIobG9nZ2VyKTsgfVxuXG5cdHJlZ2lzdGVyU3luY2VyKHN5bmNlcjogU3luY2VyPE1XU0FkYXB0b3JJbmZvPikgeyB0aGlzLnN5bmNlciA9IHN5bmNlcjsgfVxuXG5cdHByaXZhdGUgaXNTdGF0ZVRpZGRsZXIodGl0bGU6IHN0cmluZykge1xuXHRcdHJldHVybiB0aXRsZS5zdGFydHNXaXRoKE1XQ19TVEFURV9USURETEVSX1BSRUZJWCk7XG5cdH1cblxuXHRwcml2YXRlIHNldFRpZGRsZXJJbmZvKHRpdGxlOiBzdHJpbmcsIGJhZzogc3RyaW5nIHwgbnVsbCwgcmV2aXNpb24/OiBzdHJpbmcpIHtcblx0XHRpZiAoYmFnKSB7XG5cdFx0XHR0aGlzLnRpZGRsZXJCYWcuc2V0KHRpdGxlLCBiYWcpO1xuXHRcdFx0dGhpcy53aWtpLnNldFRleHQoQkFHX1NUQVRFX1RJRERMRVIsIG51bGwsIHRpdGxlLCBiYWcsIHsgc3VwcHJlc3NUaW1lc3RhbXA6IHRydWUgfSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGlkZGxlckJhZy5kZWxldGUodGl0bGUpO1xuXHRcdFx0dGhpcy53aWtpLnNldFRleHQoQkFHX1NUQVRFX1RJRERMRVIsIG51bGwsIHRpdGxlLCB1bmRlZmluZWQsIHsgc3VwcHJlc3NUaW1lc3RhbXA6IHRydWUgfSk7XG5cdFx0fVxuXHRcdGlmIChyZXZpc2lvbikge1xuXHRcdFx0dGhpcy50aWRkbGVyUmV2aXNpb24uc2V0KHRpdGxlLCByZXZpc2lvbik7XG5cdFx0XHR0aGlzLndpa2kuc2V0VGV4dChSRVZJU0lPTl9TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgcmV2aXNpb24sIHsgc3VwcHJlc3NUaW1lc3RhbXA6IHRydWUgfSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjbGVhclRpZGRsZXJJbmZvKHRpdGxlOiBzdHJpbmcpIHtcblx0XHR0aGlzLnRpZGRsZXJCYWcuZGVsZXRlKHRpdGxlKTtcblx0XHR0aGlzLnRpZGRsZXJSZXZpc2lvbi5kZWxldGUodGl0bGUpO1xuXHRcdHRoaXMud2lraS5zZXRUZXh0KEJBR19TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgdW5kZWZpbmVkLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHRcdHRoaXMud2lraS5zZXRUZXh0KFJFVklTSU9OX1NUQVRFX1RJRERMRVIsIG51bGwsIHRpdGxlLCB1bmRlZmluZWQsIHsgc3VwcHJlc3NUaW1lc3RhbXA6IHRydWUgfSk7XG5cdH1cblxuXHRwcml2YXRlIHNldExhc3RTZXEoc2VxOiBzdHJpbmcpIHtcblx0XHR0aGlzLmxhc3RTZXEgPSBzZXE7XG5cdFx0dGhpcy53aWtpLnNldFRleHQoTEFTVF9SRVZJU0lPTl9JRF9USURETEVSLCBudWxsLCBcInRleHRcIiwgc2VxLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHR9XG5cblx0Z2V0VGlkZGxlclJldmlzaW9uKHRpdGxlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy53aWtpLmV4dHJhY3RUaWRkbGVyRGF0YUl0ZW0oUkVWSVNJT05fU1RBVEVfVElERExFUiwgdGl0bGUpID8/IFwiXCI7XG5cdH1cblxuXHRnZXRUaWRkbGVySW5mbyh0aWRkbGVyOiBUaWRkbGVyKTogTVdTQWRhcHRvckluZm8gfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHRpdGxlID0gdGlkZGxlci5maWVsZHMudGl0bGUgYXMgc3RyaW5nO1xuXHRcdGNvbnN0IGJhZyA9IHRoaXMud2lraS5leHRyYWN0VGlkZGxlckRhdGFJdGVtKEJBR19TVEFURV9USURETEVSLCB0aXRsZSkgPz8gdGhpcy50aWRkbGVyQmFnLmdldCh0aXRsZSk7XG5cdFx0Y29uc3QgcmV2aXNpb24gPSB0aGlzLndpa2kuZXh0cmFjdFRpZGRsZXJEYXRhSXRlbShSRVZJU0lPTl9TVEFURV9USURETEVSLCB0aXRsZSkgPz8gdGhpcy50aWRkbGVyUmV2aXNpb24uZ2V0KHRpdGxlKTtcblx0XHRyZXR1cm4gYmFnICYmIHJldmlzaW9uID8geyBiYWcsIHJldmlzaW9uLCB0aXRsZSB9IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRIb3N0KCkge1xuXHRcdGxldCB0ZXh0ID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KENPTkZJR19IT1NUX1RJRERMRVIsIERFRkFVTFRfSE9TVF9USURETEVSKSE7XG5cdFx0W1xuXHRcdFx0eyBuYW1lOiBcInByb3RvY29sXCIsIHZhbHVlOiBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCB9LFxuXHRcdFx0eyBuYW1lOiBcImhvc3RcIiwgICAgIHZhbHVlOiBkb2N1bWVudC5sb2NhdGlvbi5ob3N0IH0sXG5cdFx0XHR7IG5hbWU6IFwicGF0aG5hbWVcIiwgdmFsdWU6IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lIH0sXG5cdFx0XS5mb3JFYWNoKCh7IG5hbWUsIHZhbHVlIH0pID0+IHtcblx0XHRcdHRleHQgPSAkdHcudXRpbHMucmVwbGFjZVN0cmluZyh0ZXh0LCBuZXcgUmVnRXhwKFwiXFxcXCRcIiArIG5hbWUgKyBcIlxcXFwkXCIsIFwibWdcIiksIHZhbHVlKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gU3RhdHVzXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRhc3luYyBnZXRTdGF0dXMoY2FsbGJhY2s6IFNlcnZlclN0YXR1c0NhbGxiYWNrKSB7XG5cdFx0Y29uc3QgW29rLCAsIHJlc3VsdF0gPSBhd2FpdCB0aGlzLnJlY2lwZVJlcXVlc3QoeyBtZXRob2Q6IFwiR0VUXCIsIHVybDogXCIvc3RhdHVzXCIgfSk7XG5cdFx0aWYgKCFvayAmJiByZXN1bHQ/LnN0YXR1cyA9PT0gMCkge1xuXHRcdFx0dGhpcy5vZmZsaW5lID0gdHJ1ZTtcblx0XHRcdHRoaXMuaXNMb2dnZWRJbiA9IGZhbHNlO1xuXHRcdFx0dGhpcy5pc1JlYWRPbmx5ID0gdHJ1ZTtcblx0XHRcdHRoaXMudXNlcm5hbWUgPSBcIihvZmZsaW5lKVwiO1xuXHRcdFx0dGhpcy5lcnJvciA9IFwiVGhlIHdlYnBhZ2UgaXMgZm9yYmlkZGVuIGZyb20gY29udGFjdGluZyB0aGUgc2VydmVyLlwiO1xuXHRcdH0gZWxzZSBpZiAob2spIHtcblx0XHRcdGNvbnN0IHN0YXR1cyA9IHJlc3VsdCEucmVzcG9uc2VKU09OIGFzIFJlY2lwZVN0YXR1cztcblx0XHRcdHRoaXMub2ZmbGluZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5lcnJvciA9IG51bGw7XG5cdFx0XHR0aGlzLmlzTG9nZ2VkSW4gPSBzdGF0dXM/LmlzTG9nZ2VkSW4gPz8gZmFsc2U7XG5cdFx0XHR0aGlzLnVzZXJuYW1lID0gc3RhdHVzPy51c2VybmFtZSA/PyBcIihhbm9uKVwiO1xuXHRcdFx0dGhpcy5pc1JlYWRPbmx5ID0gIShzdGF0dXM/LmJhZ3M/LnNvbWUoYiA9PiBiLmNhblVzZXJXcml0ZSkgPz8gZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmVycm9yID0gYFNlcnZlciBlcnJvciAke3Jlc3VsdD8uc3RhdHVzfWA7XG5cdFx0fVxuXHRcdGNhbGxiYWNrKHRoaXMuZXJyb3IsIHRoaXMuaXNMb2dnZWRJbiwgdGhpcy51c2VybmFtZSwgdGhpcy5pc1JlYWRPbmx5LCBmYWxzZSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVwZGF0ZSBwb2xsaW5nXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRhc3luYyBnZXRVcGRhdGVkVGlkZGxlcnMoXG5cdFx0X3N5bmNlcjogU3luY2VyPE1XU0FkYXB0b3JJbmZvPixcblx0XHRjYWxsYmFjazogKGVycjogYW55LCB1cGRhdGVzPzogeyBtb2RpZmljYXRpb25zOiBzdHJpbmdbXTsgZGVsZXRpb25zOiBzdHJpbmdbXSB9KSA9PiB2b2lkXG5cdCkge1xuXHRcdGlmICh0aGlzLm9mZmxpbmUpIHJldHVybiBjYWxsYmFjayhudWxsKTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCF0aGlzLmluaXRpYWxMb2FkRG9uZSkge1xuXHRcdFx0XHQvLyBGZXRjaCBmdWxsIGxpc3QgKyBjdXJyZW50IGxhc3RTZXEgaW4gcGFyYWxsZWwgb24gZmlyc3QgbG9hZFxuXHRcdFx0XHRjb25zdCBbW2xpc3RPaywgLCBsaXN0UmVzdWx0XSwgW3VwZE9rLCAsIHVwZFJlc3VsdF1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHRcdHRoaXMucmVjaXBlUmVxdWVzdCh7IG1ldGhvZDogXCJHRVRcIiwgdXJsOiBcIi9saXN0Lmpzb25cIiB9KSxcblx0XHRcdFx0XHR0aGlzLnJlY2lwZVJlcXVlc3QoeyBtZXRob2Q6IFwiR0VUXCIsIHVybDogXCIvdXBkYXRlc1wiLCBxdWVyeVBhcmFtczogeyBzaW5jZTogXCIwXCIgfSB9KSxcblx0XHRcdFx0XSk7XG5cdFx0XHRcdGlmICghbGlzdE9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdGlkZGxlciBsaXN0XCIpO1xuXHRcdFx0XHRpZiAoIXVwZE9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdXBkYXRlc1wiKTtcblx0XHRcdFx0Y29uc3QgbGlzdCA9IGxpc3RSZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyBUaWRkbGVySW5mb1tdO1xuXHRcdFx0XHRjb25zdCB1cGQgPSB1cGRSZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyB7IG1vZGlmaWNhdGlvbnM6IHN0cmluZ1tdOyBkZWxldGlvbnM6IHN0cmluZ1tdOyBsYXN0U2VxOiBzdHJpbmcgfTtcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VxKHVwZC5sYXN0U2VxKTtcblx0XHRcdFx0dGhpcy5pbml0aWFsTG9hZERvbmUgPSB0cnVlO1xuXHRcdFx0XHRjYWxsYmFjayhudWxsLCB7IG1vZGlmaWNhdGlvbnM6IGxpc3QubWFwKHQgPT4gdC50aXRsZSksIGRlbGV0aW9uczogW10gfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBbb2ssICwgcmVzdWx0XSA9IGF3YWl0IHRoaXMucmVjaXBlUmVxdWVzdCh7XG5cdFx0XHRcdFx0bWV0aG9kOiBcIkdFVFwiLFxuXHRcdFx0XHRcdHVybDogXCIvdXBkYXRlc1wiLFxuXHRcdFx0XHRcdHF1ZXJ5UGFyYW1zOiB7IHNpbmNlOiB0aGlzLmxhc3RTZXEgfSxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmICghb2spIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCB1cGRhdGVzXCIpO1xuXHRcdFx0XHRjb25zdCB1cGQgPSByZXN1bHQhLnJlc3BvbnNlSlNPTiBhcyB7IG1vZGlmaWNhdGlvbnM6IHN0cmluZ1tdOyBkZWxldGlvbnM6IHN0cmluZ1tdOyBsYXN0U2VxOiBzdHJpbmcgfTtcblx0XHRcdFx0dGhpcy5zZXRMYXN0U2VxKHVwZC5sYXN0U2VxKTtcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgeyBtb2RpZmljYXRpb25zOiB1cGQubW9kaWZpY2F0aW9ucywgZGVsZXRpb25zOiB1cGQuZGVsZXRpb25zIH0pO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGU6IGFueSkge1xuXHRcdFx0Y2FsbGJhY2soZSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBCYXRjaCBvcGVyYXRpb25zIChuZXcgQVBJKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0YXN5bmMgbG9hZFRpZGRsZXJzKG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz47XG5cdFx0dGl0bGVzOiBzdHJpbmdbXTtcblx0XHRvbk5leHQ6IChmaWVsZHM6IFRpZGRsZXJGaWVsZHMpID0+IHZvaWQ7XG5cdFx0b25Eb25lOiAoKSA9PiB2b2lkO1xuXHRcdG9uRXJyb3I6IChlcnI6IEVycm9yKSA9PiB2b2lkO1xuXHR9KSB7XG5cdFx0Y29uc3QgeyB0aXRsZXMsIG9uTmV4dCwgb25Eb25lLCBvbkVycm9yIH0gPSBvcHRpb25zO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5iYXRjaE9wPEJhdGNoUmVhZFJlc3VsdFtdPihcInJlYWRcIiwgeyB0aXRsZXMgfSk7XG5cdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0cykge1xuXHRcdFx0XHRpZiAoIWl0ZW0pIGNvbnRpbnVlO1xuXHRcdFx0XHR0aGlzLnNldFRpZGRsZXJJbmZvKGl0ZW0uZmllbGRzLnRpdGxlLCBpdGVtLmluZm8ucmVhZEZyb20sIHR5cGVvZiBpdGVtLmZpZWxkcy5yZXZpc2lvbiA9PT0gXCJzdHJpbmdcIiA/IGl0ZW0uZmllbGRzLnJldmlzaW9uIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0b25OZXh0KGl0ZW0uZmllbGRzIGFzIFRpZGRsZXJGaWVsZHMpO1xuXHRcdFx0fVxuXHRcdFx0b25Eb25lKCk7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IG9uRXJyb3IoZSk7IH1cblx0fVxuXG5cdGFzeW5jIHNhdmVUaWRkbGVycyhvcHRpb25zOiB7XG5cdFx0c3luY2VyOiBTeW5jZXI8TVdTQWRhcHRvckluZm8+O1xuXHRcdHRpZGRsZXJzOiBUaWRkbGVyW107XG5cdFx0b25OZXh0OiAodGl0bGU6IHN0cmluZywgYWRhcHRvckluZm86IE1XU0FkYXB0b3JJbmZvLCByZXZpc2lvbjogc3RyaW5nKSA9PiB2b2lkO1xuXHRcdG9uRG9uZTogKCkgPT4gdm9pZDtcblx0XHRvbkVycm9yOiAoZXJyOiBFcnJvcikgPT4gdm9pZDtcblx0fSkge1xuXHRcdGNvbnN0IHsgdGlkZGxlcnMsIG9uTmV4dCwgb25Eb25lLCBvbkVycm9yIH0gPSBvcHRpb25zO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5iYXRjaE9wPEJhdGNoTXV0YXRpb25SZXN1bHRbXT4oXCJzYXZlXCIsIHtcblx0XHRcdFx0dGlkZGxlcnM6IHRpZGRsZXJzLm1hcCh0ID0+IHQuZ2V0RmllbGRTdHJpbmdzKCkpLFxuXHRcdFx0fSk7XG5cdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgcmVzdWx0cykge1xuXHRcdFx0XHRjb25zdCBiYWcgPSBpdGVtLmluZm8ud3JpdGVUbyA/PyBpdGVtLmluZm8ucmVhZEZyb20gPz8gXCJcIjtcblx0XHRcdFx0dGhpcy5zZXRUaWRkbGVySW5mbyhpdGVtLnRpdGxlLCBiYWcgfHwgbnVsbCwgaXRlbS5yZXZpc2lvbiA/PyBcIlwiKTtcblx0XHRcdFx0aWYgKCR0dy5icm93c2VyU3RvcmFnZT8uaXNFbmFibGVkKCkpICR0dy5icm93c2VyU3RvcmFnZS5yZW1vdmVUaWRkbGVyRnJvbUxvY2FsU3RvcmFnZShpdGVtLnRpdGxlKTtcblx0XHRcdFx0b25OZXh0KGl0ZW0udGl0bGUsIHsgYmFnLCByZXZpc2lvbjogaXRlbS5yZXZpc2lvbiA/PyBcIlwiLCB0aXRsZTogaXRlbS50aXRsZSB9LCBpdGVtLnJldmlzaW9uID8/IFwiXCIpO1xuXHRcdFx0fVxuXHRcdFx0b25Eb25lKCk7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IG9uRXJyb3IoZSk7IH1cblx0fVxuXG5cdGFzeW5jIGRlbGV0ZVRpZGRsZXJzKG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjxNV1NBZGFwdG9ySW5mbz47XG5cdFx0dGl0bGVzOiBzdHJpbmdbXTtcblx0XHRvbk5leHQ6ICh0aXRsZTogc3RyaW5nKSA9PiB2b2lkO1xuXHRcdG9uRG9uZTogKCkgPT4gdm9pZDtcblx0XHRvbkVycm9yOiAoZXJyOiBFcnJvcikgPT4gdm9pZDtcblx0fSkge1xuXHRcdGNvbnN0IHsgdGl0bGVzLCBvbk5leHQsIG9uRG9uZSwgb25FcnJvciB9ID0gb3B0aW9ucztcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaE11dGF0aW9uUmVzdWx0W10+KFwiZGVsZXRlXCIsIHsgdGl0bGVzIH0pO1xuXHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIHJlc3VsdHMpIHtcblx0XHRcdFx0dGhpcy5jbGVhclRpZGRsZXJJbmZvKGl0ZW0udGl0bGUpO1xuXHRcdFx0XHRvbk5leHQoaXRlbS50aXRsZSk7XG5cdFx0XHR9XG5cdFx0XHRvbkRvbmUoKTtcblx0XHR9IGNhdGNoIChlOiBhbnkpIHsgb25FcnJvcihlKTsgfVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBTaW5nbGUtdGlkZGxlciBvcGVyYXRpb25zIChmYWxsYmFjayBmb3Igb2xkZXIgc2VydmVyIHZlcnNpb25zKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0YXN5bmMgc2F2ZVRpZGRsZXIoXG5cdFx0dGlkZGxlcjogVGlkZGxlcixcblx0XHRjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IE1XU0FkYXB0b3JJbmZvLCByZXZpc2lvbj86IHN0cmluZykgPT4gdm9pZFxuXHQpIHtcblx0XHRjb25zdCB0aXRsZSA9IHRpZGRsZXIuZmllbGRzLnRpdGxlIGFzIHN0cmluZztcblx0XHRpZiAodGl0bGUgPT09IFwiJDovU3RvcnlMaXN0XCIgfHwgdGhpcy5pc1JlYWRPbmx5IHx8IHRoaXMuaXNTdGF0ZVRpZGRsZXIodGl0bGUpKSByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmJhdGNoT3A8QmF0Y2hNdXRhdGlvblJlc3VsdFtdPihcInNhdmVcIiwgeyB0aWRkbGVyczogW3RpZGRsZXIuZ2V0RmllbGRTdHJpbmdzKCldIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyByZXN1bHQgcmV0dXJuZWRcIikpO1xuXHRcdFx0Y29uc3QgYmFnID0gaXRlbS5pbmZvLndyaXRlVG8gPz8gaXRlbS5pbmZvLnJlYWRGcm9tID8/IFwiXCI7XG5cdFx0XHR0aGlzLnNldFRpZGRsZXJJbmZvKHRpdGxlLCBiYWcgfHwgbnVsbCwgaXRlbS5yZXZpc2lvbiA/PyBcIlwiKTtcblx0XHRcdGlmICgkdHcuYnJvd3NlclN0b3JhZ2U/LmlzRW5hYmxlZCgpKSAkdHcuYnJvd3NlclN0b3JhZ2UucmVtb3ZlVGlkZGxlckZyb21Mb2NhbFN0b3JhZ2UodGl0bGUpO1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgeyBiYWcsIHJldmlzaW9uOiBpdGVtLnJldmlzaW9uID8/IFwiXCIsIHRpdGxlIH0sIGl0ZW0ucmV2aXNpb24gPz8gXCJcIik7XG5cdFx0fSBjYXRjaCAoZTogYW55KSB7IGNhbGxiYWNrKGUpOyB9XG5cdH1cblxuXHRhc3luYyBsb2FkVGlkZGxlcih0aXRsZTogc3RyaW5nLCBjYWxsYmFjazogKGVycjogYW55LCBmaWVsZHM/OiBhbnkpID0+IHZvaWQsIF9vcHRpb25zOiBhbnkpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaFJlYWRSZXN1bHRbXT4oXCJyZWFkXCIsIHsgdGl0bGVzOiBbdGl0bGVdIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhudWxsLCBudWxsKTtcblx0XHRcdHRoaXMuc2V0VGlkZGxlckluZm8odGl0bGUsIGl0ZW0uaW5mby5yZWFkRnJvbSwgdHlwZW9mIGl0ZW0uZmllbGRzLnJldmlzaW9uID09PSBcInN0cmluZ1wiID8gaXRlbS5maWVsZHMucmV2aXNpb24gOiB1bmRlZmluZWQpO1xuXHRcdFx0Y2FsbGJhY2sobnVsbCwgaXRlbS5maWVsZHMpO1xuXHRcdH0gY2F0Y2ggKGU6IGFueSkgeyBjYWxsYmFjayhlKTsgfVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlVGlkZGxlcih0aXRsZTogc3RyaW5nLCBjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IGFueSkgPT4gdm9pZCwgX29wdGlvbnM6IGFueSkge1xuXHRcdGlmICh0aGlzLmlzUmVhZE9ubHkpIHJldHVybiBjYWxsYmFjayhudWxsKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuYmF0Y2hPcDxCYXRjaE11dGF0aW9uUmVzdWx0W10+KFwiZGVsZXRlXCIsIHsgdGl0bGVzOiBbdGl0bGVdIH0pO1xuXHRcdFx0Y29uc3QgaXRlbSA9IHJlc3VsdHNbMF07XG5cdFx0XHRpZiAoIWl0ZW0pIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJObyByZXN1bHQgcmV0dXJuZWRcIikpO1xuXHRcdFx0dGhpcy5jbGVhclRpZGRsZXJJbmZvKHRpdGxlKTtcblx0XHRcdGNhbGxiYWNrKG51bGwsIG51bGwpO1xuXHRcdH0gY2F0Y2ggKGU6IGFueSkgeyBjYWxsYmFjayhlKTsgfVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBIVFRQIGhlbHBlcnNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdHByaXZhdGUgYXN5bmMgYmF0Y2hPcDxUPihvcDogc3RyaW5nLCBib2R5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxUPiB7XG5cdFx0Y29uc3QgW29rLCBlcnIsIHJlc3VsdF0gPSBhd2FpdCB0aGlzLnJlY2lwZVJlcXVlc3Qoe1xuXHRcdFx0bWV0aG9kOiBcIlBVVFwiLFxuXHRcdFx0dXJsOiBcIi9iYXRjaC9cIiArIG9wLFxuXHRcdFx0cmVxdWVzdEJvZHlTdHJpbmc6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuXHRcdFx0aGVhZGVyczogeyBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuXHRcdH0pO1xuXHRcdGlmICghb2spIHRocm93IGVycjtcblx0XHRpZiAoIXJlc3VsdCEucmVzcG9uc2VKU09OKSB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXNwb25zZSBKU09OIGZyb20gYmF0Y2gvXCIgKyBvcCk7XG5cdFx0cmV0dXJuIHJlc3VsdCEucmVzcG9uc2VKU09OIGFzIFQ7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHJlY2lwZVJlcXVlc3Qob3B0aW9uczoge1xuXHRcdG1ldGhvZDogc3RyaW5nO1xuXHRcdHVybDogc3RyaW5nO1xuXHRcdGhlYWRlcnM/OiBIZWFkZXJzSW5pdDtcblx0XHRxdWVyeVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cdFx0cmVxdWVzdEJvZHlTdHJpbmc/OiBzdHJpbmc7XG5cdH0pIHtcblx0XHRpZiAoIW9wdGlvbnMudXJsLnN0YXJ0c1dpdGgoXCIvXCIpKSB0aHJvdyBuZXcgRXJyb3IoXCJVUkwgbXVzdCBzdGFydCB3aXRoIC9cIik7XG5cdFx0Y29uc3QgaXNEZXZNb2RlID0gdGhpcy5pc0Rldk1vZGU7XG5cdFx0cmV0dXJuIGh0dHBSZXF1ZXN0KHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRyZXNwb25zZVR5cGU6IFwiYmxvYlwiLFxuXHRcdFx0dXJsOiB0aGlzLmhvc3QgKyBcInJlY2lwZS9cIiArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLnJlY2lwZSkgKyBvcHRpb25zLnVybCxcblx0XHR9KS50aGVuKGFzeW5jIGUgPT4ge1xuXHRcdFx0aWYgKCFlLm9rKSByZXR1cm4gW2ZhbHNlLCBuZXcgRXJyb3IoXG5cdFx0XHRcdGBTZXJ2ZXIgcmV0dXJuZWQgJHtlLnN0YXR1c306ICR7ZS5oZWFkZXJzLmdldChcIngtcmVhc29uXCIpID8/IFwiKG5vIHJlYXNvbilcIn1gXG5cdFx0XHQpLCB7IC4uLmUsIHJlc3BvbnNlSlNPTjogdW5kZWZpbmVkIH1dIGFzIGNvbnN0O1xuXG5cdFx0XHRsZXQgcmVzcG9uc2VTdHJpbmc6IHN0cmluZztcblx0XHRcdGlmIChlLmhlYWRlcnMuZ2V0KFwieC1nemlwLXN0cmVhbVwiKSA9PT0gXCJ5ZXNcIikge1xuXHRcdFx0XHRyZXNwb25zZVN0cmluZyA9IGF3YWl0IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRsZXQgcyA9IFwiXCI7XG5cdFx0XHRcdFx0Y29uc3QgZ3ogPSBuZXcgZmZsYXRlLkFzeW5jR3VuemlwKChlcnIsIGNodW5rLCBmaW5hbCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGVycikgcmV0dXJuO1xuXHRcdFx0XHRcdFx0cyArPSBmZmxhdGUuc3RyRnJvbVU4KGNodW5rKTtcblx0XHRcdFx0XHRcdGlmIChmaW5hbCkgcmVzb2x2ZShzKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAoaXNEZXZNb2RlKSBnei5vbm1lbWJlciA9IG0gPT4gY29uc29sZS5sb2coXCJndW56aXAgbWVtYmVyXCIsIG0pO1xuXHRcdFx0XHRcdHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihlLnJlc3BvbnNlIGFzIEJsb2IpLnRoZW4oYnVmID0+IHtcblx0XHRcdFx0XHRcdGd6LnB1c2gobmV3IFVpbnQ4QXJyYXkoYnVmKSk7XG5cdFx0XHRcdFx0XHRnei5wdXNoKG5ldyBVaW50OEFycmF5KDApLCB0cnVlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXNwb25zZVN0cmluZyA9IGZmbGF0ZS5zdHJGcm9tVTgobmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEJsb2JBc0FycmF5QnVmZmVyKGUucmVzcG9uc2UgYXMgQmxvYikpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFt0cnVlLCB1bmRlZmluZWQsIHtcblx0XHRcdFx0Li4uZSxcblx0XHRcdFx0cmVzcG9uc2VKU09OOiBlLnN0YXR1cyA9PT0gMjAwID8gdHJ5UGFyc2VKU09OKHJlc3BvbnNlU3RyaW5nKSA6IHVuZGVmaW5lZCxcblx0XHRcdH1dIGFzIGNvbnN0O1xuXHRcdH0sIGUgPT4gW2ZhbHNlLCBlLCB1bmRlZmluZWRdIGFzIGNvbnN0KTtcblx0fVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFV0aWxpdGllc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIHRyeVBhcnNlSlNPTihzOiBzdHJpbmcpIHtcblx0dHJ5IHsgcmV0dXJuIEpTT04ucGFyc2Uocyk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS5lcnJvcihcIkpTT04gcGFyc2UgZXJyb3JcIiwgZSk7IHJldHVybiB1bmRlZmluZWQ7IH1cbn1cblxudHlwZSBQYXJhbXNJbnB1dCA9IFVSTFNlYXJjaFBhcmFtcyB8IFtzdHJpbmcsIHN0cmluZ11bXSB8IG9iamVjdCB8IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuaW50ZXJmYWNlIEh0dHBSZXF1ZXN0T3B0aW9uczxUWVBFIGV4dGVuZHMgXCJhcnJheWJ1ZmZlclwiIHwgXCJibG9iXCIgfCBcInRleHRcIj4ge1xuXHRtZXRob2Q6IHN0cmluZztcblx0dXJsOiBzdHJpbmc7XG5cdHJlc3BvbnNlVHlwZTogVFlQRTtcblx0aGVhZGVycz86IEhlYWRlcnNJbml0O1xuXHRxdWVyeVBhcmFtcz86IFBhcmFtc0lucHV0O1xuXHRyZXF1ZXN0Qm9keVN0cmluZz86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gaHR0cFJlcXVlc3Q8VFlQRSBleHRlbmRzIFwiYXJyYXlidWZmZXJcIiB8IFwiYmxvYlwiIHwgXCJ0ZXh0XCI+KG9wdGlvbnM6IEh0dHBSZXF1ZXN0T3B0aW9uczxUWVBFPikge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8e1xuXHRcdG9rOiBib29sZWFuOyBzdGF0dXM6IG51bWJlcjsgc3RhdHVzVGV4dDogc3RyaW5nOyBoZWFkZXJzOiBIZWFkZXJzO1xuXHRcdHJlc3BvbnNlOiBUWVBFIGV4dGVuZHMgXCJhcnJheWJ1ZmZlclwiID8gQXJyYXlCdWZmZXIgOiBUWVBFIGV4dGVuZHMgXCJibG9iXCIgPyBCbG9iIDogc3RyaW5nO1xuXHR9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0b3B0aW9ucy5tZXRob2QgPSBvcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuXHRcdGNvbnN0IHVybCA9IG5ldyBVUkwob3B0aW9ucy51cmwsIGxvY2F0aW9uLmhyZWYpO1xuXHRcdHBhcmFtc0lucHV0KG9wdGlvbnMucXVlcnlQYXJhbXMpLmZvckVhY2goKHYsIGspID0+IHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKGssIHYpKTtcblx0XHRjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzIHx8IHt9KTtcblx0XHRjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdFx0cmVxdWVzdC5yZXNwb25zZVR5cGUgPSBvcHRpb25zLnJlc3BvbnNlVHlwZTtcblx0XHRyZXF1ZXN0Lm9wZW4ob3B0aW9ucy5tZXRob2QsIHVybCwgdHJ1ZSk7XG5cdFx0aWYgKCFoZWFkZXJzLmhhcyhcImNvbnRlbnQtdHlwZVwiKSkgaGVhZGVycy5zZXQoXCJjb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIik7XG5cdFx0aWYgKCFoZWFkZXJzLmhhcyhcIngtcmVxdWVzdGVkLXdpdGhcIikpIGhlYWRlcnMuc2V0KFwieC1yZXF1ZXN0ZWQtd2l0aFwiLCBcIlRpZGRseVdpa2lcIik7XG5cdFx0aGVhZGVycy5zZXQoXCJhY2NlcHRcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuXHRcdGhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4gcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGssIHYpKTtcblx0XHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IDQpIHJldHVybjtcblx0XHRcdGNvbnN0IGggPSBuZXcgSGVhZGVycygpO1xuXHRcdFx0cmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKT8udHJpbSgpLnNwbGl0KC9bXFxyXFxuXSsvKS5mb3JFYWNoKGxpbmUgPT4ge1xuXHRcdFx0XHRjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoXCI6IFwiKTtcblx0XHRcdFx0Y29uc3Qga2V5ID0gcGFydHMuc2hpZnQoKT8udG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0aWYgKGtleSkgaC5hcHBlbmQoa2V5LCBwYXJ0cy5qb2luKFwiOiBcIikpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXNvbHZlKHsgb2s6IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMCwgc3RhdHVzOiB0aGlzLnN0YXR1cywgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LCByZXNwb25zZTogdGhpcy5yZXNwb25zZSwgaGVhZGVyczogaCB9KTtcblx0XHR9O1xuXHRcdHJlcXVlc3Quc2VuZChvcHRpb25zLnJlcXVlc3RCb2R5U3RyaW5nKTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gcGFyYW1zSW5wdXQoaW5wdXQ6IFBhcmFtc0lucHV0KSB7XG5cdFx0aWYgKCFpbnB1dCkgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblx0XHRpZiAoaW5wdXQgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHJldHVybiBpbnB1dDtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkgfHwgdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiKSByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcyhpbnB1dCk7XG5cdFx0Y29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGlucHV0KSB7XG5cdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGlucHV0LCBrZXkpKSB7XG5cdFx0XHRcdHBhcmFtcy5hcHBlbmQoa2V5LCAoaW5wdXQgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPilba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBwYXJhbXM7XG5cdH1cbn1cblxuZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2I6IEJsb2IpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPEFycmF5QnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Y29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRyZWFkZXIub25sb2FkID0gKCkgPT4gcmVzb2x2ZShyZWFkZXIucmVzdWx0IGFzIEFycmF5QnVmZmVyKTtcblx0XHRyZWFkZXIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoXCJFcnJvciByZWFkaW5nIGJsb2JcIikpO1xuXHRcdHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcblx0fSk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRXhwb3J0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuaWYgKCR0dy5icm93c2VyICYmIGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sLnN0YXJ0c1dpdGgoXCJodHRwXCIpKSB7XG5cdGV4cG9ydHMuYWRhcHRvckNsYXNzID0gTXVsdGlXaWtpQ2xpZW50QWRhcHRvcjtcbn1cbiJdfQ==