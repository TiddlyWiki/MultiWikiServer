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
var CONFIG_HOST_TIDDLER = "$:/config/multiwikiclient/host", DEFAULT_HOST_TIDDLER = "$protocol$//$host$/", MWC_STATE_TIDDLER_PREFIX = "$:/state/multiwikiclient/", BAG_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/bag", REVISION_STATE_TIDDLER = "$:/state/multiwikiclient/tiddlers/revision", CONNECTION_STATE_TIDDLER = "$:/state/multiwikiclient/connection", INCOMING_UPDATES_FILTER_TIDDLER = "$:/config/multiwikiclient/incoming-updates-filter", ENABLE_SSE_TIDDLER = "$:/config/multiwikiclient/use-server-sent-events";
var SERVER_NOT_CONNECTED = "NOT CONNECTED", SERVER_CONNECTING_SSE = "CONNECTING SSE", SERVER_CONNECTED_SSE = "CONNECTED SSE", SERVER_POLLING = "SERVER POLLING";
class MultiWikiClientAdaptor {
    constructor(options) {
        this.name = "multiwikiclient";
        this.supportsLazyLoading = true;
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
    httpRequest(options) {
        return (new Promise((resolve) => {
            $tw.utils.httpRequest(Object.assign(Object.assign({}, options), { responseType: options.responseType === "json" ? "text" : options.responseType, callback: (err, data, request) => {
                    var _a;
                    if (err)
                        return resolve([false, err || new Error("Unknown error"), undefined]);
                    // Create a map of header names to values
                    const headers = {};
                    (_a = request.getAllResponseHeaders()) === null || _a === void 0 ? void 0 : _a.trim().split(/[\r\n]+/).forEach((line) => {
                        var _a;
                        const parts = line.split(": ");
                        const header = (_a = parts.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                        const value = parts.join(": ");
                        if (header)
                            headers[header] = value;
                    });
                    // Resolve the promise with the response data and headers
                    resolve([true, undefined, {
                            headers,
                            data: options.responseType === "json" ? $tw.utils.parseJSONSafe(data, () => undefined) : data,
                        }]);
                } }));
        }));
    }
    /*
    Get the current status of the server connection
    */
    getStatus(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const [ok, error, data] = yield this.httpRequest({
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
                if (callback)
                    callback(error);
                return;
            }
            /** @type {Partial<UserAuthStatus>} */
            const status = data.data;
            if (callback) {
                callback(
                // Error
                null, 
                // Is logged in
                (_a = status.isLoggedIn) !== null && _a !== void 0 ? _a : false, 
                // Username
                (_b = status.username) !== null && _b !== void 0 ? _b : "(anon)", 
                // Is read only
                (_c = status.isReadOnly) !== null && _c !== void 0 ? _c : true, 
                // Is anonymous
                !status.isLoggedIn);
            }
        });
    }
    /*
    Get details of changed tiddlers from the server
    */
    getUpdatedTiddlers(syncer, callback) {
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
    connectServerStream(options) {
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
            const data = $tw.utils.parseJSONSafe(event.data);
            if (!data)
                return;
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
            if (self.outstandingRequests[data.title])
                return;
            if (data.is_deleted) {
                self.removeTiddlerInfo(data.title);
                delete options.syncer.tiddlerInfo[data.title];
                options.syncer.logger.log("Deleting tiddler missing from server:", data.title);
                options.syncer.wiki.deleteTiddler(data.title);
                options.syncer.processTaskQueue();
            }
            else {
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
    pollServer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            const [ok, err, result] = yield this.httpRequest({
                url: this.host + "recipes/" + this.recipe + "/tiddlers.json",
                data: {
                    last_known_revision_id: this.last_known_revision_id,
                    include_deleted: "true"
                },
                responseType: "json",
            });
            if (!ok) {
                return options.callback(err);
            }
            const { data: tiddlerInfoArray = [] } = result;
            var modifications = [], deletions = [];
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
                }
                else {
                    modifications.push(tiddlerInfo.title);
                }
            });
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
        });
    }
    /*
    Queue a load for a tiddler if there has been an update for it since the specified revision
    */
    checkLastRecordedUpdate(title, revision) {
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
        if ($tw.syncadaptor === this)
            return $tw.syncer;
    }
    /*
    Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
    */
    saveTiddler(tiddler, callback, options) {
        return __awaiter(this, void 0, void 0, function* () {
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
                body += `\n\n${tiddler.fields.text}`;
            }
            const [ok, err, result] = yield this.httpRequest({
                url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
                type: "PUT",
                headers: {
                    "Content-type": "application/x-mws-tiddler"
                },
                data: body,
                responseType: "json",
            });
            delete self.outstandingRequests[title];
            if (!ok)
                return callback(err);
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
        });
    }
    /*
    Load a tiddler and invoke the callback with (err,tiddlerFields)

    The syncer does not pass itself into options.
    */
    loadTiddler(title, callback, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            self.outstandingRequests[title] = { type: "GET" };
            const [ok, err, result] = yield this.httpRequest({
                url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
            });
            delete self.outstandingRequests[title];
            if (err === 404) {
                return callback(null, null);
            }
            else if (!ok) {
                return callback(err);
            }
            const { data, headers } = result;
            const revision = headers["x-revision-number"], bag_name = headers["x-bag-name"];
            // If there has been a more recent update from the server then enqueue a load of this tiddler
            self.checkLastRecordedUpdate(title, revision);
            // Invoke the callback
            self.setTiddlerInfo(title, revision, bag_name);
            callback(null, $tw.utils.parseJSONSafe(data));
        });
    }
    /*
    Delete a tiddler and invoke the callback with (err)
    options include:
    tiddlerInfo: the syncer's tiddlerInfo for this tiddler
    */
    deleteTiddler(title, callback, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var self = this;
            if (this.isReadOnly) {
                return callback(null);
            }
            // If we don't have a bag it means that the tiddler hasn't been seen by the server, so we don't need to delete it
            // var bag = this.getTiddlerBag(title);
            // if(!bag) { return callback(null, options.tiddlerInfo.adaptorInfo); }
            self.outstandingRequests[title] = { type: "DELETE" };
            // Issue HTTP request to delete the tiddler
            const [ok, err, result] = yield this.httpRequest({
                url: this.host + "recipes/" + encodeURIComponent(this.recipe) + "/tiddlers/" + encodeURIComponent(title),
                type: "DELETE",
            });
            delete self.outstandingRequests[title];
            if (!ok) {
                return callback(err);
            }
            const { data } = result;
            const revision = data.revision_id, bag_name = data.bag_name;
            // If there has been a more recent update from the server then enqueue a load of this tiddler
            self.checkLastRecordedUpdate(title, revision);
            self.removeTiddlerInfo(title);
            // Invoke the callback & return null adaptorInfo
            callback(null, null);
        });
    }
}
if ($tw.browser && document.location.protocol.startsWith("http")) {
    exports.adaptorClass = MultiWikiClientAdaptor;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGl3aWtpY2xpZW50YWRhcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tdWx0aXdpa2ljbGllbnRhZGFwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBRUgsa0VBQWtFO0FBQ2xFLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7QUFzQmIsSUFBSSxtQkFBbUIsR0FBRyxnQ0FBZ0MsRUFDekQsb0JBQW9CLEdBQUcscUJBQXFCLEVBQzVDLHdCQUF3QixHQUFHLDJCQUEyQixFQUN0RCxpQkFBaUIsR0FBRyx1Q0FBdUMsRUFDM0Qsc0JBQXNCLEdBQUcsNENBQTRDLEVBQ3JFLHdCQUF3QixHQUFHLHFDQUFxQyxFQUNoRSwrQkFBK0IsR0FBRyxtREFBbUQsRUFDckYsa0JBQWtCLEdBQUcsa0RBQWtELENBQUM7QUFFekUsSUFBSSxvQkFBb0IsR0FBRyxlQUFlLEVBQ3pDLHFCQUFxQixHQUFHLGdCQUFnQixFQUN4QyxvQkFBb0IsR0FBRyxlQUFlLEVBQ3RDLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztBQUVuQyxNQUFNLHNCQUFzQjtJQWlCM0IsWUFBWSxPQUFzQjtRQUZsQyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFDekIsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1FBRTFCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEtBQUssS0FBSyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrREFBa0QsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZJLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsK0VBQStFO1FBQy9ILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsOEZBQThGO1FBQzdJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDOUIsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDbEgsSUFBSSxDQUFDLHlCQUF5QixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELHlCQUF5QixDQUFDLE1BQWM7UUFDdkMsSUFBSSxDQUFDLDRCQUE0QixHQUFHLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNwQixLQUFLLEVBQUUsd0JBQXdCO1lBQy9CLElBQUksRUFBRSxNQUFNO1NBQ1osQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUNELG1CQUFtQixDQUFDLGVBQXVCO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxPQUFPO1FBQ04sT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBQ0QsT0FBTztRQUNOLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsYUFBYSxHQUFHO1lBQy9GLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDdkQsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtZQUMvQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1NBQ3ZELENBQUM7UUFDRixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQy9DLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUNELGNBQWMsQ0FBQyxPQUFnQjtRQUM5QixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvSyxJQUFJLFFBQVEsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNyQixPQUFPO2dCQUNOLEtBQUssRUFBRSxLQUFLO2dCQUNaLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixHQUFHLEVBQUUsR0FBRzthQUNSLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNQLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7SUFDRixDQUFDO0lBQ0QsYUFBYSxDQUFDLEtBQWE7UUFDMUIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFDRCxrQkFBa0IsQ0FBQyxLQUFhO1FBQy9CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBQ0QsY0FBYyxDQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLEdBQVc7UUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBQ0QsaUJBQWlCLENBQUMsS0FBYTtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDMUYsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxXQUFXLENBQTZDLE9BZXZEO1FBVUEsT0FBTyxDQUFDLElBQUksT0FBTyxDQUEyQixDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3pELEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxpQ0FDakIsT0FBTyxLQUNWLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUM3RSxRQUFRLEVBQUUsQ0FBQyxHQUFRLEVBQUUsSUFBUyxFQUFFLE9BQXVCLEVBQUUsRUFBRTs7b0JBQzFELElBQUksR0FBRzt3QkFBRSxPQUFPLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFFL0UseUNBQXlDO29CQUV6QyxNQUFNLE9BQU8sR0FBRyxFQUFTLENBQUM7b0JBQzFCLE1BQUEsT0FBTyxDQUFDLHFCQUFxQixFQUFFLDBDQUFFLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOzt3QkFDekUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDL0IsTUFBTSxNQUFNLEdBQUcsTUFBQSxLQUFLLENBQUMsS0FBSyxFQUFFLDBDQUFFLFdBQVcsRUFBRSxDQUFDO3dCQUM1QyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMvQixJQUFJLE1BQU07NEJBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztvQkFDckMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gseURBQXlEO29CQUN6RCxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFOzRCQUN6QixPQUFPOzRCQUNQLElBQUksRUFBRSxPQUFPLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO3lCQUM3RixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLElBQ0EsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0Q7O01BRUU7SUFDSSxTQUFTLENBQUMsUUFNUDs7O1lBV1IsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUNoRCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTO2dCQUNyRCxJQUFJLEVBQUUsS0FBSztnQkFDWCxZQUFZLEVBQUUsTUFBTTtnQkFDcEIsT0FBTyxFQUFFO29CQUNSLGNBQWMsRUFBRSxrQkFBa0I7b0JBQ2xDLGtCQUFrQixFQUFFLFlBQVk7aUJBQ2hDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFFBQVE7b0JBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixPQUFPO1lBQ1IsQ0FBQztZQUNELHNDQUFzQztZQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3pCLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2QsUUFBUTtnQkFDUCxRQUFRO2dCQUNSLElBQUk7Z0JBQ0osZUFBZTtnQkFDZixNQUFBLE1BQU0sQ0FBQyxVQUFVLG1DQUFJLEtBQUs7Z0JBQzFCLFdBQVc7Z0JBQ1gsTUFBQSxNQUFNLENBQUMsUUFBUSxtQ0FBSSxRQUFRO2dCQUMzQixlQUFlO2dCQUNmLE1BQUEsTUFBTSxDQUFDLFVBQVUsbUNBQUksSUFBSTtnQkFDekIsZUFBZTtnQkFDZixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQ2xCLENBQUM7WUFDSCxDQUFDO1FBQ0YsQ0FBQztLQUFBO0lBQ0Q7O01BRUU7SUFDRixrQkFBa0IsQ0FBQyxNQUFjLEVBQUUsUUFBd0Y7UUFDMUgsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ2YsUUFBUSxFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU87b0JBQy9CLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxPQUFPO1FBQ1IsQ0FBQztRQUVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQiwwREFBMEQ7UUFDMUQsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEtBQUssb0JBQW9CLEVBQUUsQ0FBQztZQUNoRSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JCLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixTQUFTLEVBQUUsRUFBRTthQUNiLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDRCxpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDO1lBQ3hCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsT0FBTyxFQUFFLFVBQVUsR0FBRztnQkFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3BELHlDQUF5QztnQkFDekMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUNmLFFBQVEsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPO3dCQUMvQixJQUFJLENBQUMseUJBQXlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQzt3QkFDckQsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDekIsQ0FBQztpQkFDRCxDQUFDLENBQUM7WUFDSixDQUFDO1lBQ0QsTUFBTSxFQUFFO2dCQUNQLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNyRCx3RUFBd0U7Z0JBQ3hFLFFBQVEsQ0FBQyxJQUFJLEVBQUU7b0JBQ2QsYUFBYSxFQUFFLEVBQUU7b0JBQ2pCLFNBQVMsRUFBRSxFQUFFO2lCQUNiLENBQUMsQ0FBQztZQUNKLENBQUM7U0FDRCxDQUFDLENBQUM7SUFFSixDQUFDO0lBQ0Q7Ozs7OztNQU1FO0lBQ0YsbUJBQW1CLENBQUMsT0FJbkI7UUFDQSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsaUNBQWlDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDakksV0FBVyxDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUs7WUFDcEMsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3JCLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNGLENBQUMsQ0FBQztRQUNGLFdBQVcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLO1lBQ25DLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7UUFDRixDQUFDLENBQUM7UUFDRixXQUFXLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFVBQVUsS0FBSztZQUVyRCxNQUFNLElBQUksR0FNTixHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTztZQUVsQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QiwrQkFBK0I7WUFDL0IsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNoRCxDQUFDO1lBQ0QseUNBQXlDO1lBQ3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUc7Z0JBQ3JDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQzdDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVzthQUM3QixDQUFDO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLGlGQUFpRjtZQUNqRixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFDakQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvRSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbkMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkcsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVFLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztZQUNGLENBQUM7UUFHRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDRDs7OztNQUlFO0lBQ0ksVUFBVSxDQUFDLE9BRWhCOztZQUNBLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ2hELEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFnQjtnQkFDNUQsSUFBSSxFQUFFO29CQUNMLHNCQUFzQixFQUFFLElBQUksQ0FBQyxzQkFBc0I7b0JBQ25ELGVBQWUsRUFBRSxNQUFNO2lCQUN2QjtnQkFDRCxZQUFZLEVBQUUsTUFBTTthQUNwQixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixHQUFHLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUUvQyxJQUFJLGFBQWEsR0FBYSxFQUFFLEVBQUUsU0FBUyxHQUFhLEVBQUUsQ0FBQztZQUUzRCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7WUFDOUI7O2VBRUc7WUFDSCxVQUFVLFdBQVc7Z0JBQ3BCLElBQUksV0FBVyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3ZELENBQUM7Z0JBQ0QsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzVCLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7WUFDRixDQUFDLENBQ0QsQ0FBQztZQUVGLHVDQUF1QztZQUN2QyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDdEIsYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLFNBQVMsRUFBRSxTQUFTO2FBQ3BCLENBQUMsQ0FBQztZQUVILFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2YsbUlBQW1JO2dCQUNuSSxJQUFJLEdBQUcsQ0FBQyxjQUFjLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO29CQUMxRCxHQUFHLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FBQTtJQUNEOztNQUVFO0lBQ0YsdUJBQXVCLENBQUMsS0FBYSxFQUFFLFFBQWdCO1FBQ3RELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ1QsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdELE9BQU87WUFDUixDQUFDO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsS0FBSyxVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzlHLElBQUksR0FBRyxDQUFDLFdBQVcsR0FBRyxXQUFXLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUNELElBQUksTUFBTTtRQUNULGtCQUFrQjtRQUNsQixJQUFJLEdBQUcsQ0FBQyxXQUFXLEtBQUssSUFBSTtZQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNqRCxDQUFDO0lBQ0Q7O01BRUU7SUFDSSxXQUFXLENBQ2hCLE9BQWdCLEVBQ2hCLFFBQThFLEVBQzlFLE9BQVk7O1lBRVosSUFBSSxJQUFJLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUM5QyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsd0JBQXdCLENBQUMsTUFBTSxDQUFDLEtBQUssd0JBQXdCLEVBQUUsQ0FBQztnQkFDdEcsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUNELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNsRCw4RkFBOEY7WUFDOUYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJO29CQUNqRSxPQUFPLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVILElBQUksSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDckMsQ0FBQztZQUVELE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDaEQsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2dCQUN4RyxJQUFJLEVBQUUsS0FBSztnQkFDWCxPQUFPLEVBQUU7b0JBQ1IsY0FBYyxFQUFFLDJCQUEyQjtpQkFDM0M7Z0JBQ0QsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsWUFBWSxFQUFFLE1BQU07YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFFakMsNkdBQTZHO1lBQzdHLElBQUksR0FBRyxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7Z0JBQzFELEdBQUcsQ0FBQyxjQUFjLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELHNEQUFzRDtZQUN0RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLGtCQUFrQixRQUFRLFlBQVksUUFBUSxFQUFFLENBQUMsQ0FBQztZQUM1RSw2RkFBNkY7WUFDN0YsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5QyxzQkFBc0I7WUFDdEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFN0MsQ0FBQztLQUFBO0lBQ0Q7Ozs7TUFJRTtJQUNJLFdBQVcsQ0FBQyxLQUFhLEVBQUUsUUFBMEMsRUFBRSxPQUFZOztZQUN4RixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDaEQsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2FBQ3hHLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQztpQkFBTSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLENBQUM7WUFDRCxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUNqQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hGLDZGQUE2RjtZQUM3RixJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0MsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7S0FBQTtJQUNEOzs7O01BSUU7SUFDSSxhQUFhLENBQUMsS0FBYSxFQUFFLFFBQStDLEVBQUUsT0FBWTs7WUFDL0YsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUFDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUMvQyxpSEFBaUg7WUFDakgsdUNBQXVDO1lBQ3ZDLHVFQUF1RTtZQUN2RSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUM7WUFDckQsMkNBQTJDO1lBQzNDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDaEQsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDO2dCQUN4RyxJQUFJLEVBQUUsUUFBUTthQUNkLENBQUMsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFBQyxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDbEMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQztZQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzVELDZGQUE2RjtZQUM3RixJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QixnREFBZ0Q7WUFDaEQsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDO0tBQUE7Q0FDRDtBQUdELElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNsRSxPQUFPLENBQUMsWUFBWSxHQUFHLHNCQUFzQixDQUFDO0FBQy9DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxcXG50aXRsZTogJDovcGx1Z2lucy90aWRkbHl3aWtpL3RpZGRseXdlYi90aWRkbHl3ZWJhZGFwdG9yLmpzXG50eXBlOiBhcHBsaWNhdGlvbi9qYXZhc2NyaXB0XG5tb2R1bGUtdHlwZTogc3luY2FkYXB0b3JcblxuQSBzeW5jIGFkYXB0b3IgbW9kdWxlIGZvciBzeW5jaHJvbmlzaW5nIHdpdGggTXVsdGlXaWtpU2VydmVyLWNvbXBhdGlibGUgc2VydmVycy4gXG5cbkl0IGhhcyB0aHJlZSBrZXkgYXJlYXMgb2YgY29uY2VybjpcblxuKiBCYXNpYyBvcGVyYXRpb25zIGxpa2UgcHV0LCBnZXQsIGFuZCBkZWxldGUgYSB0aWRkbGVyIG9uIHRoZSBzZXJ2ZXJcbiogUmVhbCB0aW1lIHVwZGF0ZXMgZnJvbSB0aGUgc2VydmVyIChoYW5kbGVkIGJ5IFNTRSlcbiogQmFncyBhbmQgcmVjaXBlcywgd2hpY2ggYXJlIHVua25vd24gdG8gdGhlIHN5bmNlclxuXG5BIGtleSBhc3BlY3Qgb2YgdGhlIGRlc2lnbiBpcyB0aGF0IHRoZSBzeW5jZXIgbmV2ZXIgb3ZlcmxhcHMgYmFzaWMgc2VydmVyIG9wZXJhdGlvbnM7IGl0IHdhaXRzIGZvciB0aGVcbnByZXZpb3VzIG9wZXJhdGlvbiB0byBjb21wbGV0ZSBiZWZvcmUgc2VuZGluZyBhIG5ldyBvbmUuXG5cblxcKi9cblxuLy8gdGhlIGJsYW5rIGxpbmUgaXMgaW1wb3J0YW50LCBhbmQgc28gaXMgdGhlIGZvbGxvd2luZyB1c2Ugc3RyaWN0XG5cInVzZSBzdHJpY3RcIjtcbmltcG9ydCB0eXBlIHsgTG9nZ2VyIH0gZnJvbSBcIiQ6L2NvcmUvbW9kdWxlcy91dGlscy9sb2dnZXIuanNcIjtcbmltcG9ydCB0eXBlIHsgU3luY2VyLCBUaWRkbGVyLCBJVGlkZGx5V2lraSB9IGZyb20gXCJ0aWRkbHl3aWtpXCI7XG5cbmRlY2xhcmUgbW9kdWxlICd0aWRkbHl3aWtpJyB7XG5cdGV4cG9ydCBpbnRlcmZhY2UgU3luY2VyIHtcblx0XHR3aWtpOiBXaWtpO1xuXHRcdGxvZ2dlcjogTG9nZ2VyO1xuXHRcdHRpZGRsZXJJbmZvOiBSZWNvcmQ8c3RyaW5nLCB7IGJhZzogc3RyaW5nOyByZXZpc2lvbjogc3RyaW5nIH0+O1xuXHRcdGVucXVldWVMb2FkVGlkZGxlcih0aXRsZTogc3RyaW5nKTogdm9pZDtcblx0XHRzdG9yZVRpZGRsZXIodGlkZGxlcjogVGlkZGxlcik6IHZvaWQ7XG5cdFx0cHJvY2Vzc1Rhc2tRdWV1ZSgpOiB2b2lkO1xuXHR9XG5cdGludGVyZmFjZSBJVGlkZGx5V2lraSB7XG5cdFx0YnJvd3NlclN0b3JhZ2U6IGFueTtcblx0fVxufVxuXG5kZWNsYXJlIGNvbnN0IGV4cG9ydHM6IHtcblx0YWRhcHRvckNsYXNzOiB0eXBlb2YgTXVsdGlXaWtpQ2xpZW50QWRhcHRvcjtcbn07XG5cbnZhciBDT05GSUdfSE9TVF9USURETEVSID0gXCIkOi9jb25maWcvbXVsdGl3aWtpY2xpZW50L2hvc3RcIixcblx0REVGQVVMVF9IT1NUX1RJRERMRVIgPSBcIiRwcm90b2NvbCQvLyRob3N0JC9cIixcblx0TVdDX1NUQVRFX1RJRERMRVJfUFJFRklYID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvXCIsXG5cdEJBR19TVEFURV9USURETEVSID0gXCIkOi9zdGF0ZS9tdWx0aXdpa2ljbGllbnQvdGlkZGxlcnMvYmFnXCIsXG5cdFJFVklTSU9OX1NUQVRFX1RJRERMRVIgPSBcIiQ6L3N0YXRlL211bHRpd2lraWNsaWVudC90aWRkbGVycy9yZXZpc2lvblwiLFxuXHRDT05ORUNUSU9OX1NUQVRFX1RJRERMRVIgPSBcIiQ6L3N0YXRlL211bHRpd2lraWNsaWVudC9jb25uZWN0aW9uXCIsXG5cdElOQ09NSU5HX1VQREFURVNfRklMVEVSX1RJRERMRVIgPSBcIiQ6L2NvbmZpZy9tdWx0aXdpa2ljbGllbnQvaW5jb21pbmctdXBkYXRlcy1maWx0ZXJcIixcblx0RU5BQkxFX1NTRV9USURETEVSID0gXCIkOi9jb25maWcvbXVsdGl3aWtpY2xpZW50L3VzZS1zZXJ2ZXItc2VudC1ldmVudHNcIjtcblxudmFyIFNFUlZFUl9OT1RfQ09OTkVDVEVEID0gXCJOT1QgQ09OTkVDVEVEXCIsXG5cdFNFUlZFUl9DT05ORUNUSU5HX1NTRSA9IFwiQ09OTkVDVElORyBTU0VcIixcblx0U0VSVkVSX0NPTk5FQ1RFRF9TU0UgPSBcIkNPTk5FQ1RFRCBTU0VcIixcblx0U0VSVkVSX1BPTExJTkcgPSBcIlNFUlZFUiBQT0xMSU5HXCI7XG5cbmNsYXNzIE11bHRpV2lraUNsaWVudEFkYXB0b3Ige1xuXHR3aWtpO1xuXHRob3N0O1xuXHRyZWNpcGU7XG5cdHVzZVNlcnZlclNlbnRFdmVudHM7XG5cdGxhc3Rfa25vd25fcmV2aXNpb25faWQ7XG5cdG91dHN0YW5kaW5nUmVxdWVzdHM7XG5cdGxhc3RSZWNvcmRlZFVwZGF0ZTtcblx0bG9nZ2VyO1xuXHRpc0xvZ2dlZEluO1xuXHRpc1JlYWRPbmx5O1xuXHRsb2dvdXRJc0F2YWlsYWJsZTtcblx0aW5jb21pbmdVcGRhdGVzRmlsdGVyRm47XG5cdHNlcnZlclVwZGF0ZUNvbm5lY3Rpb25TdGF0dXMhOiBzdHJpbmc7XG5cblx0bmFtZSA9IFwibXVsdGl3aWtpY2xpZW50XCI7XG5cdHN1cHBvcnRzTGF6eUxvYWRpbmcgPSB0cnVlO1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiB7IHdpa2k6IGFueSB9KSB7XG5cdFx0dGhpcy53aWtpID0gb3B0aW9ucy53aWtpO1xuXHRcdHRoaXMuaG9zdCA9IHRoaXMuZ2V0SG9zdCgpO1xuXHRcdHRoaXMucmVjaXBlID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KFwiJDovY29uZmlnL211bHRpd2lraWNsaWVudC9yZWNpcGVcIik7XG5cdFx0dGhpcy51c2VTZXJ2ZXJTZW50RXZlbnRzID0gdGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KEVOQUJMRV9TU0VfVElERExFUikgPT09IFwieWVzXCI7XG5cdFx0dGhpcy5sYXN0X2tub3duX3JldmlzaW9uX2lkID0gJHR3LnV0aWxzLnBhcnNlTnVtYmVyKHRoaXMud2lraS5nZXRUaWRkbGVyVGV4dChcIiQ6L3N0YXRlL211bHRpd2lraWNsaWVudC9yZWNpcGUvbGFzdF9yZXZpc2lvbl9pZFwiLCBcIjBcIikpO1xuXHRcdHRoaXMub3V0c3RhbmRpbmdSZXF1ZXN0cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IC8vIEhhc2htYXAgYnkgdGl0bGUgb2Ygb3V0c3RhbmRpbmcgcmVxdWVzdCBvYmplY3Q6IHt0eXBlOiBcIlBVVFwifFwiR0VUXCJ8XCJERUxFVEVcIn1cblx0XHR0aGlzLmxhc3RSZWNvcmRlZFVwZGF0ZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7IC8vIEhhc2htYXAgYnkgdGl0bGUgb2YgbGFzdCByZWNvcmRlZCB1cGRhdGUgdmlhIFNTRToge3R5cGU6IFwidXBkYXRlXCJ8XCJkZXRldGlvblwiLCByZXZpc2lvbl9pZDp9XG5cdFx0dGhpcy5sb2dnZXIgPSBuZXcgJHR3LnV0aWxzLkxvZ2dlcihcIk11bHRpV2lraUNsaWVudEFkYXB0b3JcIik7XG5cdFx0dGhpcy5pc0xvZ2dlZEluID0gZmFsc2U7XG5cdFx0dGhpcy5pc1JlYWRPbmx5ID0gZmFsc2U7XG5cdFx0dGhpcy5sb2dvdXRJc0F2YWlsYWJsZSA9IHRydWU7XG5cdFx0Ly8gQ29tcGlsZSB0aGUgZGlydHkgdGlkZGxlciBmaWx0ZXJcblx0XHR0aGlzLmluY29taW5nVXBkYXRlc0ZpbHRlckZuID0gdGhpcy53aWtpLmNvbXBpbGVGaWx0ZXIodGhpcy53aWtpLmdldFRpZGRsZXJUZXh0KElOQ09NSU5HX1VQREFURVNfRklMVEVSX1RJRERMRVIpKTtcblx0XHR0aGlzLnNldFVwZGF0ZUNvbm5lY3Rpb25TdGF0dXMoU0VSVkVSX05PVF9DT05ORUNURUQpO1xuXHR9XG5cblx0c2V0VXBkYXRlQ29ubmVjdGlvblN0YXR1cyhzdGF0dXM6IHN0cmluZykge1xuXHRcdHRoaXMuc2VydmVyVXBkYXRlQ29ubmVjdGlvblN0YXR1cyA9IHN0YXR1cztcblx0XHR0aGlzLndpa2kuYWRkVGlkZGxlcih7XG5cdFx0XHR0aXRsZTogQ09OTkVDVElPTl9TVEFURV9USURETEVSLFxuXHRcdFx0dGV4dDogc3RhdHVzXG5cdFx0fSk7XG5cdH1cblx0c2V0TG9nZ2VyU2F2ZUJ1ZmZlcihsb2dnZXJGb3JTYXZpbmc6IExvZ2dlcikge1xuXHRcdHRoaXMubG9nZ2VyLnNldFNhdmVCdWZmZXIobG9nZ2VyRm9yU2F2aW5nKTtcblx0fVxuXHRpc1JlYWR5KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGdldEhvc3QoKSB7XG5cdFx0dmFyIHRleHQgPSB0aGlzLndpa2kuZ2V0VGlkZGxlclRleHQoQ09ORklHX0hPU1RfVElERExFUiwgREVGQVVMVF9IT1NUX1RJRERMRVIpLCBzdWJzdGl0dXRpb25zID0gW1xuXHRcdFx0eyBuYW1lOiBcInByb3RvY29sXCIsIHZhbHVlOiBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCB9LFxuXHRcdFx0eyBuYW1lOiBcImhvc3RcIiwgdmFsdWU6IGRvY3VtZW50LmxvY2F0aW9uLmhvc3QgfSxcblx0XHRcdHsgbmFtZTogXCJwYXRobmFtZVwiLCB2YWx1ZTogZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgfVxuXHRcdF07XG5cdFx0Zm9yICh2YXIgdCA9IDA7IHQgPCBzdWJzdGl0dXRpb25zLmxlbmd0aDsgdCsrKSB7XG5cdFx0XHR2YXIgcyA9IHN1YnN0aXR1dGlvbnNbdF07XG5cdFx0XHR0ZXh0ID0gJHR3LnV0aWxzLnJlcGxhY2VTdHJpbmcodGV4dCwgbmV3IFJlZ0V4cChcIlxcXFwkXCIgKyBzLm5hbWUgKyBcIlxcXFwkXCIsIFwibWdcIiksIHMudmFsdWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXHRnZXRUaWRkbGVySW5mbyh0aWRkbGVyOiBUaWRkbGVyKSB7XG5cdFx0dmFyIHRpdGxlID0gdGlkZGxlci5maWVsZHMudGl0bGUsIHJldmlzaW9uID0gdGhpcy53aWtpLmV4dHJhY3RUaWRkbGVyRGF0YUl0ZW0oUkVWSVNJT05fU1RBVEVfVElERExFUiwgdGl0bGUpLCBiYWcgPSB0aGlzLndpa2kuZXh0cmFjdFRpZGRsZXJEYXRhSXRlbShCQUdfU1RBVEVfVElERExFUiwgdGl0bGUpO1xuXHRcdGlmIChyZXZpc2lvbiAmJiBiYWcpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRpdGxlOiB0aXRsZSxcblx0XHRcdFx0cmV2aXNpb246IHJldmlzaW9uLFxuXHRcdFx0XHRiYWc6IGJhZ1xuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0Z2V0VGlkZGxlckJhZyh0aXRsZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMud2lraS5leHRyYWN0VGlkZGxlckRhdGFJdGVtKEJBR19TVEFURV9USURETEVSLCB0aXRsZSk7XG5cdH1cblx0Z2V0VGlkZGxlclJldmlzaW9uKHRpdGxlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy53aWtpLmV4dHJhY3RUaWRkbGVyRGF0YUl0ZW0oUkVWSVNJT05fU1RBVEVfVElERExFUiwgdGl0bGUpO1xuXHR9XG5cdHNldFRpZGRsZXJJbmZvKHRpdGxlOiBzdHJpbmcsIHJldmlzaW9uOiBzdHJpbmcsIGJhZzogc3RyaW5nKSB7XG5cdFx0dGhpcy53aWtpLnNldFRleHQoQkFHX1NUQVRFX1RJRERMRVIsIG51bGwsIHRpdGxlLCBiYWcsIHsgc3VwcHJlc3NUaW1lc3RhbXA6IHRydWUgfSk7XG5cdFx0dGhpcy53aWtpLnNldFRleHQoUkVWSVNJT05fU1RBVEVfVElERExFUiwgbnVsbCwgdGl0bGUsIHJldmlzaW9uLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHR9XG5cdHJlbW92ZVRpZGRsZXJJbmZvKHRpdGxlOiBzdHJpbmcpIHtcblx0XHR0aGlzLndpa2kuc2V0VGV4dChCQUdfU1RBVEVfVElERExFUiwgbnVsbCwgdGl0bGUsIHVuZGVmaW5lZCwgeyBzdXBwcmVzc1RpbWVzdGFtcDogdHJ1ZSB9KTtcblx0XHR0aGlzLndpa2kuc2V0VGV4dChSRVZJU0lPTl9TVEFURV9USURETEVSLCBudWxsLCB0aXRsZSwgdW5kZWZpbmVkLCB7IHN1cHByZXNzVGltZXN0YW1wOiB0cnVlIH0pO1xuXHR9XG5cblx0aHR0cFJlcXVlc3Q8UlQgZXh0ZW5kcyBcInRleHRcIiB8IFwiYXJyYXlidWZmZXJcIiB8IFwianNvblwiPihvcHRpb25zOiB7XG5cdFx0LyoqIHVybCB0byByZXRyaWV2ZSAobXVzdCBub3QgY29udGFpbiBgP2AgaWYgR0VUIG9yIEhFQUQpICovXG5cdFx0dXJsOiBzdHJpbmc7XG5cdFx0LyoqIGhhc2htYXAgb2YgaGVhZGVycyB0byBzZW5kICovXG5cdFx0aGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cdFx0LyoqIHJlcXVlc3QgbWV0aG9kOiBHRVQsIFBVVCwgUE9TVCBldGMgKi9cblx0XHR0eXBlPzogc3RyaW5nO1xuXHRcdC8qKiBvcHRpb25hbCBmdW5jdGlvbiBpbnZva2VkIHdpdGggKGxlbmd0aENvbXB1dGFibGUsbG9hZGVkLHRvdGFsKSAqL1xuXHRcdHByb2dyZXNzPzogKGxlbmd0aENvbXB1dGFibGU6IGJvb2xlYW4sIGxvYWRlZDogbnVtYmVyLCB0b3RhbDogbnVtYmVyKSA9PiB2b2lkO1xuXHRcdC8qKiBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byByZXR1cm4gYXMgZmlyc3QgYXJndW1lbnQgb2YgY2FsbGJhY2sgKi9cblx0XHRyZXR1cm5Qcm9wPzogc3RyaW5nO1xuXHRcdHJlc3BvbnNlVHlwZT86IFJUO1xuXHRcdHVzZURlZmF1bHRIZWFkZXJzPzogYm9vbGVhbjtcblx0XHQvKiogdXJsZW5jb2RlZCBzdHJpbmcgb3IgaGFzaG1hcCBvZiBkYXRhIHRvIHNlbmQuIElmIHR5cGUgaXMgR0VUIG9yIEhFQUQsIHRoaXMgaXMgYXBwZW5kZWQgdG8gdGhlIFVSTCBhcyBhIHF1ZXJ5IHN0cmluZyAqL1xuXHRcdGRhdGE/OiBvYmplY3QgfCBzdHJpbmc7XG5cdH0pIHtcblx0XHR0eXBlIFJlc3BvbnNlRXJyID0gW2ZhbHNlLCBhbnksIHVuZGVmaW5lZF07XG5cdFx0dHlwZSBSZXNwb25zZU9rID0gW3RydWUsIHVuZGVmaW5lZCwge1xuXHRcdFx0ZGF0YTpcblx0XHRcdFwianNvblwiIGV4dGVuZHMgUlQgPyBhbnkgOlxuXHRcdFx0XCJ0ZXh0XCIgZXh0ZW5kcyBSVCA/IHN0cmluZyA6XG5cdFx0XHRcImFycmF5YnVmZmVyXCIgZXh0ZW5kcyBSVCA/IEFycmF5QnVmZmVyIDpcblx0XHRcdHVua25vd247XG5cdFx0XHRoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG5cdFx0fV07XG5cdFx0cmV0dXJuIChuZXcgUHJvbWlzZTxSZXNwb25zZUVyciB8IFJlc3BvbnNlT2s+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHQkdHcudXRpbHMuaHR0cFJlcXVlc3Qoe1xuXHRcdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0XHRyZXNwb25zZVR5cGU6IG9wdGlvbnMucmVzcG9uc2VUeXBlID09PSBcImpzb25cIiA/IFwidGV4dFwiIDogb3B0aW9ucy5yZXNwb25zZVR5cGUsXG5cdFx0XHRcdGNhbGxiYWNrOiAoZXJyOiBhbnksIGRhdGE6IGFueSwgcmVxdWVzdDogWE1MSHR0cFJlcXVlc3QpID0+IHtcblx0XHRcdFx0XHRpZiAoZXJyKSByZXR1cm4gcmVzb2x2ZShbZmFsc2UsIGVyciB8fCBuZXcgRXJyb3IoXCJVbmtub3duIGVycm9yXCIpLCB1bmRlZmluZWRdKTtcblxuXHRcdFx0XHRcdC8vIENyZWF0ZSBhIG1hcCBvZiBoZWFkZXIgbmFtZXMgdG8gdmFsdWVzXG5cblx0XHRcdFx0XHRjb25zdCBoZWFkZXJzID0ge30gYXMgYW55O1xuXHRcdFx0XHRcdHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCk/LnRyaW0oKS5zcGxpdCgvW1xcclxcbl0rLykuZm9yRWFjaCgobGluZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KFwiOiBcIik7XG5cdFx0XHRcdFx0XHRjb25zdCBoZWFkZXIgPSBwYXJ0cy5zaGlmdCgpPy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJ0cy5qb2luKFwiOiBcIik7XG5cdFx0XHRcdFx0XHRpZiAoaGVhZGVyKSBoZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIHJlc3BvbnNlIGRhdGEgYW5kIGhlYWRlcnNcblx0XHRcdFx0XHRyZXNvbHZlKFt0cnVlLCB1bmRlZmluZWQsIHtcblx0XHRcdFx0XHRcdGhlYWRlcnMsXG5cdFx0XHRcdFx0XHRkYXRhOiBvcHRpb25zLnJlc3BvbnNlVHlwZSA9PT0gXCJqc29uXCIgPyAkdHcudXRpbHMucGFyc2VKU09OU2FmZShkYXRhLCAoKSA9PiB1bmRlZmluZWQpIDogZGF0YSxcblx0XHRcdFx0XHR9XSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9KSk7XG5cdH1cblx0Lypcblx0R2V0IHRoZSBjdXJyZW50IHN0YXR1cyBvZiB0aGUgc2VydmVyIGNvbm5lY3Rpb25cblx0Ki9cblx0YXN5bmMgZ2V0U3RhdHVzKGNhbGxiYWNrOiAoXG5cdFx0ZXJyOiBhbnksXG5cdFx0aXNMb2dnZWRJbj86IGJvb2xlYW4sXG5cdFx0dXNlcm5hbWU/OiBzdHJpbmcsXG5cdFx0aXNSZWFkT25seT86IGJvb2xlYW4sXG5cdFx0aXNBbm9ueW1vdXM/OiBib29sZWFuLFxuXHQpID0+IHZvaWQpIHtcblx0XHRpbnRlcmZhY2UgVXNlckF1dGhTdGF0dXMge1xuXHRcdFx0aXNBZG1pbjogYm9vbGVhbjtcblx0XHRcdHVzZXJfaWQ6IG51bWJlcjtcblx0XHRcdHVzZXJuYW1lOiBzdHJpbmc7XG5cdFx0XHRpc0xvZ2dlZEluOiBib29sZWFuO1xuXHRcdFx0aXNSZWFkT25seTogYm9vbGVhbjtcblx0XHRcdGFsbG93QW5vblJlYWRzOiBib29sZWFuO1xuXHRcdFx0YWxsb3dBbm9uV3JpdGVzOiBib29sZWFuO1xuXHRcdH1cblxuXHRcdGNvbnN0IFtvaywgZXJyb3IsIGRhdGFdID0gYXdhaXQgdGhpcy5odHRwUmVxdWVzdCh7XG5cdFx0XHR1cmw6IHRoaXMuaG9zdCArIFwicmVjaXBlcy9cIiArIHRoaXMucmVjaXBlICsgXCIvc3RhdHVzXCIsXG5cdFx0XHR0eXBlOiBcIkdFVFwiLFxuXHRcdFx0cmVzcG9uc2VUeXBlOiBcImpzb25cIixcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcblx0XHRcdFx0XCJYLVJlcXVlc3RlZC1XaXRoXCI6IFwiVGlkZGx5V2lraVwiXG5cdFx0XHR9LFxuXHRcdH0pO1xuXHRcdGlmICghb2spIHtcblx0XHRcdHRoaXMubG9nZ2VyLmxvZyhcIkVycm9yIGdldHRpbmcgc3RhdHVzXCIsIGVycm9yKTtcblx0XHRcdGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyb3IpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvKiogQHR5cGUge1BhcnRpYWw8VXNlckF1dGhTdGF0dXM+fSAqL1xuXHRcdGNvbnN0IHN0YXR1cyA9IGRhdGEuZGF0YTtcblx0XHRpZiAoY2FsbGJhY2spIHtcblx0XHRcdGNhbGxiYWNrKFxuXHRcdFx0XHQvLyBFcnJvclxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQvLyBJcyBsb2dnZWQgaW5cblx0XHRcdFx0c3RhdHVzLmlzTG9nZ2VkSW4gPz8gZmFsc2UsXG5cdFx0XHRcdC8vIFVzZXJuYW1lXG5cdFx0XHRcdHN0YXR1cy51c2VybmFtZSA/PyBcIihhbm9uKVwiLFxuXHRcdFx0XHQvLyBJcyByZWFkIG9ubHlcblx0XHRcdFx0c3RhdHVzLmlzUmVhZE9ubHkgPz8gdHJ1ZSxcblx0XHRcdFx0Ly8gSXMgYW5vbnltb3VzXG5cdFx0XHRcdCFzdGF0dXMuaXNMb2dnZWRJbixcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdC8qXG5cdEdldCBkZXRhaWxzIG9mIGNoYW5nZWQgdGlkZGxlcnMgZnJvbSB0aGUgc2VydmVyXG5cdCovXG5cdGdldFVwZGF0ZWRUaWRkbGVycyhzeW5jZXI6IFN5bmNlciwgY2FsbGJhY2s6IChlcnI6IGFueSwgY2hhbmdlcz86IHsgbW9kaWZpY2F0aW9uczogc3RyaW5nW107IGRlbGV0aW9uczogc3RyaW5nW10gfSkgPT4gdm9pZCkge1xuXHRcdGlmICghdGhpcy51c2VTZXJ2ZXJTZW50RXZlbnRzKSB7XG5cdFx0XHR0aGlzLnBvbGxTZXJ2ZXIoe1xuXHRcdFx0XHRjYWxsYmFjazogZnVuY3Rpb24gKGVyciwgY2hhbmdlcykge1xuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsIGNoYW5nZXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0Ly8gRG8gbm90aGluZyBpZiB0aGVyZSdzIGFscmVhZHkgYSBjb25uZWN0aW9uIGluIHByb2dyZXNzLlxuXHRcdGlmICh0aGlzLnNlcnZlclVwZGF0ZUNvbm5lY3Rpb25TdGF0dXMgIT09IFNFUlZFUl9OT1RfQ09OTkVDVEVEKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwge1xuXHRcdFx0XHRtb2RpZmljYXRpb25zOiBbXSxcblx0XHRcdFx0ZGVsZXRpb25zOiBbXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vIFRyeSB0byBjb25uZWN0IGEgc2VydmVyIHN0cmVhbVxuXHRcdHRoaXMuc2V0VXBkYXRlQ29ubmVjdGlvblN0YXR1cyhTRVJWRVJfQ09OTkVDVElOR19TU0UpO1xuXHRcdHRoaXMuY29ubmVjdFNlcnZlclN0cmVhbSh7XG5cdFx0XHRzeW5jZXI6IHN5bmNlcixcblx0XHRcdG9uZXJyb3I6IGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0c2VsZi5sb2dnZXIubG9nKFwiRXJyb3IgY29ubmVjdGluZyBTU0Ugc3RyZWFtXCIsIGVycik7XG5cdFx0XHRcdC8vIElmIHRoZSBzdHJlYW0gZGlkbid0IHdvcmssIHRyeSBwb2xsaW5nXG5cdFx0XHRcdHNlbGYuc2V0VXBkYXRlQ29ubmVjdGlvblN0YXR1cyhTRVJWRVJfUE9MTElORyk7XG5cdFx0XHRcdHNlbGYucG9sbFNlcnZlcih7XG5cdFx0XHRcdFx0Y2FsbGJhY2s6IGZ1bmN0aW9uIChlcnIsIGNoYW5nZXMpIHtcblx0XHRcdFx0XHRcdHNlbGYuc2V0VXBkYXRlQ29ubmVjdGlvblN0YXR1cyhTRVJWRVJfTk9UX0NPTk5FQ1RFRCk7XG5cdFx0XHRcdFx0XHRjYWxsYmFjayhudWxsLCBjaGFuZ2VzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdG9ub3BlbjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLnNldFVwZGF0ZUNvbm5lY3Rpb25TdGF0dXMoU0VSVkVSX0NPTk5FQ1RFRF9TU0UpO1xuXHRcdFx0XHQvLyBUaGUgc3luY2VyIGlzIGV4cGVjdGluZyBhIGNhbGxiYWNrIGJ1dCB3ZSBkb24ndCBoYXZlIGFueSBkYXRhIHRvIHNlbmRcblx0XHRcdFx0Y2FsbGJhY2sobnVsbCwge1xuXHRcdFx0XHRcdG1vZGlmaWNhdGlvbnM6IFtdLFxuXHRcdFx0XHRcdGRlbGV0aW9uczogW11cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fVxuXHQvKlxuXHRBdHRlbXB0IHRvIGVzdGFibGlzaCBhbiBTU0Ugc3RyZWFtIHdpdGggdGhlIHNlcnZlciBhbmQgdHJhbnNmZXIgdGlkZGxlciBjaGFuZ2VzLiBPcHRpb25zIGluY2x1ZGU6XG4gIFxuXHRzeW5jZXI6IHJlZmVyZW5jZSB0byBzeW5jZXIgb2JqZWN0IHVzZWQgZm9yIHN0b3JpbmcgZGF0YVxuXHRvbm9wZW46IGludm9rZWQgd2hlbiB0aGUgc3RyZWFtIGlzIHN1Y2Nlc3NmdWxseSBvcGVuZWRcblx0b25lcnJvcjogaW52b2tlZCBpZiB0aGVyZSBpcyBhbiBlcnJvclxuXHQqL1xuXHRjb25uZWN0U2VydmVyU3RyZWFtKG9wdGlvbnM6IHtcblx0XHRzeW5jZXI6IFN5bmNlcjtcblx0XHRvbm9wZW46IChldmVudDogRXZlbnQpID0+IHZvaWQ7XG5cdFx0b25lcnJvcjogKGV2ZW50OiBFdmVudCkgPT4gdm9pZDtcblx0fSkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRjb25zdCBldmVudFNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZShcIi9yZWNpcGVzL1wiICsgdGhpcy5yZWNpcGUgKyBcIi9ldmVudHM/bGFzdF9rbm93bl9yZXZpc2lvbl9pZD1cIiArIHRoaXMubGFzdF9rbm93bl9yZXZpc2lvbl9pZCk7XG5cdFx0ZXZlbnRTb3VyY2Uub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0aWYgKG9wdGlvbnMub25lcnJvcikge1xuXHRcdFx0XHRvcHRpb25zLm9uZXJyb3IoZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0ZXZlbnRTb3VyY2Uub25vcGVuID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRpZiAob3B0aW9ucy5vbm9wZW4pIHtcblx0XHRcdFx0b3B0aW9ucy5vbm9wZW4oZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0ZXZlbnRTb3VyY2UuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuXHRcdFx0Y29uc3QgZGF0YToge1xuXHRcdFx0XHR0aXRsZTogc3RyaW5nO1xuXHRcdFx0XHRyZXZpc2lvbl9pZDogbnVtYmVyO1xuXHRcdFx0XHRpc19kZWxldGVkOiBib29sZWFuO1xuXHRcdFx0XHRiYWdfbmFtZTogc3RyaW5nO1xuXHRcdFx0XHR0aWRkbGVyOiBhbnk7XG5cdFx0XHR9ID0gJHR3LnV0aWxzLnBhcnNlSlNPTlNhZmUoZXZlbnQuZGF0YSk7XG5cdFx0XHRpZiAoIWRhdGEpIHJldHVybjtcblxuXHRcdFx0Y29uc29sZS5sb2coXCJTU0UgZGF0YVwiLCBkYXRhKTtcblx0XHRcdC8vIFVwZGF0ZSBsYXN0IHNlZW4gcmV2aXNpb25faWRcblx0XHRcdGlmIChkYXRhLnJldmlzaW9uX2lkID4gc2VsZi5sYXN0X2tub3duX3JldmlzaW9uX2lkKSB7XG5cdFx0XHRcdHNlbGYubGFzdF9rbm93bl9yZXZpc2lvbl9pZCA9IGRhdGEucmV2aXNpb25faWQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBSZWNvcmQgdGhlIGxhc3QgdXBkYXRlIHRvIHRoaXMgdGlkZGxlclxuXHRcdFx0c2VsZi5sYXN0UmVjb3JkZWRVcGRhdGVbZGF0YS50aXRsZV0gPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaXNfZGVsZXRlZCA/IFwiZGVsZXRpb25cIiA6IFwidXBkYXRlXCIsXG5cdFx0XHRcdHJldmlzaW9uX2lkOiBkYXRhLnJldmlzaW9uX2lkXG5cdFx0XHR9O1xuXHRcdFx0Y29uc29sZS5sb2coYE91c3RhbmRpbmcgcmVxdWVzdHMgaXMgJHtKU09OLnN0cmluZ2lmeShzZWxmLm91dHN0YW5kaW5nUmVxdWVzdHNbZGF0YS50aXRsZV0pfWApO1xuXHRcdFx0Ly8gUHJvY2VzcyB0aGUgdXBkYXRlIGlmIHRoZSB0aWRkbGVyIGlzIG5vdCB0aGUgc3ViamVjdCBvZiBhbiBvdXRzdGFuZGluZyByZXF1ZXN0XG5cdFx0XHRpZiAoc2VsZi5vdXRzdGFuZGluZ1JlcXVlc3RzW2RhdGEudGl0bGVdKSByZXR1cm47XG5cdFx0XHRpZiAoZGF0YS5pc19kZWxldGVkKSB7XG5cdFx0XHRcdHNlbGYucmVtb3ZlVGlkZGxlckluZm8oZGF0YS50aXRsZSk7XG5cdFx0XHRcdGRlbGV0ZSBvcHRpb25zLnN5bmNlci50aWRkbGVySW5mb1tkYXRhLnRpdGxlXTtcblx0XHRcdFx0b3B0aW9ucy5zeW5jZXIubG9nZ2VyLmxvZyhcIkRlbGV0aW5nIHRpZGRsZXIgbWlzc2luZyBmcm9tIHNlcnZlcjpcIiwgZGF0YS50aXRsZSk7XG5cdFx0XHRcdG9wdGlvbnMuc3luY2VyLndpa2kuZGVsZXRlVGlkZGxlcihkYXRhLnRpdGxlKTtcblx0XHRcdFx0b3B0aW9ucy5zeW5jZXIucHJvY2Vzc1Rhc2tRdWV1ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHNlbGYuaW5jb21pbmdVcGRhdGVzRmlsdGVyRm4uY2FsbChzZWxmLndpa2ksIHNlbGYud2lraS5tYWtlVGlkZGxlckl0ZXJhdG9yKFtkYXRhLnRpdGxlXSkpO1xuXHRcdFx0XHRpZiAocmVzdWx0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRzZWxmLnNldFRpZGRsZXJJbmZvKGRhdGEudGl0bGUsIGRhdGEucmV2aXNpb25faWQudG9TdHJpbmcoKSwgZGF0YS5iYWdfbmFtZSk7XG5cdFx0XHRcdFx0b3B0aW9ucy5zeW5jZXIuc3RvcmVUaWRkbGVyKGRhdGEudGlkZGxlcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0fSk7XG5cdH1cblx0Lypcblx0UG9sbCB0aGUgc2VydmVyIGZvciBjaGFuZ2VzLiBPcHRpb25zIGluY2x1ZGU6XG4gIFxuXHRjYWxsYmFjazogaW52b2tlZCBvbiBjb21wbGV0aW9uIGFzIChlcnIsY2hhbmdlcylcblx0Ki9cblx0YXN5bmMgcG9sbFNlcnZlcihvcHRpb25zOiB7XG5cdFx0Y2FsbGJhY2s6IChlcnI6IGFueSwgY2hhbmdlcz86IHsgbW9kaWZpY2F0aW9uczogc3RyaW5nW107IGRlbGV0aW9uczogc3RyaW5nW10gfSkgPT4gdm9pZDtcblx0fSkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRjb25zdCBbb2ssIGVyciwgcmVzdWx0XSA9IGF3YWl0IHRoaXMuaHR0cFJlcXVlc3Qoe1xuXHRcdFx0dXJsOiB0aGlzLmhvc3QgKyBcInJlY2lwZXMvXCIgKyB0aGlzLnJlY2lwZSArIFwiL3RpZGRsZXJzLmpzb25cIixcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0bGFzdF9rbm93bl9yZXZpc2lvbl9pZDogdGhpcy5sYXN0X2tub3duX3JldmlzaW9uX2lkLFxuXHRcdFx0XHRpbmNsdWRlX2RlbGV0ZWQ6IFwidHJ1ZVwiXG5cdFx0XHR9LFxuXHRcdFx0cmVzcG9uc2VUeXBlOiBcImpzb25cIixcblx0XHR9KTtcblxuXHRcdGlmICghb2spIHsgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soZXJyKTsgfVxuXHRcdGNvbnN0IHsgZGF0YTogdGlkZGxlckluZm9BcnJheSA9IFtdIH0gPSByZXN1bHQ7XG5cblx0XHR2YXIgbW9kaWZpY2F0aW9uczogc3RyaW5nW10gPSBbXSwgZGVsZXRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0JHR3LnV0aWxzLmVhY2godGlkZGxlckluZm9BcnJheSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQHBhcmFtIHt7IHRpdGxlOiBzdHJpbmc7IHJldmlzaW9uX2lkOiBudW1iZXI7IGlzX2RlbGV0ZWQ6IGJvb2xlYW47IGJhZ19uYW1lOiBzdHJpbmc7IH19IHRpZGRsZXJJbmZvIFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiAodGlkZGxlckluZm8pIHtcblx0XHRcdFx0aWYgKHRpZGRsZXJJbmZvLnJldmlzaW9uX2lkID4gc2VsZi5sYXN0X2tub3duX3JldmlzaW9uX2lkKSB7XG5cdFx0XHRcdFx0c2VsZi5sYXN0X2tub3duX3JldmlzaW9uX2lkID0gdGlkZGxlckluZm8ucmV2aXNpb25faWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRpZGRsZXJJbmZvLmlzX2RlbGV0ZWQpIHtcblx0XHRcdFx0XHRkZWxldGlvbnMucHVzaCh0aWRkbGVySW5mby50aXRsZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bW9kaWZpY2F0aW9ucy5wdXNoKHRpZGRsZXJJbmZvLnRpdGxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cblx0XHQvLyBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggdGhlIHJlc3VsdHNcblx0XHRvcHRpb25zLmNhbGxiYWNrKG51bGwsIHtcblx0XHRcdG1vZGlmaWNhdGlvbnM6IG1vZGlmaWNhdGlvbnMsXG5cdFx0XHRkZWxldGlvbnM6IGRlbGV0aW9uc1xuXHRcdH0pO1xuXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHQvLyBJZiBCcm93c3dlciBTdG9yYWdlIHRpZGRsZXJzIHdlcmUgY2FjaGVkIG9uIHJlbG9hZGluZyB0aGUgd2lraSwgYWRkIHRoZW0gYWZ0ZXIgc3luYyBmcm9tIHNlcnZlciBjb21wbGV0ZXMgaW4gdGhlIGFib3ZlIGNhbGxiYWNrLlxuXHRcdFx0aWYgKCR0dy5icm93c2VyU3RvcmFnZSAmJiAkdHcuYnJvd3NlclN0b3JhZ2UuaXNFbmFibGVkKCkpIHtcblx0XHRcdFx0JHR3LmJyb3dzZXJTdG9yYWdlLmFkZENhY2hlZFRpZGRsZXJzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Lypcblx0UXVldWUgYSBsb2FkIGZvciBhIHRpZGRsZXIgaWYgdGhlcmUgaGFzIGJlZW4gYW4gdXBkYXRlIGZvciBpdCBzaW5jZSB0aGUgc3BlY2lmaWVkIHJldmlzaW9uXG5cdCovXG5cdGNoZWNrTGFzdFJlY29yZGVkVXBkYXRlKHRpdGxlOiBzdHJpbmcsIHJldmlzaW9uOiBzdHJpbmcpIHtcblx0XHR2YXIgbHJ1ID0gdGhpcy5sYXN0UmVjb3JkZWRVcGRhdGVbdGl0bGVdO1xuXHRcdGlmIChscnUpIHtcblx0XHRcdHZhciBudW1SZXZpc2lvbiA9ICR0dy51dGlscy5nZXRJbnQocmV2aXNpb24sIDApO1xuXHRcdFx0aWYgKCFudW1SZXZpc2lvbikge1xuXHRcdFx0XHR0aGlzLmxvZ2dlci5sb2coXCJFcnJvcjogcmV2aXNpb24gaXMgbm90IGEgbnVtYmVyXCIsIHJldmlzaW9uKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y29uc29sZS5sb2coYENoZWNraW5nIGZvciB1cGRhdGVzIHRvICR7dGl0bGV9IHNpbmNlICR7SlNPTi5zdHJpbmdpZnkocmV2aXNpb24pfSBjb21wYXJpbmcgdG8gJHtudW1SZXZpc2lvbn1gKTtcblx0XHRcdGlmIChscnUucmV2aXNpb25faWQgPiBudW1SZXZpc2lvbikge1xuXHRcdFx0XHR0aGlzLnN5bmNlciAmJiB0aGlzLnN5bmNlci5lbnF1ZXVlTG9hZFRpZGRsZXIodGl0bGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRnZXQgc3luY2VyKCkge1xuXHRcdC8vQHRzLWV4cGVjdC1lcnJvclxuXHRcdGlmICgkdHcuc3luY2FkYXB0b3IgPT09IHRoaXMpIHJldHVybiAkdHcuc3luY2VyO1xuXHR9XG5cdC8qXG5cdFNhdmUgYSB0aWRkbGVyIGFuZCBpbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggKGVycixhZGFwdG9ySW5mbyxyZXZpc2lvbilcblx0Ki9cblx0YXN5bmMgc2F2ZVRpZGRsZXIoXG5cdFx0dGlkZGxlcjogVGlkZGxlcixcblx0XHRjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IHsgYmFnOiBzdHJpbmcgfSwgcmV2aXNpb24/OiBzdHJpbmcpID0+IHZvaWQsXG5cdFx0b3B0aW9ucz86IHt9XG5cdCkge1xuXHRcdHZhciBzZWxmID0gdGhpcywgdGl0bGUgPSB0aWRkbGVyLmZpZWxkcy50aXRsZTtcblx0XHRpZiAodGhpcy5pc1JlYWRPbmx5IHx8IHRpdGxlLnN1YnN0cigwLCBNV0NfU1RBVEVfVElERExFUl9QUkVGSVgubGVuZ3RoKSA9PT0gTVdDX1NUQVRFX1RJRERMRVJfUFJFRklYKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCk7XG5cdFx0fVxuXHRcdHNlbGYub3V0c3RhbmRpbmdSZXF1ZXN0c1t0aXRsZV0gPSB7IHR5cGU6IFwiUFVUXCIgfTtcblx0XHQvLyBUT0RPOiBub3QgdXNpbmcgZ2V0RmllbGRTdHJpbmdCbG9jayBiZWNhdXNlIHdoYXQgaGFwcGVucyBpZiBhIGZpZWxkIG5hbWUgaGFzIGEgY29sb24gaW4gaXQ/XG5cdFx0bGV0IGJvZHkgPSBKU09OLnN0cmluZ2lmeSh0aWRkbGVyLmdldEZpZWxkU3RyaW5ncyh7IGV4Y2x1ZGU6IFtcInRleHRcIl0gfSkpO1xuXHRcdGlmICh0aWRkbGVyLmhhc0ZpZWxkKFwidGV4dFwiKSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0aWRkbGVyLmZpZWxkcy50ZXh0ICE9PSBcInN0cmluZ1wiICYmIHRpZGRsZXIuZmllbGRzLnRleHQpXG5cdFx0XHRcdHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJFcnJvciBzYXZpbmcgdGlkZGxlciBcIiArIHRpZGRsZXIuZmllbGRzLnRpdGxlICsgXCI6IHRoZSB0ZXh0IGZpZWxkIGlzIHRydXRoeSBidXQgbm90IGEgc3RyaW5nXCIpKTtcblx0XHRcdGJvZHkgKz0gYFxcblxcbiR7dGlkZGxlci5maWVsZHMudGV4dH1gXG5cdFx0fVxuXG5cdFx0Y29uc3QgW29rLCBlcnIsIHJlc3VsdF0gPSBhd2FpdCB0aGlzLmh0dHBSZXF1ZXN0KHtcblx0XHRcdHVybDogdGhpcy5ob3N0ICsgXCJyZWNpcGVzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucmVjaXBlKSArIFwiL3RpZGRsZXJzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRpdGxlKSxcblx0XHRcdHR5cGU6IFwiUFVUXCIsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiQ29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC1td3MtdGlkZGxlclwiXG5cdFx0XHR9LFxuXHRcdFx0ZGF0YTogYm9keSxcblx0XHRcdHJlc3BvbnNlVHlwZTogXCJqc29uXCIsXG5cdFx0fSk7XG5cdFx0ZGVsZXRlIHNlbGYub3V0c3RhbmRpbmdSZXF1ZXN0c1t0aXRsZV07XG5cdFx0aWYgKCFvaykgcmV0dXJuIGNhbGxiYWNrKGVycik7XG5cdFx0Y29uc3QgeyBoZWFkZXJzLCBkYXRhIH0gPSByZXN1bHQ7XG5cblx0XHQvL0lmIEJyb3dzZXItU3RvcmFnZSBwbHVnaW4gaXMgcHJlc2VudCwgcmVtb3ZlIHRpZGRsZXIgZnJvbSBsb2NhbCBzdG9yYWdlIGFmdGVyIHN1Y2Nlc3NmdWwgc3luYyB0byB0aGUgc2VydmVyXG5cdFx0aWYgKCR0dy5icm93c2VyU3RvcmFnZSAmJiAkdHcuYnJvd3NlclN0b3JhZ2UuaXNFbmFibGVkKCkpIHtcblx0XHRcdCR0dy5icm93c2VyU3RvcmFnZS5yZW1vdmVUaWRkbGVyRnJvbUxvY2FsU3RvcmFnZSh0aXRsZSk7XG5cdFx0fVxuXG5cdFx0Ly8gU2F2ZSB0aGUgZGV0YWlscyBvZiB0aGUgbmV3IHJldmlzaW9uIG9mIHRoZSB0aWRkbGVyXG5cdFx0Y29uc3QgcmV2aXNpb24gPSBkYXRhLnJldmlzaW9uX2lkLCBiYWdfbmFtZSA9IGRhdGEuYmFnX25hbWU7XG5cdFx0Y29uc29sZS5sb2coYFNhdmVkICR7dGl0bGV9IHdpdGggcmV2aXNpb24gJHtyZXZpc2lvbn0gYW5kIGJhZyAke2JhZ19uYW1lfWApO1xuXHRcdC8vIElmIHRoZXJlIGhhcyBiZWVuIGEgbW9yZSByZWNlbnQgdXBkYXRlIGZyb20gdGhlIHNlcnZlciB0aGVuIGVucXVldWUgYSBsb2FkIG9mIHRoaXMgdGlkZGxlclxuXHRcdHNlbGYuY2hlY2tMYXN0UmVjb3JkZWRVcGRhdGUodGl0bGUsIHJldmlzaW9uKTtcblx0XHQvLyBJbnZva2UgdGhlIGNhbGxiYWNrXG5cdFx0c2VsZi5zZXRUaWRkbGVySW5mbyh0aXRsZSwgcmV2aXNpb24sIGJhZ19uYW1lKTtcblx0XHRjYWxsYmFjayhudWxsLCB7IGJhZzogYmFnX25hbWUgfSwgcmV2aXNpb24pO1xuXG5cdH1cblx0Lypcblx0TG9hZCBhIHRpZGRsZXIgYW5kIGludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCAoZXJyLHRpZGRsZXJGaWVsZHMpXG5cblx0VGhlIHN5bmNlciBkb2VzIG5vdCBwYXNzIGl0c2VsZiBpbnRvIG9wdGlvbnMuXG5cdCovXG5cdGFzeW5jIGxvYWRUaWRkbGVyKHRpdGxlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXJyOiBhbnksIGZpZWxkcz86IGFueSkgPT4gdm9pZCwgb3B0aW9uczogYW55KSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNlbGYub3V0c3RhbmRpbmdSZXF1ZXN0c1t0aXRsZV0gPSB7IHR5cGU6IFwiR0VUXCIgfTtcblx0XHRjb25zdCBbb2ssIGVyciwgcmVzdWx0XSA9IGF3YWl0IHRoaXMuaHR0cFJlcXVlc3Qoe1xuXHRcdFx0dXJsOiB0aGlzLmhvc3QgKyBcInJlY2lwZXMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGhpcy5yZWNpcGUpICsgXCIvdGlkZGxlcnMvXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGl0bGUpLFxuXHRcdH0pO1xuXHRcdGRlbGV0ZSBzZWxmLm91dHN0YW5kaW5nUmVxdWVzdHNbdGl0bGVdO1xuXHRcdGlmIChlcnIgPT09IDQwNCkge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIG51bGwpO1xuXHRcdH0gZWxzZSBpZiAoIW9rKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyKTtcblx0XHR9XG5cdFx0Y29uc3QgeyBkYXRhLCBoZWFkZXJzIH0gPSByZXN1bHQ7XG5cdFx0Y29uc3QgcmV2aXNpb24gPSBoZWFkZXJzW1wieC1yZXZpc2lvbi1udW1iZXJcIl0sIGJhZ19uYW1lID0gaGVhZGVyc1tcIngtYmFnLW5hbWVcIl07XG5cdFx0Ly8gSWYgdGhlcmUgaGFzIGJlZW4gYSBtb3JlIHJlY2VudCB1cGRhdGUgZnJvbSB0aGUgc2VydmVyIHRoZW4gZW5xdWV1ZSBhIGxvYWQgb2YgdGhpcyB0aWRkbGVyXG5cdFx0c2VsZi5jaGVja0xhc3RSZWNvcmRlZFVwZGF0ZSh0aXRsZSwgcmV2aXNpb24pO1xuXHRcdC8vIEludm9rZSB0aGUgY2FsbGJhY2tcblx0XHRzZWxmLnNldFRpZGRsZXJJbmZvKHRpdGxlLCByZXZpc2lvbiwgYmFnX25hbWUpO1xuXHRcdGNhbGxiYWNrKG51bGwsICR0dy51dGlscy5wYXJzZUpTT05TYWZlKGRhdGEpKTtcblx0fVxuXHQvKlxuXHREZWxldGUgYSB0aWRkbGVyIGFuZCBpbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggKGVycilcblx0b3B0aW9ucyBpbmNsdWRlOlxuXHR0aWRkbGVySW5mbzogdGhlIHN5bmNlcidzIHRpZGRsZXJJbmZvIGZvciB0aGlzIHRpZGRsZXJcblx0Ki9cblx0YXN5bmMgZGVsZXRlVGlkZGxlcih0aXRsZTogc3RyaW5nLCBjYWxsYmFjazogKGVycjogYW55LCBhZGFwdG9ySW5mbz86IGFueSkgPT4gdm9pZCwgb3B0aW9uczogYW55KSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdGlmICh0aGlzLmlzUmVhZE9ubHkpIHsgcmV0dXJuIGNhbGxiYWNrKG51bGwpOyB9XG5cdFx0Ly8gSWYgd2UgZG9uJ3QgaGF2ZSBhIGJhZyBpdCBtZWFucyB0aGF0IHRoZSB0aWRkbGVyIGhhc24ndCBiZWVuIHNlZW4gYnkgdGhlIHNlcnZlciwgc28gd2UgZG9uJ3QgbmVlZCB0byBkZWxldGUgaXRcblx0XHQvLyB2YXIgYmFnID0gdGhpcy5nZXRUaWRkbGVyQmFnKHRpdGxlKTtcblx0XHQvLyBpZighYmFnKSB7IHJldHVybiBjYWxsYmFjayhudWxsLCBvcHRpb25zLnRpZGRsZXJJbmZvLmFkYXB0b3JJbmZvKTsgfVxuXHRcdHNlbGYub3V0c3RhbmRpbmdSZXF1ZXN0c1t0aXRsZV0gPSB7IHR5cGU6IFwiREVMRVRFXCIgfTtcblx0XHQvLyBJc3N1ZSBIVFRQIHJlcXVlc3QgdG8gZGVsZXRlIHRoZSB0aWRkbGVyXG5cdFx0Y29uc3QgW29rLCBlcnIsIHJlc3VsdF0gPSBhd2FpdCB0aGlzLmh0dHBSZXF1ZXN0KHtcblx0XHRcdHVybDogdGhpcy5ob3N0ICsgXCJyZWNpcGVzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMucmVjaXBlKSArIFwiL3RpZGRsZXJzL1wiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRpdGxlKSxcblx0XHRcdHR5cGU6IFwiREVMRVRFXCIsXG5cdFx0fSk7XG5cdFx0ZGVsZXRlIHNlbGYub3V0c3RhbmRpbmdSZXF1ZXN0c1t0aXRsZV07XG5cdFx0aWYgKCFvaykgeyByZXR1cm4gY2FsbGJhY2soZXJyKTsgfVxuXHRcdGNvbnN0IHsgZGF0YSB9ID0gcmVzdWx0O1xuXHRcdGNvbnN0IHJldmlzaW9uID0gZGF0YS5yZXZpc2lvbl9pZCwgYmFnX25hbWUgPSBkYXRhLmJhZ19uYW1lO1xuXHRcdC8vIElmIHRoZXJlIGhhcyBiZWVuIGEgbW9yZSByZWNlbnQgdXBkYXRlIGZyb20gdGhlIHNlcnZlciB0aGVuIGVucXVldWUgYSBsb2FkIG9mIHRoaXMgdGlkZGxlclxuXHRcdHNlbGYuY2hlY2tMYXN0UmVjb3JkZWRVcGRhdGUodGl0bGUsIHJldmlzaW9uKTtcblx0XHRzZWxmLnJlbW92ZVRpZGRsZXJJbmZvKHRpdGxlKTtcblx0XHQvLyBJbnZva2UgdGhlIGNhbGxiYWNrICYgcmV0dXJuIG51bGwgYWRhcHRvckluZm9cblx0XHRjYWxsYmFjayhudWxsLCBudWxsKTtcblx0fVxufVxuXG5cbmlmICgkdHcuYnJvd3NlciAmJiBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbC5zdGFydHNXaXRoKFwiaHR0cFwiKSkge1xuXHRleHBvcnRzLmFkYXB0b3JDbGFzcyA9IE11bHRpV2lraUNsaWVudEFkYXB0b3I7XG59XG4iXX0=