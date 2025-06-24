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
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_HOST_TIDDLER = "$:/config/multiwikiclient/host", DEFAULT_HOST_TIDDLER = "$protocol$//$host$/", MWC_STATE_TIDDLER_PREFIX = "$:/state/multiwikiclient/", BAG_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/bag", REVISION_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/revision", CONNECTION_STATE_TIDDLER = "$:/state/multiwikiclient/connection", INCOMING_UPDATES_FILTER_TIDDLER = "$:/config/multiwikiclient/incoming-updates-filter", ENABLE_SSE_TIDDLER = "$:/config/multiwikiclient/use-server-sent-events", IS_DEV_MODE_TIDDLER = `$:/state/multiwikiclient/dev-mode`, ENABLE_GZIP_STREAM_TIDDLER = `$:/state/multiwikiclient/gzip-stream`;
var SERVER_NOT_CONNECTED = "NOT CONNECTED", SERVER_CONNECTING_SSE = "CONNECTING SSE", SERVER_CONNECTED_SSE = "CONNECTED SSE", SERVER_POLLING = "SERVER POLLING";
class MultiWikiClientAdaptor {
    constructor(options) {
        this.name = "multiwikiclient";
        this.supportsLazyLoading = true;
        this.error = null;
        this.syncTimeout = null;
        this.wiki = options.wiki;
        this.host = this.getHost();
        this.recipe = this.wiki.getTiddlerText("$:/config/multiwikiclient/recipe");
        this.useServerSentEvents = this.wiki.getTiddlerText(ENABLE_SSE_TIDDLER) === "yes";
        this.isDevMode = this.wiki.getTiddlerText(IS_DEV_MODE_TIDDLER) === "yes";
        this.useGzipStream = this.wiki.getTiddlerText(ENABLE_GZIP_STREAM_TIDDLER) === "yes";
        this.last_known_revision_id = this.wiki.getTiddlerText("$:/state/multiwikiclient/recipe/last_revision_id", "0");
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
    setUpdateConnectionStatus(status) {
        this.serverUpdateConnectionStatus = status;
        this.wiki.addTiddler({
            title: CONNECTION_STATE_TIDDLER,
            text: status
        });
    }
    setLoggerSaveBuffer(loggerForSaving) {
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
    getTiddlerInfo(tiddler) {
        var title = tiddler.fields.title, revision = this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title), bag = this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
        if (revision && bag) {
            return {
                title: title,
                revision: revision,
                bag: bag
            };
        }
        else {
            return undefined;
        }
    }
    getTiddlerBag(title) {
        return this.wiki.extractTiddlerDataItem(BAG_STATE_TIDDLER, title);
    }
    getTiddlerRevision(title) {
        return this.wiki.extractTiddlerDataItem(REVISION_STATE_TIDDLER, title);
    }
    setTiddlerInfo(title, revision, bag) {
        this.wiki.setText(BAG_STATE_TIDDLER, null, title, bag, { suppressTimestamp: true });
        this.wiki.setText(REVISION_STATE_TIDDLER, null, title, revision, { suppressTimestamp: true });
    }
    removeTiddlerInfo(title) {
        this.wiki.setText(BAG_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
        this.wiki.setText(REVISION_STATE_TIDDLER, null, title, undefined, { suppressTimestamp: true });
    }
    /*
    Get the current status of the server connection
    */
    async getStatus(callback) {
        var _a, _b, _c, _d;
        const [ok, error, data] = await this.recipeRequest({
            key: "handleGetRecipeStatus",
            method: "GET",
            url: "/status",
        });
        this.connectRecipeEvents();
        if (!ok && (data === null || data === void 0 ? void 0 : data.status) === 0) {
            this.error = "The webpage is forbidden from contacting the server.";
            this.isLoggedIn = false;
            this.isReadOnly = true;
            this.username = "(offline)";
            this.offline = true;
        }
        else if (ok) {
            this.error = null;
            const status = data.responseJSON;
            this.isReadOnly = (_a = status === null || status === void 0 ? void 0 : status.isReadOnly) !== null && _a !== void 0 ? _a : true;
            this.isLoggedIn = (_b = status === null || status === void 0 ? void 0 : status.isLoggedIn) !== null && _b !== void 0 ? _b : false;
            this.username = (_c = status === null || status === void 0 ? void 0 : status.username) !== null && _c !== void 0 ? _c : "(anon)";
            this.offline = false;
        }
        else {
            this.error = (_d = error.message) !== null && _d !== void 0 ? _d : `${error}`;
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
            false);
        }
    }
    /*
    Get details of changed tiddlers from the server
    */
    async getUpdatedTiddlers(syncer, callback) {
        if (this.offline)
            return callback(null);
        if (!this.bags || this.serverUpdateConnectionStatus === SERVER_NOT_CONNECTED)
            await this.pollServer();
        const { modifications, deletions, last_revision } = this.updateBags();
        this.last_known_revision_id = last_revision;
        // syncer.processTaskQueue = () => { };
        callback(null, { modifications, deletions });
        // // @ts-expect-error
        // delete syncer.processTaskQueue;
        // await this.fastQueue(syncer);
    }
    async fastQueue(syncer) {
        let task = null;
        let active = [];
        while (task = syncer.chooseNextTask()) {
            if (task.type === "syncfromserver")
                break;
            active.push(new Promise((r) => task.run(r)));
        }
        await Promise.all(active);
        syncer.updateDirtyStatus();
        syncer.processTaskQueue();
    }
    debounceSyncFromServer() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(() => {
            this.syncTimeout = null;
            if (this.syncer) {
                this.syncer.syncFromServer();
            }
            else {
                console.warn("No syncer available to sync from server");
            }
        }, 1000);
    }
    connectRecipeEvents() {
        const event = new EventSource(this.host + "recipe/" + encodeURIComponent(this.recipe) + "/events?first-event-id=" + encodeURIComponent(this.last_known_revision_id));
        this.setUpdateConnectionStatus(SERVER_CONNECTING_SSE);
        const onEvent = (e) => {
            const data = JSON.parse(e.data);
            if (!this.bags)
                return;
            const bag = this.bags.find(b => b.bag_name === data.bag_name);
            if (!bag)
                return;
            const tiddler = bag.tiddlers.find(t => t.title === data.title);
            if (!tiddler) {
                if (e.type === "tiddler.delete")
                    return;
                // If the tiddler is not found, it must be a new tiddler
                bag.tiddlers.push({
                    title: data.title,
                    revision_id: data.revision_id,
                    is_deleted: false,
                });
            }
            else {
                tiddler.is_deleted = (e.type === "tiddler.delete");
                tiddler.revision_id = data.revision_id;
            }
            this.debounceSyncFromServer();
        };
        const onUpdate = (e) => {
            if (!this.bags)
                return;
            const updates = JSON.parse(e.data);
            const existBags = new Map(this.bags.map(b => [b.bag_name, b.tiddlers]));
            updates.forEach(e => {
                const existBag = existBags.get(e.bag.bag_name);
                if (!existBag)
                    return;
                const existTids = new Map(existBag.map(t => [t.title, t]));
                e.bag.tiddlers.forEach(tid => {
                    const existTid = existTids.get(tid.title);
                    if (existTid) {
                        Object.assign(existTid, tid);
                    }
                    else {
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
            }
            else if (event.readyState === EventSource.CONNECTING) {
                this.setUpdateConnectionStatus(SERVER_CONNECTING_SSE);
                console.warn("Connecting to server events");
            }
            else {
                console.error("Error in server events connection", e);
            }
        });
    }
    async pollServer() {
        const [ok, err, result] = await this.recipeRequest({
            key: "handleGetBags",
            url: "/bags",
            method: "GET",
        });
        if (!ok)
            throw err;
        if (!result.responseJSON)
            throw new Error("no result returned");
        this.bags = await Promise.all(result.responseJSON.map(e => this.recipeRequest({
            key: "handleGetBagState",
            url: "/bags/" + encodeURIComponent(e.bag_name) + "/state",
            method: "GET",
            queryParams: { include_deleted: "yes" },
        }).then(([ok, err, f]) => {
            if (!ok)
                throw err;
            if (!f.responseJSON)
                throw new Error("no result returned");
            return Object.assign(Object.assign({}, f.responseJSON), { position: e.position });
        })));
        this.bags.sort((a, b) => b.position - a.position);
    }
    updateBags() {
        if (!this.bags)
            throw new Error("No bags loaded, call pollServer first");
        const modified = new Set(), deleted = new Set();
        const incomingTitles = new Set(this.bags.map(
        // get the titles in each layer that aren't deleted
        e => e.tiddlers.filter(f => !f.is_deleted).map(f => f.title)
        // and flatten them for Set
        ).flat());
        let last_revision = this.last_known_revision_id;
        this.bags.forEach(bag => {
            bag.tiddlers.forEach(tid => {
                // if the revision is old, ignore, since deletions create a new revision
                if (tid.revision_id <= this.last_known_revision_id)
                    return;
                if (tid.revision_id > last_revision)
                    last_revision = tid.revision_id;
                // check if this title still exists in any layer
                if (incomingTitles.has(tid.title))
                    modified.add(tid.title);
                else
                    deleted.add(tid.title);
            });
        });
        return {
            modifications: [...modified.keys()],
            deletions: [...deleted.keys()],
            last_revision,
            incomingTitles,
        };
    }
    /*
    Queue a load for a tiddler if there has been an update for it since the specified revision
    */
    checkLastRecordedUpdate(title, revision) {
        // var lru = this.lastRecordedUpdate[title];
        // if (lru && lru.revision_id > revision) {
        // 	console.log(`Checking for updates to ${title} since ${JSON.stringify(lru)} comparing to ${revision}`);
        // 	this.syncer && this.syncer.enqueueLoadTiddler(title);
        // }
    }
    get syncer() {
        if ($tw.syncadaptor === this)
            return $tw.syncer;
    }
    /*
    Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
    */
    async saveTiddler(tiddler, callback, options) {
        var self = this, title = tiddler.fields.title;
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
            body += `\n\n${text}`;
        }
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
        if (!ok)
            return callback(err);
        const data = result.responseJSON;
        if (!data)
            return callback(null); // a 2xx response without a body is unlikely
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
        }
        else {
            callback(null, { bag: bag_name }, revision);
        }
    }
    /*
    Load a tiddler and invoke the callback with (err,tiddlerFields)

    The syncer does not pass itself into options.
    */
    async loadTiddler(title, callback, options) {
        var _a, _b;
        const self = this;
        if (!self.syncer)
            return callback(new Error("No syncer available"));
        self.outstandingRequests[title] = { type: "GET" };
        const [ok, err, result] = await this.recipeRequest({
            key: "handleLoadRecipeTiddler",
            url: "/tiddlers/" + encodeURIComponent(title),
            method: "GET",
        });
        delete self.outstandingRequests[title];
        if (!ok)
            return callback(err);
        const { responseJSON: data, headers } = result;
        const revision = (_a = headers.get("x-revision-number")) !== null && _a !== void 0 ? _a : "", bag_name = (_b = headers.get("x-bag-name")) !== null && _b !== void 0 ? _b : "";
        if (!revision || !bag_name || !data)
            return callback(null, null);
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
    async deleteTiddler(title, callback, options) {
        var self = this;
        if (this.isReadOnly) {
            return callback(null);
        }
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
        if (!ok)
            return callback(err);
        const { responseJSON: data } = result;
        if (!data)
            return callback(null);
        const revision = data.revision_id, bag_name = data.bag_name;
        // If there has been a more recent update from the server then enqueue a load of this tiddler
        self.checkLastRecordedUpdate(title, revision);
        self.removeTiddlerInfo(title);
        // Invoke the callback & return null adaptorInfo
        callback(null, null);
    }
    /**
     * This throws an error if the response status is not 2xx, but will still return the response alongside the error.
     *
     * So if the first parameter is false, the third parameter may still contain the response.
     */
    async recipeRequest(options) {
        if (!options.url.startsWith("/"))
            throw new Error("The url does not start with a slash");
        return await httpRequest(Object.assign(Object.assign({}, options), { responseType: "blob", url: this.host + "recipe/" + encodeURIComponent(this.recipe) + options.url })).then(async (e) => {
            var _a;
            if (!e.ok)
                return [
                    false, new Error(`The server return a status code ${e.status} with the following reason: `
                        + `${(_a = e.headers.get("x-reason")) !== null && _a !== void 0 ? _a : "(no reason given)"}`),
                    Object.assign(Object.assign({}, e), { responseString: "", responseJSON: undefined })
                ];
            let responseString = "";
            if (e.headers.get("x-gzip-stream") === "yes") {
                // Browsers only decode the first stream, 
                // so we cant use content-encoding or DecompressionStream
                await new Promise(async (resolve) => {
                    const gunzip = new fflate.AsyncGunzip((err, chunk, final) => {
                        if (err)
                            return console.log(err);
                        responseString += fflate.strFromU8(chunk);
                        if (final)
                            resolve();
                    });
                    if (this.isDevMode)
                        gunzip.onmember = e => console.log("gunzip member", e);
                    gunzip.push(new Uint8Array(await readBlobAsArrayBuffer(e.response)));
                    // this has to be on a separate line
                    gunzip.push(new Uint8Array(), true);
                });
                if (this.isDevMode)
                    console.log("gunzip result", responseString.length);
            }
            else {
                responseString = fflate.strFromU8(new Uint8Array(await readBlobAsArrayBuffer(e.response)));
            }
            return [true, void 0, Object.assign(Object.assign({}, e), { responseString, 
                    /** this is undefined if status is not 200 */
                    responseJSON: e.status === 200
                        ? tryParseJSON(responseString)
                        : undefined })];
        }, e => [false, e, void 0]);
        function tryParseJSON(data) {
            try {
                return JSON.parse(data);
            }
            catch (e) {
                console.error("Error parsing JSON, returning undefined", e);
                // console.log(data);
                return undefined;
            }
        }
    }
}
if ($tw.browser && document.location.protocol.startsWith("http")) {
    exports.adaptorClass = MultiWikiClientAdaptor;
}
function httpRequest(options) {
    return new Promise((resolve, reject) => {
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
        }
        catch (e) {
            console.log(e, { e });
            throw e;
        }
        if (!headers.has("content-type"))
            headers.set("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        if (!headers.has("x-requested-with"))
            headers.set("x-requested-with", "TiddlyWiki");
        headers.set("accept", "application/json");
        headers.forEach((v, k) => {
            request.setRequestHeader(k, v);
        });
        request.onreadystatechange = function () {
            var _a;
            if (this.readyState !== 4)
                return;
            const headers = new Headers();
            (_a = request.getAllResponseHeaders()) === null || _a === void 0 ? void 0 : _a.trim().split(/[\r\n]+/).forEach((line) => {
                var _a;
                const parts = line.split(": ");
                const header = (_a = parts.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                const value = parts.join(": ");
                if (header)
                    headers.append(header, value);
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
        try {
            request.send(options.requestBodyString);
        }
        catch (e) {
            console.log(e, { e });
            throw e;
        }
    });
    function paramsInput(input) {
        if (!input)
            return new URLSearchParams();
        if (input instanceof URLSearchParams)
            return input;
        if (Array.isArray(input) || typeof input === "string")
            return new URLSearchParams(input);
        return new URLSearchParams(Object.entries(input));
    }
}
function readBlobAsArrayBuffer(blob) {
    const error = new Error("Error reading blob");
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(error);
        };
        reader.readAsArrayBuffer(blob);
    });
}
