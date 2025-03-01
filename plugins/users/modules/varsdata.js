/*\
title: $:/core/modules/widgets/varsdata.js
type: application/javascript
module-type: widget

This widget allows multiple variables to be set in one go:

```
\define helloworld() Hello world!
<$vars greeting="Hi" me={{!!title}} sentence=<<helloworld>>>
  <<greeting>>! I am <<me>> and I say: <<sentence>>
</$vars>
```

\*/


/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

class VarsWidget extends Widget {
  constructor(parseTreeNode, options) {
    super();
    // Initialise
    this.initialise(parseTreeNode, options);
  }
  /*
  Render this widget into the DOM
  */
  render(parent, nextSibling) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    this.renderChildren(parent, nextSibling);
  }
  /*
  Compute the internal state of the widget
  */
  execute() {
    // Parse variables
    var self = this;
    var title = this.getAttribute("tiddler");
    if(!title) {
      console.error("JSON tiddler not specified.");
      jsonData = {};
    }
    var jsonData = $tw.wiki.getTiddlerData(title);
    if(!jsonData) {
      console.error("tiddler '" + title + "' not found or is invalid.");
      jsonData = {};
    }
    // Set variables from the imported JSON data
    $tw.utils.each(jsonData, function(val, key) {
      self.setVariable(key, val);
    });
    // Construct the child widgets
    this.makeChildWidgets();
  }
  /*
  Refresh the widget by ensuring our attributes are up to date
  */
  refresh(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if($tw.utils.count(changedAttributes) > 0 || changedTiddlers[this.getAttribute("tiddler")]) {
      this.refreshSelf();
      return true;
    }
    return this.refreshChildren(changedTiddlers);
  }
}




exports["varsdata"] = VarsWidget;
