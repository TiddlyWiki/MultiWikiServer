/*\
title: $:/plugins/tiddlywiki/multiwikipanel/restapiwidget.js
type: application/javascript
module-type: widget

A widget that calls a javascript tiddler (exporting a handler function and the widget's name)
to fetch API data asynchronously and inject the resulting variables into its child widget context.
If the action tiddler is invalid, it renders an error and stops processing.
\*/
"use strict";

const Widget = require("$:/core/modules/widgets/widget.js").widget;

class RestApiWidget extends Widget {
  constructor(parseTreeNode, options) {
    super();
    this.apiVariables = {};
    this.initialise(parseTreeNode, options);
  }

  // Render the widget into the DOM.
  render(parent, nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();

    if(this.invalidAction) {
      // Render error message if the action tiddler is invalid.
      const errorNode = this.document.createElement("div");
      errorNode.className = "tw-restapiwidget-error";
      errorNode.textContent = this.errorMessage;
      parent.insertBefore(errorNode, nextSibling);
      return;
    }

    // Render child widgets (they can use our API-provided variables)
    this.renderChildren(parent, nextSibling);

    // Execute the API call asynchronously.
    this.runJsTiddler();

    this.firstRenderDone = true;
  }

  // Compute the widget state and validate the jsTiddler.
  execute() {
    // Get the action tiddler containing our JS code.
    this.jsTiddler = this.getAttribute("handler", null);
    this.jsOutput = this.getAttribute("output", null);
    // Get an optional refresh trigger tiddler.
    this.refreshTiddler = this.getAttribute("refresh", null);

    this.checkRefreshTiddler();

    try {
      this.checkJsTiddler();
    } catch(e) {
      if(typeof e !== "string") throw e;
      this.invalidAction = true;
      this.errorMessage = e;
      return;
    }

    // Build child widgets if valid.
    this.makeChildWidgets();
  }

  // Execute the action tiddler's handler function.
  // The handler receives the current variables and should return (or resolve to) an object or Map.
  runJsTiddler() {
    if(this.firstRenderDone && !this.checkRefreshTiddler()) return;
    new Promise((resolve, reject) => {
      try {
        const moduleExport = require(this.jsTiddler);
        const result = moduleExport.handler();
        if(result && typeof result.then === "function") {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch(e) {
        console.log(
          `RestApiWidget: Error executing handler in jsTiddler '${this.jsTiddler}': ${e}`
        );
        reject(e);
      }
    }).then((result) => {
      console.log(result);
      this.wiki.setTiddlerData(this.jsOutput, result);
    }, (error) => {
      console.log("RestApiWidget: Error during API call: " + error);
    });
  }

  // Refresh the widget. If the refreshTiddler's rendered text has changed, re-run the API call.
  refresh(changedTiddlers) {
    if(this.invalidAction) {
      return false;
    }
    if(this.refreshTiddler && (changedTiddlers[this.refreshTiddler] || this.checkRefreshTiddler())) {
      this.runJsTiddler();
      return true;
    }
    return this.refreshChildren(changedTiddlers);
  }

  checkJsTiddler() {
    // Validate the jsTiddler.
    if(!this.jsTiddler) {
      throw "RestApiWidget Error: No jsTiddler specified.";
    }
    try {
      const moduleExport = require(this.jsTiddler);
      if(!moduleExport || typeof moduleExport.handler !== "function")
        throw `RestApiWidget Error: The tiddler '${this.jsTiddler}' does not export a valid handler function.`;

    } catch(e) {
      throw `RestApiWidget Error: Error loading jsTiddler '${this.jsTiddler}': ${e}`;
    }
  }

  checkRefreshTiddler() {
    if(!this.refreshTiddler) {
      return false;
    }
    const newContent = $tw.wiki.renderTiddler("text/plain", this.refreshTiddler);
    if(newContent !== this.lastRefreshContent) {
      this.lastRefreshContent = newContent;
      return true;
    }
    return false;
  }

}

exports["restapiwidget"] = RestApiWidget;
