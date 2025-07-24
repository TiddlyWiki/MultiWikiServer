Diffs the JSX and applies new nodes and attributes into the DOM. 

If the attribute exists as a property on the element, it will be set directly, otherwise if it is a string it will be set as an attribute, otherwise it will be added to the element. 

If an attribute name starts with on, and the value is a function, it will instead use addEventListener with the event name (minus the `on` prefix).

If you pass a ref property, it will be called or it's current property will be assigned to.
