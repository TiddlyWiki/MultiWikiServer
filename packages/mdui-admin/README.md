This project uses a custom JSX runtime which essentially converts JSX into HTML DOM components directly using a very naive diffing algorithm. If it can't reuse the existing DOM node, it will create a new one and discard the old one.

There are two kinds of components supported by JSX: strings and functions. Strings are handled as tag names and functions are handled as constructors for a custom element with defined properties.

## string elements

These may be the registered tag name of a custom element or any valid tag name. The attributes are the standard HTML attributes and get written directly to the element's attributes in the DOM. JSX attributes are always written as attributes, never set directly as properties. How the element handles attributes being set and changed is entirely up to the element. 

## function elements

These are the reference to the class of a custom element. The JSX runtime will assign all JSX props to the `props` property of the element instance, as well as setting the `class` and `style` attributes directly. Any other desired attributes may be set directly with `webjsx-attr-${string}`. Attributes reflected by the element may be watched with `webjsx-watch-${string}={{get: () => string; set: (value: string) => void;}}`. A MutationObserver watches the element for changes and calls the set function whenever it fires. 
