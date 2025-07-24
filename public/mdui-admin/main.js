var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg2) => {
  throw TypeError(msg2);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n2 = fns && fns.length; i < n2; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s2 = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s2 ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc2 = k && (!p && !s2 && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s2, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc2.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc2.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc2[key] : k > 4 ? void 0 : { get: desc2.get, set: desc2.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc2[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc2.get = fn), __expectFn(fn = it.set) && (desc2.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc2 && __defProp(target, name, desc2), p ? k ^ 4 ? extra : desc2 : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg2) => member.has(obj) || __typeError("Cannot " + msg2);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/ssr-window/ssr-window.esm.js
function isObject(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend(target = {}, src = {}) {
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined")
      target[key] = src[key];
    else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
      extend(target[key], src[key]);
    }
  });
}
var ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend(doc, ssrDocument);
  return doc;
}
var ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent2() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id2) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id2);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend(win, ssrWindow);
  return win;
}

// node_modules/@mdui/jq/shared/helper.js
var getNodeName = (element) => {
  return element?.nodeName.toLowerCase() ?? "";
};
var isNodeName = (element, name) => {
  return element?.nodeName.toLowerCase() === name.toLowerCase();
};
var isFunction = (target) => {
  return typeof target === "function";
};
var isString = (target) => {
  return typeof target === "string";
};
var isNumber = (target) => {
  return typeof target === "number";
};
var isBoolean = (target) => {
  return typeof target === "boolean";
};
var isUndefined = (target) => {
  return typeof target === "undefined";
};
var isNull = (target) => {
  return target === null;
};
var isWindow = (target) => {
  return typeof Window !== "undefined" && target instanceof Window;
};
var isDocument = (target) => {
  return typeof Document !== "undefined" && target instanceof Document;
};
var isElement = (target) => {
  return typeof Element !== "undefined" && target instanceof Element;
};
var isNode = (target) => {
  return typeof Node !== "undefined" && target instanceof Node;
};
var isArrayLike = (target) => {
  return !isFunction(target) && !isWindow(target) && isNumber(target.length);
};
var isObjectLike = (target) => {
  return typeof target === "object" && target !== null;
};
var toElement = (target) => {
  return isDocument(target) ? target.documentElement : target;
};
var toCamelCase = (string) => {
  return string.replace(/-([a-z])/g, (_, letter) => {
    return letter.toUpperCase();
  });
};
var toKebabCase = (string) => {
  if (!string) {
    return string;
  }
  return string.replace(/^./, string[0].toLowerCase()).replace(/[A-Z]/g, (replacer) => {
    return "-" + replacer.toLowerCase();
  });
};
var returnFalse = () => {
  return false;
};
var eachArray = (target, callback) => {
  for (let i = 0; i < target.length; i += 1) {
    if (callback.call(target[i], target[i], i) === false) {
      return target;
    }
  }
  return target;
};
var eachObject = (target, callback) => {
  const keys = Object.keys(target);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (callback.call(target[key], key, target[key]) === false) {
      return target;
    }
  }
  return target;
};

// node_modules/@mdui/jq/shared/core.js
var JQ = class {
  constructor(arr) {
    this.length = 0;
    if (!arr) {
      return this;
    }
    eachArray(arr, (item, i) => {
      this[i] = item;
    });
    this.length = arr.length;
    return this;
  }
};

// node_modules/@mdui/jq/shared/dom.js
var isDomReady = (document3 = getDocument()) => {
  return /complete|interactive/.test(document3.readyState);
};
var createElement = (tagName) => {
  const document3 = getDocument();
  return document3.createElement(tagName);
};
var appendChild = (element, child) => {
  return element.appendChild(child);
};
var removeChild = (element) => {
  return element.parentNode ? element.parentNode.removeChild(element) : element;
};
var getChildNodesArray = (target, parent) => {
  const tempParent = createElement(parent);
  tempParent.innerHTML = target;
  return [].slice.call(tempParent.childNodes);
};

// node_modules/@mdui/jq/$.js
var get$ = () => {
  const $2 = function(selector) {
    if (!selector) {
      return new JQ();
    }
    if (selector instanceof JQ) {
      return selector;
    }
    if (isFunction(selector)) {
      const document3 = getDocument();
      if (isDomReady(document3)) {
        selector.call(document3, $2);
      } else {
        document3.addEventListener("DOMContentLoaded", () => selector.call(document3, $2), { once: true });
      }
      return new JQ([document3]);
    }
    if (isString(selector)) {
      const html2 = selector.trim();
      if (html2.startsWith("<") && html2.endsWith(">")) {
        let toCreate = "div";
        const tags = {
          li: "ul",
          tr: "tbody",
          td: "tr",
          th: "tr",
          tbody: "table",
          option: "select"
        };
        eachObject(tags, (childTag, parentTag) => {
          if (html2.startsWith(`<${childTag}`)) {
            toCreate = parentTag;
            return false;
          }
          return;
        });
        return new JQ(getChildNodesArray(html2, toCreate));
      }
      const document3 = getDocument();
      return new JQ(document3.querySelectorAll(selector));
    }
    if (isArrayLike(selector) && !isNode(selector)) {
      return new JQ(selector);
    }
    return new JQ([selector]);
  };
  $2.fn = JQ.prototype;
  return $2;
};
var $ = get$();

// node_modules/@mdui/jq/functions/merge.js
var merge = (first, second) => {
  eachArray(second, (value) => {
    first.push(value);
  });
  return first;
};

// node_modules/@mdui/jq/functions/unique.js
var unique = (arr) => {
  return [...new Set(arr)];
};

// node_modules/@mdui/jq/methods/get.js
$.fn.get = function(index) {
  return index === void 0 ? [].slice.call(this) : this[index >= 0 ? index : index + this.length];
};

// node_modules/@mdui/jq/methods/add.js
$.fn.add = function(selector) {
  return new JQ(unique(merge(this.get(), $(selector).get())));
};

// node_modules/@mdui/jq/shared/attributes.js
var getAttribute = (element, key, defaultValue2) => {
  const value = element.getAttribute(key);
  return isNull(value) ? defaultValue2 : value;
};
var removeAttribute = (element, key) => {
  element.removeAttribute(key);
};
var setAttribute = (element, key, value) => {
  if (isNull(value)) {
    removeAttribute(element, key);
  } else {
    element.setAttribute(key, value);
  }
};

// node_modules/@mdui/jq/methods/each.js
$.fn.each = function(callback) {
  return eachArray(this, (value, index) => {
    return callback.call(value, index, value);
  });
};

// node_modules/@mdui/jq/methods/addClass.js
eachArray(["add", "remove", "toggle"], (name) => {
  $.fn[`${name}Class`] = function(className2) {
    if (name === "remove" && !arguments.length) {
      return this.each((_, element) => {
        setAttribute(element, "class", "");
      });
    }
    return this.each((i, element) => {
      if (!isElement(element)) {
        return;
      }
      const classes = (isFunction(className2) ? className2.call(element, i, getAttribute(element, "class", "")) : className2).split(" ").filter((name2) => name2);
      eachArray(classes, (cls) => {
        element.classList[name](cls);
      });
    });
  };
});

// node_modules/@mdui/jq/methods/insertBefore.js
eachArray(["insertBefore", "insertAfter"], (name, nameIndex) => {
  $.fn[name] = function(target) {
    const $element = nameIndex ? $(this.get().reverse()) : this;
    const $target = $(target);
    const result = [];
    $target.each((index, target2) => {
      if (!target2.parentNode) {
        return;
      }
      $element.each((_, element) => {
        const newItem = index ? element.cloneNode(true) : element;
        const existingItem = nameIndex ? target2.nextSibling : target2;
        result.push(newItem);
        target2.parentNode.insertBefore(newItem, existingItem);
      });
    });
    return $(nameIndex ? result.reverse() : result);
  };
});

// node_modules/@mdui/jq/methods/before.js
var isPlainText = (target) => {
  return isString(target) && !(target.startsWith("<") && target.endsWith(">"));
};
eachArray(["before", "after"], (name, nameIndex) => {
  $.fn[name] = function(...args) {
    if (nameIndex === 1) {
      args = args.reverse();
    }
    return this.each((index, element) => {
      const targets = isFunction(args[0]) ? [args[0].call(element, index, element.innerHTML)] : args;
      eachArray(targets, (target) => {
        let $target;
        if (isPlainText(target)) {
          $target = $(getChildNodesArray(target, "div"));
        } else if (index && isElement(target)) {
          $target = $(target.cloneNode(true));
        } else {
          $target = $(target);
        }
        $target[nameIndex ? "insertAfter" : "insertBefore"](element);
      });
    });
  };
});

// node_modules/@mdui/jq/functions/each.js
function each(target, callback) {
  return isArrayLike(target) ? eachArray(target, (value, index) => {
    return callback.call(value, index, value);
  }) : eachObject(target, callback);
}

// node_modules/@mdui/jq/functions/map.js
function map(elements, callback) {
  const window2 = getWindow();
  let value;
  const ret = [];
  each(elements, (i, element) => {
    value = callback.call(window2, element, i);
    if (value != null) {
      ret.push(value);
    }
  });
  return [].concat(...ret);
}

// node_modules/@mdui/jq/methods/map.js
$.fn.map = function(callback) {
  return new JQ(map(this, (element, i) => {
    return callback.call(element, i, element);
  }));
};

// node_modules/@mdui/jq/methods/clone.js
$.fn.clone = function() {
  return this.map(function() {
    return this.cloneNode(true);
  });
};

// node_modules/@mdui/jq/methods/is.js
$.fn.is = function(selector) {
  let isMatched = false;
  if (isFunction(selector)) {
    this.each((index, element) => {
      if (selector.call(element, index, element)) {
        isMatched = true;
      }
    });
    return isMatched;
  }
  if (isString(selector)) {
    this.each((_, element) => {
      if (isDocument(element) || isWindow(element)) {
        return;
      }
      if (element.matches.call(element, selector)) {
        isMatched = true;
      }
    });
    return isMatched;
  }
  const $compareWith = $(selector);
  this.each((_, element) => {
    $compareWith.each((_2, compare2) => {
      if (element === compare2) {
        isMatched = true;
      }
    });
  });
  return isMatched;
};

// node_modules/@mdui/jq/methods/remove.js
$.fn.remove = function(selector) {
  return this.each((_, element) => {
    if (!selector || $(element).is(selector)) {
      removeChild(element);
    }
  });
};

// node_modules/@mdui/jq/methods/append.js
eachArray(["prepend", "append"], (name, nameIndex) => {
  $.fn[name] = function(...args) {
    return this.each((index, element) => {
      const childNodes = element.childNodes;
      const childLength = childNodes.length;
      const child = childLength ? childNodes[nameIndex ? childLength - 1 : 0] : createElement("div");
      if (!childLength) {
        appendChild(element, child);
      }
      let contents = isFunction(args[0]) ? [args[0].call(element, index, element.innerHTML)] : args;
      if (index) {
        contents = contents.map((content) => {
          return isString(content) ? content : $(content).clone();
        });
      }
      $(child)[nameIndex ? "after" : "before"](...contents);
      if (!childLength) {
        removeChild(child);
      }
    });
  };
});

// node_modules/@mdui/jq/methods/appendTo.js
eachArray(["appendTo", "prependTo"], (name, nameIndex) => {
  $.fn[name] = function(target) {
    const extraChilds = [];
    const $target = $(target).map((_, element) => {
      const childNodes = element.childNodes;
      const childLength = childNodes.length;
      if (childLength) {
        return childNodes[nameIndex ? 0 : childLength - 1];
      }
      const child = createElement("div");
      appendChild(element, child);
      extraChilds.push(child);
      return child;
    });
    const $result = this[nameIndex ? "insertBefore" : "insertAfter"]($target);
    $(extraChilds).remove();
    return $result;
  };
});

// node_modules/@mdui/jq/shared/css.js
var getComputedStyleValue = (element, name) => {
  const window2 = getWindow();
  return window2.getComputedStyle(element).getPropertyValue(toKebabCase(name));
};
var isBorderBox = (element) => {
  return getComputedStyleValue(element, "box-sizing") === "border-box";
};
var getExtraWidth = (element, direction, extra) => {
  const position = direction === "width" ? ["Left", "Right"] : ["Top", "Bottom"];
  return [0, 1].reduce((prev, _, index) => {
    let prop = extra + position[index];
    if (extra === "border") {
      prop += "Width";
    }
    return prev + parseFloat(getComputedStyleValue(element, prop) || "0");
  }, 0);
};
var getStyle = (element, name) => {
  if (name === "width" || name === "height") {
    const valueNumber = element.getBoundingClientRect()[name];
    if (isBorderBox(element)) {
      return `${valueNumber}px`;
    }
    return `${valueNumber - getExtraWidth(element, name, "border") - getExtraWidth(element, name, "padding")}px`;
  }
  return getComputedStyleValue(element, name);
};
var cssNumber = [
  "animation-iteration-count",
  "column-count",
  "fill-opacity",
  "flex-grow",
  "flex-shrink",
  "font-weight",
  "grid-area",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "line-height",
  "opacity",
  "order",
  "orphans",
  "widows",
  "z-index",
  "zoom"
];

// node_modules/@mdui/jq/methods/attr.js
eachArray(["attr", "prop", "css"], (name, nameIndex) => {
  const set4 = (element, key, value) => {
    if (isUndefined(value)) {
      return;
    }
    if (nameIndex === 0) {
      return setAttribute(element, key, value);
    }
    if (nameIndex === 1) {
      element[key] = value;
      return;
    }
    key = toKebabCase(key);
    const getSuffix = () => key.startsWith("--") || cssNumber.includes(key) ? "" : "px";
    element.style.setProperty(key, isNumber(value) ? `${value}${getSuffix()}` : value);
  };
  const get4 = (element, key) => {
    if (nameIndex === 0) {
      return getAttribute(element, key);
    }
    if (nameIndex === 1) {
      return element[key];
    }
    return getStyle(element, key);
  };
  $.fn[name] = function(key, value) {
    if (isObjectLike(key)) {
      eachObject(key, (k, v) => {
        this[name](k, v);
      });
      return this;
    }
    if (arguments.length === 1) {
      const element = this[0];
      return isElement(element) ? get4(element, key) : void 0;
    }
    return this.each((i, element) => {
      set4(element, key, isFunction(value) ? value.call(element, i, get4(element, key)) : value);
    });
  };
});

// node_modules/@mdui/jq/methods/children.js
$.fn.children = function(selector) {
  const children = [];
  this.each((_, element) => {
    eachArray(element.childNodes, (childNode) => {
      if (!isElement(childNode)) {
        return;
      }
      if (!selector || $(childNode).is(selector)) {
        children.push(childNode);
      }
    });
  });
  return new JQ(unique(children));
};

// node_modules/@mdui/jq/methods/slice.js
$.fn.slice = function(...args) {
  return new JQ([].slice.apply(this, args));
};

// node_modules/@mdui/jq/methods/eq.js
$.fn.eq = function(index) {
  const ret = index === -1 ? this.slice(index) : this.slice(index, +index + 1);
  return new JQ(ret);
};

// node_modules/@mdui/jq/methods/utils/dir.js
var dir = ($elements, nameIndex, node, selector, filter) => {
  const ret = [];
  let target;
  $elements.each((_, element) => {
    target = element[node];
    while (target && isElement(target)) {
      if (nameIndex === 2) {
        if (selector && $(target).is(selector)) {
          break;
        }
        if (!filter || $(target).is(filter)) {
          ret.push(target);
        }
      } else if (nameIndex === 0) {
        if (!selector || $(target).is(selector)) {
          ret.push(target);
        }
        break;
      } else {
        if (!selector || $(target).is(selector)) {
          ret.push(target);
        }
      }
      target = target[node];
    }
  });
  return new JQ(unique(ret));
};

// node_modules/@mdui/jq/methods/parent.js
eachArray(["", "s", "sUntil"], (name, nameIndex) => {
  $.fn[`parent${name}`] = function(selector, filter) {
    const $nodes = !nameIndex ? this : $(this.get().reverse());
    return dir($nodes, nameIndex, "parentNode", selector, filter);
  };
});

// node_modules/@mdui/jq/methods/closest.js
$.fn.closest = function(selector) {
  if (this.is(selector)) {
    return this;
  }
  const matched = [];
  this.parents().each((_, element) => {
    if ($(element).is(selector)) {
      matched.push(element);
      return false;
    }
  });
  return new JQ(matched);
};

// node_modules/@mdui/jq/shared/data.js
var weakMap = /* @__PURE__ */ new WeakMap();
var getAll = (element) => {
  return weakMap.get(element) ?? {};
};
var get = (element, keyOriginal) => {
  const data2 = getAll(element);
  const key = toCamelCase(keyOriginal);
  return key in data2 ? data2[key] : void 0;
};
var setAll = (element, object) => {
  const data2 = getAll(element);
  eachObject(object, (keyOriginal, value) => {
    data2[toCamelCase(keyOriginal)] = value;
  });
  weakMap.set(element, data2);
};
var set = (element, keyOriginal, value) => {
  setAll(element, { [keyOriginal]: value });
};
var removeAll = (element) => {
  weakMap.delete(element);
};
var removeMultiple = (element, keysOriginal) => {
  const data2 = getAll(element);
  eachArray(keysOriginal, (keyOriginal) => {
    const key = toCamelCase(keyOriginal);
    delete data2[key];
  });
  weakMap.set(element, data2);
};
var rbrace = /^(?:{[\w\W]*\}|\[[\w\W]*\])$/;
var stringTransform = (value) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === "null") {
    return null;
  }
  if (value === +value + "") {
    return +value;
  }
  if (rbrace.test(value)) {
    return JSON.parse(value);
  }
  return value;
};
var dataAttr = (element, key, value) => {
  if (isUndefined(value) && element.nodeType === 1) {
    value = element.dataset[key];
    if (isString(value)) {
      try {
        value = stringTransform(value);
      } catch (_err) {
      }
    }
  }
  return value;
};

// node_modules/@mdui/jq/methods/data.js
$.fn.data = function(key, value) {
  if (isUndefined(key)) {
    if (!this.length) {
      return void 0;
    }
    const element = this[0];
    const resultData = getAll(element);
    if (element.nodeType !== 1) {
      return resultData;
    }
    eachObject(element.dataset, (key2) => {
      resultData[key2] = dataAttr(element, key2, resultData[key2]);
    });
    return resultData;
  }
  if (isObjectLike(key)) {
    return this.each(function() {
      setAll(this, key);
    });
  }
  if (arguments.length === 2 && isUndefined(value)) {
    return this;
  }
  if (!isUndefined(value)) {
    return this.each(function() {
      set(this, key, value);
    });
  }
  if (!this.length) {
    return void 0;
  }
  return dataAttr(this[0], toCamelCase(key), get(this[0], key));
};

// node_modules/@mdui/jq/methods/empty.js
$.fn.empty = function() {
  return this.each((_, element) => {
    element.innerHTML = "";
  });
};

// node_modules/@mdui/jq/methods/extend.js
$.fn.extend = function(obj) {
  eachObject(obj, (prop, value) => {
    $.fn[prop] = value;
  });
  return this;
};

// node_modules/@mdui/jq/methods/filter.js
$.fn.filter = function(selector) {
  if (isFunction(selector)) {
    return this.map((index, element) => {
      return selector.call(element, index, element) ? element : void 0;
    });
  }
  if (isString(selector)) {
    return this.map((_, element) => {
      return $(element).is(selector) ? element : void 0;
    });
  }
  const $selector = $(selector);
  return this.map((_, element) => {
    return $selector.get().includes(element) ? element : void 0;
  });
};

// node_modules/@mdui/jq/methods/find.js
$.fn.find = function(selector) {
  const foundElements = [];
  this.each((_, element) => {
    merge(foundElements, $(element.querySelectorAll(selector)).get());
  });
  return new JQ(foundElements);
};

// node_modules/@mdui/jq/methods/first.js
$.fn.first = function() {
  return this.eq(0);
};

// node_modules/@mdui/jq/functions/contains.js
var contains = (container, contains2) => {
  return container !== contains2 && toElement(container).contains(contains2);
};

// node_modules/@mdui/jq/methods/has.js
$.fn.has = function(selector) {
  const $targets = isString(selector) ? this.find(selector) : $(selector);
  const { length } = $targets;
  return this.map(function() {
    for (let i = 0; i < length; i += 1) {
      if (contains(this, $targets[i])) {
        return this;
      }
    }
    return;
  });
};

// node_modules/@mdui/jq/methods/hasClass.js
$.fn.hasClass = function(className2) {
  return this[0].classList.contains(className2);
};

// node_modules/@mdui/jq/methods/width.js
var handleExtraWidth = (element, name, value, funcIndex, includeMargin, multiply) => {
  const getExtraWidthValue = (extra) => {
    return getExtraWidth(element, name.toLowerCase(), extra) * multiply;
  };
  if (funcIndex === 2 && includeMargin) {
    value += getExtraWidthValue("margin");
  }
  if (isBorderBox(element)) {
    if (funcIndex === 0) {
      value -= getExtraWidthValue("border");
    }
    if (funcIndex === 1) {
      value -= getExtraWidthValue("border");
      value -= getExtraWidthValue("padding");
    }
  } else {
    if (funcIndex === 0) {
      value += getExtraWidthValue("padding");
    }
    if (funcIndex === 2) {
      value += getExtraWidthValue("border");
      value += getExtraWidthValue("padding");
    }
  }
  return value;
};
var get2 = (element, name, funcIndex, includeMargin) => {
  const document3 = getDocument();
  const clientProp = `client${name}`;
  const scrollProp = `scroll${name}`;
  const offsetProp = `offset${name}`;
  const innerProp = `inner${name}`;
  if (isWindow(element)) {
    return funcIndex === 2 ? element[innerProp] : toElement(document3)[clientProp];
  }
  if (isDocument(element)) {
    const doc = toElement(element);
    return Math.max(
      // @ts-ignore
      element.body[scrollProp],
      doc[scrollProp],
      // @ts-ignore
      element.body[offsetProp],
      doc[offsetProp],
      doc[clientProp]
    );
  }
  const value = parseFloat(getComputedStyleValue(element, name.toLowerCase()) || "0");
  return handleExtraWidth(element, name, value, funcIndex, includeMargin, 1);
};
var set2 = (element, elementIndex, name, funcIndex, includeMargin, value) => {
  let computedValue = isFunction(value) ? value.call(element, elementIndex, get2(element, name, funcIndex, includeMargin)) : value;
  if (computedValue == null) {
    return;
  }
  const $element = $(element);
  const dimension = name.toLowerCase();
  if (isString(computedValue) && ["auto", "inherit", ""].includes(computedValue)) {
    $element.css(dimension, computedValue);
    return;
  }
  const suffix = computedValue.toString().replace(/\b[0-9.]*/, "");
  const numerical = parseFloat(computedValue);
  computedValue = handleExtraWidth(element, name, numerical, funcIndex, includeMargin, -1) + (suffix || "px");
  $element.css(dimension, computedValue);
};
eachArray(["Width", "Height"], (name) => {
  eachArray([`inner${name}`, name.toLowerCase(), `outer${name}`], (funcName, funcIndex) => {
    $.fn[funcName] = function(margin, value) {
      const isSet = arguments.length && (funcIndex < 2 || !isBoolean(margin));
      const includeMargin = margin === true || value === true;
      if (!isSet) {
        return this.length ? get2(this[0], name, funcIndex, includeMargin) : void 0;
      }
      return this.each((index, element) => {
        return set2(element, index, name, funcIndex, includeMargin, margin);
      });
    };
  });
});

// node_modules/@mdui/jq/methods/hide.js
$.fn.hide = function() {
  return this.each((_, element) => {
    element.style.display = "none";
  });
};

// node_modules/@mdui/jq/methods/val.js
eachArray(["val", "html", "text"], (name, nameIndex) => {
  const props = ["value", "innerHTML", "textContent"];
  const propName = props[nameIndex];
  const get4 = ($elements) => {
    if (nameIndex === 2) {
      return map($elements, (element) => {
        return toElement(element)[propName];
      }).join("");
    }
    if (!$elements.length) {
      return void 0;
    }
    const firstElement = $elements[0];
    const $firstElement = $(firstElement);
    if (nameIndex === 0 && $firstElement.is("select[multiple]")) {
      return map($firstElement.find("option:checked"), (element) => element.value);
    }
    return firstElement[propName];
  };
  const set4 = (element, value) => {
    if (isUndefined(value)) {
      if (nameIndex !== 0) {
        return;
      }
      value = "";
    }
    if (nameIndex === 1 && isElement(value)) {
      value = value.outerHTML;
    }
    element[propName] = value;
  };
  $.fn[name] = function(value) {
    if (!arguments.length) {
      return get4(this);
    }
    return this.each((i, element) => {
      const $element = $(element);
      const computedValue = isFunction(value) ? value.call(element, i, get4($element)) : value;
      if (nameIndex === 0 && Array.isArray(computedValue)) {
        if ($element.is("select[multiple]")) {
          map($element.find("option"), (option) => {
            return option.selected = computedValue.includes(option.value);
          });
        } else {
          element.checked = computedValue.includes(element.value);
        }
      } else {
        set4(element, computedValue);
      }
    });
  };
});

// node_modules/@mdui/jq/methods/index.js
$.fn.index = function(selector) {
  if (!arguments.length) {
    return this.eq(0).parent().children().get().indexOf(this[0]);
  }
  if (isString(selector)) {
    return $(selector).get().indexOf(this[0]);
  }
  return this.get().indexOf($(selector)[0]);
};

// node_modules/@mdui/jq/methods/last.js
$.fn.last = function() {
  return this.eq(-1);
};

// node_modules/@mdui/jq/methods/next.js
eachArray(["", "All", "Until"], (name, nameIndex) => {
  $.fn[`next${name}`] = function(selector, filter) {
    return dir(this, nameIndex, "nextElementSibling", selector, filter);
  };
});

// node_modules/@mdui/jq/methods/not.js
$.fn.not = function(selector) {
  const $excludes = this.filter(selector);
  return this.map((_, element) => {
    return $excludes.index(element) > -1 ? void 0 : element;
  });
};

// node_modules/@mdui/jq/shared/event.js
var CustomEvent3 = getWindow().CustomEvent;
var MduiCustomEvent = class extends CustomEvent3 {
  constructor(type, options) {
    super(type, options);
    this.data = options.data;
    this.namespace = options.namespace;
  }
};
var elementIdMap = /* @__PURE__ */ new WeakMap();
var elementId = 1;
var getElementId = (element) => {
  if (!elementIdMap.has(element)) {
    elementIdMap.set(element, ++elementId);
  }
  return elementIdMap.get(element);
};
var handlersMap = /* @__PURE__ */ new Map();
var getHandlers = (element) => {
  const id2 = getElementId(element);
  return handlersMap.get(id2) || handlersMap.set(id2, []).get(id2);
};
var parse = (type) => {
  const parts = type.split(".");
  return {
    type: parts[0],
    namespace: parts.slice(1).sort().join(" ")
  };
};
var matcherFor = (namespace) => {
  return new RegExp("(?:^| )" + namespace.replace(" ", " .* ?") + "(?: |$)");
};
var getMatchedHandlers = (element, type, func, selector) => {
  const event = parse(type);
  return getHandlers(element).filter((handler) => {
    return handler && (!event.type || handler.type === event.type) && (!event.namespace || matcherFor(event.namespace).test(handler.namespace)) && (!func || getElementId(handler.func) === getElementId(func)) && (!selector || handler.selector === selector);
  });
};
var add = (element, types, func, data2, selector) => {
  let useCapture = false;
  if (isObjectLike(data2) && data2.useCapture) {
    useCapture = true;
  }
  types.split(" ").forEach((type) => {
    if (!type) {
      return;
    }
    const event = parse(type);
    const callFn = (e, elem) => {
      const result = func.apply(
        elem,
        // @ts-ignore
        e.detail === null ? [e] : [e].concat(e.detail)
      );
      if (result === false) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const proxyFn = (e) => {
      if (e.namespace && !matcherFor(e.namespace).test(event.namespace)) {
        return;
      }
      e.data = data2;
      if (selector) {
        $(element).find(selector).get().reverse().forEach((elem) => {
          if (elem === e.target || contains(elem, e.target)) {
            callFn(e, elem);
          }
        });
      } else {
        callFn(e, element);
      }
    };
    const handler = {
      type: event.type,
      namespace: event.namespace,
      func,
      selector,
      id: getHandlers(element).length,
      proxy: proxyFn
    };
    getHandlers(element).push(handler);
    element.addEventListener(handler.type, proxyFn, useCapture);
  });
};
var remove = (element, types, func, selector) => {
  const handlersInElement = getHandlers(element);
  const removeEvent = (handler) => {
    delete handlersInElement[handler.id];
    element.removeEventListener(handler.type, handler.proxy, false);
  };
  if (!types) {
    handlersInElement.forEach((handler) => {
      removeEvent(handler);
    });
  } else {
    types.split(" ").forEach((type) => {
      if (type) {
        getMatchedHandlers(element, type, func, selector).forEach((handler) => {
          removeEvent(handler);
        });
      }
    });
  }
};

// node_modules/@mdui/jq/methods/off.js
$.fn.off = function(types, selector, callback) {
  if (isObjectLike(types)) {
    eachObject(types, (type, fn) => {
      this.off(type, selector, fn);
    });
    return this;
  }
  if (selector === false || isFunction(selector)) {
    callback = selector;
    selector = void 0;
  }
  if (callback === false) {
    callback = returnFalse;
  }
  return this.each(function() {
    remove(this, types, callback, selector);
  });
};

// node_modules/@mdui/jq/functions/extend.js
function extend2(target, ...objectN) {
  eachArray(objectN, (object) => {
    eachObject(object, (prop, value) => {
      if (!isUndefined(value)) {
        target[prop] = value;
      }
    });
  });
  return target;
}

// node_modules/@mdui/jq/methods/offsetParent.js
$.fn.offsetParent = function() {
  const document3 = getDocument();
  return this.map(function() {
    let offsetParent = this.offsetParent;
    while (offsetParent && $(offsetParent).css("position") === "static") {
      offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || document3.documentElement;
  });
};

// node_modules/@mdui/jq/methods/position.js
var floatStyle = ($element, name) => {
  return parseFloat($element.css(name));
};
$.fn.position = function() {
  if (!this.length) {
    return void 0;
  }
  const $element = this.eq(0);
  let currentOffset;
  let parentOffset = {
    left: 0,
    top: 0
  };
  if ($element.css("position") === "fixed") {
    currentOffset = $element[0].getBoundingClientRect();
  } else {
    currentOffset = $element.offset();
    const $offsetParent = $element.offsetParent();
    parentOffset = $offsetParent.offset();
    parentOffset.top += floatStyle($offsetParent, "border-top-width");
    parentOffset.left += floatStyle($offsetParent, "border-left-width");
  }
  return {
    top: currentOffset.top - parentOffset.top - floatStyle($element, "margin-top"),
    left: currentOffset.left - parentOffset.left - floatStyle($element, "margin-left")
  };
};

// node_modules/@mdui/jq/methods/offset.js
var get3 = (element) => {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  const { top, left } = element.getBoundingClientRect();
  const { pageYOffset, pageXOffset } = element.ownerDocument.defaultView;
  return {
    top: top + pageYOffset,
    left: left + pageXOffset
  };
};
var set3 = (element, value, index) => {
  const $element = $(element);
  const position = $element.css("position");
  if (position === "static") {
    $element.css("position", "relative");
  }
  const currentOffset = get3(element);
  const currentTopString = $element.css("top");
  const currentLeftString = $element.css("left");
  let currentTop;
  let currentLeft;
  const calculatePosition = (position === "absolute" || position === "fixed") && (currentTopString + currentLeftString).includes("auto");
  if (calculatePosition) {
    const currentPosition = $element.position();
    currentTop = currentPosition.top;
    currentLeft = currentPosition.left;
  } else {
    currentTop = parseFloat(currentTopString);
    currentLeft = parseFloat(currentLeftString);
  }
  const computedValue = isFunction(value) ? value.call(element, index, extend2({}, currentOffset)) : value;
  $element.css({
    top: computedValue.top != null ? computedValue.top - currentOffset.top + currentTop : void 0,
    left: computedValue.left != null ? computedValue.left - currentOffset.left + currentLeft : void 0
  });
};
$.fn.offset = function(value) {
  if (!arguments.length) {
    if (!this.length) {
      return void 0;
    }
    return get3(this[0]);
  }
  return this.each(function(index) {
    set3(this, value, index);
  });
};

// node_modules/@mdui/jq/methods/on.js
$.fn.on = function(types, selector, data2, callback, one) {
  if (isObjectLike(types)) {
    if (!isString(selector)) {
      data2 = data2 || selector;
      selector = void 0;
    }
    eachObject(types, (type, fn) => {
      this.on(type, selector, data2, fn, one);
    });
    return this;
  }
  if (data2 == null && callback == null) {
    callback = selector;
    data2 = selector = void 0;
  } else if (callback == null) {
    if (isString(selector)) {
      callback = data2;
      data2 = void 0;
    } else {
      callback = data2;
      data2 = selector;
      selector = void 0;
    }
  }
  if (callback === false) {
    callback = returnFalse;
  } else if (!callback) {
    return this;
  }
  if (one) {
    const _this = this;
    const origCallback = callback;
    callback = function(event, ...dataN) {
      _this.off(event.type, selector, callback);
      return origCallback.call(this, event, ...dataN);
    };
  }
  return this.each(function() {
    add(this, types, callback, data2, selector);
  });
};

// node_modules/@mdui/jq/methods/one.js
$.fn.one = function(types, selector, data2, callback) {
  return this.on(types, selector, data2, callback, true);
};

// node_modules/@mdui/jq/methods/prev.js
eachArray(["", "All", "Until"], (name, nameIndex) => {
  $.fn[`prev${name}`] = function(selector, filter) {
    const $nodes = !nameIndex ? this : $(this.get().reverse());
    return dir($nodes, nameIndex, "previousElementSibling", selector, filter);
  };
});

// node_modules/@mdui/jq/methods/removeAttr.js
$.fn.removeAttr = function(attributeName) {
  const names = attributeName.split(" ").filter((name) => name);
  return this.each(function() {
    eachArray(names, (name) => {
      removeAttribute(this, name);
    });
  });
};

// node_modules/@mdui/jq/functions/removeData.js
var removeData = (element, name) => {
  if (isUndefined(name)) {
    return removeAll(element);
  }
  const keys = isString(name) ? name.split(" ").filter((nameItem) => nameItem) : name;
  removeMultiple(element, keys);
};

// node_modules/@mdui/jq/methods/removeData.js
$.fn.removeData = function(name) {
  return this.each((_, element) => {
    removeData(element, name);
  });
};

// node_modules/@mdui/jq/methods/removeProp.js
$.fn.removeProp = function(name) {
  return this.each((_, element) => {
    try {
      delete element[name];
    } catch (_err) {
    }
  });
};

// node_modules/@mdui/jq/methods/replaceWith.js
$.fn.replaceWith = function(newContent) {
  this.each((index, element) => {
    let content = newContent;
    if (isFunction(content)) {
      content = content.call(element, index, element.innerHTML);
    } else if (index && !isString(content)) {
      content = $(content).clone();
    }
    $(element).before(content);
  });
  return this.remove();
};

// node_modules/@mdui/jq/methods/replaceAll.js
$.fn.replaceAll = function(target) {
  return $(target).map((index, element) => {
    $(element).replaceWith(index ? this.clone() : this);
    return this.get();
  });
};

// node_modules/@mdui/jq/functions/param.js
var param = (obj) => {
  if (!isObjectLike(obj) && !Array.isArray(obj)) {
    return "";
  }
  const args = [];
  const destructure = (key, value) => {
    let keyTmp;
    if (isObjectLike(value)) {
      eachObject(value, (i, v) => {
        keyTmp = Array.isArray(value) && !isObjectLike(v) ? "" : i;
        destructure(`${key}[${keyTmp}]`, v);
      });
    } else {
      keyTmp = value == null || value === "" ? "=" : `=${encodeURIComponent(value)}`;
      args.push(encodeURIComponent(key) + keyTmp);
    }
  };
  if (Array.isArray(obj)) {
    eachArray(obj, ({ name, value }) => {
      return destructure(name, value);
    });
  } else {
    eachObject(obj, destructure);
  }
  return args.join("&");
};

// node_modules/@mdui/jq/shared/form.js
var formCollections = /* @__PURE__ */ new WeakMap();
var getFormControls = (form) => {
  const nativeFormControls = [...form.elements];
  const formControls = formCollections.get(form) || [];
  const comparePosition = (a, b) => {
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  };
  return [...nativeFormControls, ...formControls].sort(comparePosition);
};

// node_modules/@mdui/jq/methods/serializeArray.js
var getFormControlsValue = ($elements) => {
  const result = [];
  $elements.each((_, element) => {
    const elements = element instanceof HTMLFormElement ? getFormControls(element) : [element];
    $(elements).each((_2, element2) => {
      const $element = $(element2);
      const type = element2.type;
      const nodeName = element2.nodeName.toLowerCase();
      if (nodeName !== "fieldset" && element2.name && !element2.disabled && [
        "input",
        "select",
        "textarea",
        "keygen",
        "mdui-checkbox",
        "mdui-radio-group",
        "mdui-switch",
        "mdui-text-field",
        "mdui-select",
        "mdui-slider",
        "mdui-range-slider",
        "mdui-segmented-button-group"
      ].includes(nodeName) && !["submit", "button", "image", "reset", "file"].includes(type) && (!["radio", "checkbox"].includes(type) || element2.checked) && (!["mdui-checkbox", "mdui-switch"].includes(nodeName) || element2.checked)) {
        result.push({
          name: element2.name,
          value: $element.val()
        });
      }
    });
  });
  return result;
};
$.fn.serializeArray = function() {
  return getFormControlsValue(this).map((element) => {
    if (!Array.isArray(element.value)) {
      return element;
    }
    return element.value.map((value) => ({
      name: element.name,
      value
    }));
  }).flat();
};

// node_modules/@mdui/jq/methods/serialize.js
$.fn.serialize = function() {
  return param(this.serializeArray());
};

// node_modules/@mdui/jq/methods/serializeObject.js
$.fn.serializeObject = function() {
  const result = {};
  getFormControlsValue(this).forEach((element) => {
    const { name, value } = element;
    if (!Object.prototype.hasOwnProperty.call(result, name)) {
      result[name] = value;
    } else {
      const originalValue = result[name];
      if (!Array.isArray(originalValue)) {
        result[name] = [originalValue];
      }
      if (Array.isArray(value)) {
        result[name].push(...value);
      } else {
        result[name].push(value);
      }
    }
  });
  return result;
};

// node_modules/@mdui/jq/methods/show.js
var elementDisplay = {};
var defaultDisplay = (nodeName) => {
  const document3 = getDocument();
  let element;
  let display;
  if (!elementDisplay[nodeName]) {
    element = createElement(nodeName);
    appendChild(document3.body, element);
    display = getStyle(element, "display");
    removeChild(element);
    if (display === "none") {
      display = "block";
    }
    elementDisplay[nodeName] = display;
  }
  return elementDisplay[nodeName];
};
$.fn.show = function() {
  return this.each((_, element) => {
    if (element.style.display === "none") {
      element.style.display = "";
    }
    if (getStyle(element, "display") === "none") {
      element.style.display = defaultDisplay(element.nodeName);
    }
  });
};

// node_modules/@mdui/jq/methods/siblings.js
$.fn.siblings = function(selector) {
  return this.prevAll(selector).add(this.nextAll(selector));
};

// node_modules/@mdui/jq/methods/toggle.js
$.fn.toggle = function() {
  return this.each((_, element) => {
    if (getStyle(element, "display") === "none") {
      $(element).show();
    } else {
      $(element).hide();
    }
  });
};

// node_modules/@mdui/jq/methods/trigger.js
$.fn.trigger = function(name, detail = null, options) {
  const { type, namespace } = parse(name);
  const event = new MduiCustomEvent(type, {
    detail,
    data: null,
    namespace,
    bubbles: true,
    cancelable: false,
    composed: true,
    ...options
  });
  return this.each((_, element) => {
    element.dispatchEvent(event);
  });
};

// node_modules/@mdui/jq/shared/ajax.js
var ajaxStart = "ajaxStart";
var ajaxSuccess = "ajaxSuccess";
var ajaxError = "ajaxError";
var ajaxComplete = "ajaxComplete";
var globalOptions = {};
var isQueryStringData = (method) => {
  return ["GET", "HEAD"].includes(method);
};
var appendQuery = (url, query) => {
  return `${url}&${query}`.replace(/[&?]{1,2}/, "?");
};
var isCrossDomain = (url) => {
  const window2 = getWindow();
  return /^([\w-]+:)?\/\/([^/]+)/.test(url) && RegExp.$2 !== window2.location.host;
};
var isHttpStatusSuccess = (status) => {
  return status >= 200 && status < 300 || [0, 304].includes(status);
};
var mergeOptions = (options) => {
  const defaults = {
    url: "",
    method: "GET",
    data: "",
    processData: true,
    async: true,
    cache: true,
    username: "",
    password: "",
    headers: {},
    xhrFields: {},
    statusCode: {},
    dataType: "",
    contentType: "application/x-www-form-urlencoded",
    timeout: 0,
    global: true
  };
  eachObject(globalOptions, (key, value) => {
    const callbacks = [
      "beforeSend",
      "success",
      "error",
      "complete",
      "statusCode"
    ];
    if (!callbacks.includes(key) && !isUndefined(value)) {
      defaults[key] = value;
    }
  });
  return extend2({}, defaults, options);
};

// node_modules/@mdui/jq/functions/ajax.js
var ajax = (options) => {
  const document3 = getDocument();
  const window2 = getWindow();
  let isCanceled = false;
  const eventParams = {};
  const successEventParams = {};
  const mergedOptions = mergeOptions(options);
  const method = mergedOptions.method.toUpperCase();
  let { data: data2, url } = mergedOptions;
  url = url || window2.location.toString();
  const { processData, async, cache, username, password, headers, xhrFields, statusCode, dataType, contentType, timeout, global: global5 } = mergedOptions;
  const isMethodQueryString = isQueryStringData(method);
  if (data2 && (isMethodQueryString || processData) && !isString(data2) && !(data2 instanceof ArrayBuffer) && !(data2 instanceof Blob) && !(data2 instanceof Document) && !(data2 instanceof FormData)) {
    data2 = param(data2);
  }
  if (data2 && isMethodQueryString) {
    url = appendQuery(url, data2);
    data2 = null;
  }
  const trigger = (event, callback, ...args) => {
    if (global5) {
      $(document3).trigger(event, callback === "success" ? successEventParams : eventParams);
    }
    let resultGlobal;
    let resultCustom;
    if (callback in globalOptions) {
      resultGlobal = globalOptions[callback](...args);
    }
    if (mergedOptions[callback]) {
      resultCustom = mergedOptions[callback](...args);
    }
    if (callback === "beforeSend" && [resultGlobal, resultCustom].includes(false)) {
      isCanceled = true;
    }
  };
  const XHR = () => {
    let textStatus;
    return new Promise((resolve, reject) => {
      const doReject = (reason) => {
        return reject(new Error(reason));
      };
      if (isMethodQueryString && !cache) {
        url = appendQuery(url, `_=${Date.now()}`);
      }
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, async, username, password);
      if (contentType || data2 && !isMethodQueryString && contentType !== false) {
        xhr.setRequestHeader("Content-Type", contentType);
      }
      if (dataType === "json") {
        xhr.setRequestHeader("Accept", "application/json, text/javascript");
      }
      eachObject(headers, (key, value) => {
        if (!isUndefined(value)) {
          xhr.setRequestHeader(key, value + "");
        }
      });
      if (!isCrossDomain(url)) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }
      eachObject(xhrFields, (key, value) => {
        xhr[key] = value;
      });
      eventParams.xhr = successEventParams.xhr = xhr;
      eventParams.options = successEventParams.options = mergedOptions;
      let xhrTimeout;
      xhr.onload = () => {
        if (xhrTimeout) {
          clearTimeout(xhrTimeout);
        }
        const isSuccess = isHttpStatusSuccess(xhr.status);
        let responseData = void 0;
        if (isSuccess) {
          textStatus = xhr.status === 204 || method === "HEAD" ? "nocontent" : xhr.status === 304 ? "notmodified" : "success";
          if (dataType === "json" || !dataType && (xhr.getResponseHeader("content-type") || "").includes("json")) {
            try {
              responseData = method === "HEAD" ? void 0 : JSON.parse(xhr.responseText);
              successEventParams.response = responseData;
            } catch (_err) {
              textStatus = "parsererror";
              trigger(ajaxError, "error", xhr, textStatus);
              doReject(textStatus);
            }
            if (textStatus !== "parsererror") {
              trigger(ajaxSuccess, "success", responseData, textStatus, xhr);
              resolve(responseData);
            }
          } else {
            responseData = method === "HEAD" ? void 0 : xhr.responseType === "text" || xhr.responseType === "" ? xhr.responseText : xhr.response;
            successEventParams.response = responseData;
            trigger(ajaxSuccess, "success", responseData, textStatus, xhr);
            resolve(responseData);
          }
        } else {
          textStatus = "error";
          trigger(ajaxError, "error", xhr, textStatus);
          doReject(textStatus);
        }
        eachArray([globalOptions.statusCode ?? {}, statusCode], (func) => {
          if (func[xhr.status]) {
            if (isSuccess) {
              func[xhr.status](responseData, textStatus, xhr);
            } else {
              func[xhr.status](xhr, textStatus);
            }
          }
        });
        trigger(ajaxComplete, "complete", xhr, textStatus);
      };
      xhr.onerror = () => {
        if (xhrTimeout) {
          clearTimeout(xhrTimeout);
        }
        trigger(ajaxError, "error", xhr, xhr.statusText);
        trigger(ajaxComplete, "complete", xhr, "error");
        doReject(xhr.statusText);
      };
      xhr.onabort = () => {
        let statusText = "abort";
        if (xhrTimeout) {
          statusText = "timeout";
          clearTimeout(xhrTimeout);
        }
        trigger(ajaxError, "error", xhr, statusText);
        trigger(ajaxComplete, "complete", xhr, statusText);
        doReject(statusText);
      };
      trigger(ajaxStart, "beforeSend", xhr, mergedOptions);
      if (isCanceled) {
        return doReject("cancel");
      }
      if (timeout > 0) {
        xhrTimeout = window2.setTimeout(() => xhr.abort(), timeout);
      }
      xhr.send(data2);
    });
  };
  return XHR();
};

// node_modules/@mdui/jq/static/ajax.js
$.ajax = ajax;

// node_modules/@mdui/jq/functions/ajaxSetup.js
var ajaxSetup = (options) => {
  return extend2(globalOptions, options);
};

// node_modules/@mdui/jq/static/ajaxSetup.js
$.ajaxSetup = ajaxSetup;

// node_modules/@mdui/jq/static/contains.js
$.contains = contains;

// node_modules/@mdui/jq/functions/data.js
function data(element, key, value) {
  if (isObjectLike(key)) {
    setAll(element, key);
    return key;
  }
  if (!isUndefined(value)) {
    set(element, key, value);
    return value;
  }
  if (isUndefined(key)) {
    return getAll(element);
  }
  return get(element, key);
}

// node_modules/@mdui/jq/static/data.js
$.data = data;

// node_modules/@mdui/jq/static/each.js
$.each = each;

// node_modules/@mdui/jq/static/extend.js
$.extend = function(target, ...objectN) {
  if (!objectN.length) {
    eachObject(target, (prop, value) => {
      this[prop] = value;
    });
    return this;
  }
  return extend2(target, ...objectN);
};

// node_modules/@mdui/jq/static/map.js
$.map = map;

// node_modules/@mdui/jq/static/merge.js
$.merge = merge;

// node_modules/@mdui/jq/static/param.js
$.param = param;

// node_modules/@mdui/jq/static/removeData.js
$.removeData = removeData;

// node_modules/@mdui/jq/static/unique.js
$.unique = unique;

// node_modules/tslib/tslib.es6.mjs
function __decorate(decorators, target, key, desc2) {
  var c = arguments.length, r = c < 3 ? target : desc2 === null ? desc2 = Object.getOwnPropertyDescriptor(target, key) : desc2, d2;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc2);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d2 = decorators[i]) r = (c < 3 ? d2(r) : c > 3 ? d2(target, key, r) : d2(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

// node_modules/@lit/reactive-element/development/css-tag.js
var NODE_MODE = false;
var global = globalThis;
var supportsAdoptingStyleSheets = global.ShadowRoot && (global.ShadyCSS === void 0 || global.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var constructionToken = Symbol();
var cssTagCache = /* @__PURE__ */ new WeakMap();
var CSSResult = class {
  constructor(cssText, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    }
    this.cssText = cssText;
    this._strings = strings;
  }
  // This is a getter so that it's lazy. In practice, this means stylesheets
  // are not created until the first element instance is made.
  get styleSheet() {
    let styleSheet = this._styleSheet;
    const strings = this._strings;
    if (supportsAdoptingStyleSheets && styleSheet === void 0) {
      const cacheable = strings !== void 0 && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === void 0) {
        (this._styleSheet = styleSheet = new CSSStyleSheet()).replaceSync(this.cssText);
        if (cacheable) {
          cssTagCache.set(strings, styleSheet);
        }
      }
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
};
var textFromCSSResult = (value) => {
  if (value["_$cssResult$"] === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`);
  }
};
var unsafeCSS = (value) => new CSSResult(typeof value === "string" ? value : String(value), void 0, constructionToken);
var css = (strings, ...values) => {
  const cssText = strings.length === 1 ? strings[0] : values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
  return new CSSResult(cssText, strings, constructionToken);
};
var adoptStyles = (renderRoot, styles) => {
  if (supportsAdoptingStyleSheets) {
    renderRoot.adoptedStyleSheets = styles.map((s2) => s2 instanceof CSSStyleSheet ? s2 : s2.styleSheet);
  } else {
    for (const s2 of styles) {
      const style25 = document.createElement("style");
      const nonce = global["litNonce"];
      if (nonce !== void 0) {
        style25.setAttribute("nonce", nonce);
      }
      style25.textContent = s2.cssText;
      renderRoot.appendChild(style25);
    }
  }
};
var cssResultFromStyleSheet = (sheet) => {
  let cssText = "";
  for (const rule of sheet.cssRules) {
    cssText += rule.cssText;
  }
  return unsafeCSS(cssText);
};
var getCompatibleStyle = supportsAdoptingStyleSheets || NODE_MODE && global.CSSStyleSheet === void 0 ? (s2) => s2 : (s2) => s2 instanceof CSSStyleSheet ? cssResultFromStyleSheet(s2) : s2;

// node_modules/@lit/reactive-element/development/reactive-element.js
var { is, defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols, getPrototypeOf } = Object;
var NODE_MODE2 = false;
var global2 = globalThis;
if (NODE_MODE2) {
  global2.customElements ??= customElements;
}
var DEV_MODE = true;
var issueWarning;
var trustedTypes = global2.trustedTypes;
var emptyStringForBooleanAttribute = trustedTypes ? trustedTypes.emptyScript : "";
var polyfillSupport = DEV_MODE ? global2.reactiveElementPolyfillSupportDevMode : global2.reactiveElementPolyfillSupport;
if (DEV_MODE) {
  global2.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!global2.litIssuedWarnings.has(warning) && !global2.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global2.litIssuedWarnings.add(warning);
    }
  };
  queueMicrotask(() => {
    issueWarning("dev-mode", `Lit is in dev mode. Not recommended for production!`);
    if (global2.ShadyDOM?.inUse && polyfillSupport === void 0) {
      issueWarning("polyfill-support-missing", `Shadow DOM is being polyfilled via \`ShadyDOM\` but the \`polyfill-support\` module has not been loaded.`);
    }
  });
}
var debugLogEvent = DEV_MODE ? (event) => {
  const shouldEmit = global2.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global2.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : void 0;
var JSCompiler_renameProperty = (prop, _obj) => prop;
var defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        value = value ? emptyStringForBooleanAttribute : null;
        break;
      case Object:
      case Array:
        value = value == null ? value : JSON.stringify(value);
        break;
    }
    return value;
  },
  fromAttribute(value, type) {
    let fromValue = value;
    switch (type) {
      case Boolean:
        fromValue = value !== null;
        break;
      case Number:
        fromValue = value === null ? null : Number(value);
        break;
      case Object:
      case Array:
        try {
          fromValue = JSON.parse(value);
        } catch (e) {
          fromValue = null;
        }
        break;
    }
    return fromValue;
  }
};
var notEqual = (value, old) => !is(value, old);
var defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  useDefault: false,
  hasChanged: notEqual
};
Symbol.metadata ??= Symbol("metadata");
global2.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var ReactiveElement = class extends HTMLElement {
  /**
   * Adds an initializer function to the class that is called during instance
   * construction.
   *
   * This is useful for code that runs against a `ReactiveElement`
   * subclass, such as a decorator, that needs to do work for each
   * instance, such as setting up a `ReactiveController`.
   *
   * ```ts
   * const myDecorator = (target: typeof ReactiveElement, key: string) => {
   *   target.addInitializer((instance: ReactiveElement) => {
   *     // This is run during construction of the element
   *     new MyController(instance);
   *   });
   * }
   * ```
   *
   * Decorating a field will then cause each instance to run an initializer
   * that adds a controller:
   *
   * ```ts
   * class MyElement extends LitElement {
   *   @myDecorator foo;
   * }
   * ```
   *
   * Initializers are stored per-constructor. Adding an initializer to a
   * subclass does not add it to a superclass. Since initializers are run in
   * constructors, initializers will run in order of the class hierarchy,
   * starting with superclasses and progressing to the instance's class.
   *
   * @nocollapse
   */
  static addInitializer(initializer) {
    this.__prepare();
    (this._initializers ??= []).push(initializer);
  }
  /**
   * Returns a list of attributes corresponding to the registered properties.
   * @nocollapse
   * @category attributes
   */
  static get observedAttributes() {
    this.finalize();
    return this.__attributeToPropertyMap && [...this.__attributeToPropertyMap.keys()];
  }
  /**
   * Creates a property accessor on the element prototype if one does not exist
   * and stores a {@linkcode PropertyDeclaration} for the property with the
   * given options. The property setter calls the property's `hasChanged`
   * property option or uses a strict identity check to determine whether or not
   * to request an update.
   *
   * This method may be overridden to customize properties; however,
   * when doing so, it's important to call `super.createProperty` to ensure
   * the property is setup correctly. This method calls
   * `getPropertyDescriptor` internally to get a descriptor to install.
   * To customize what properties do when they are get or set, override
   * `getPropertyDescriptor`. To customize the options for a property,
   * implement `createProperty` like this:
   *
   * ```ts
   * static createProperty(name, options) {
   *   options = Object.assign(options, {myOption: true});
   *   super.createProperty(name, options);
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   */
  static createProperty(name, options = defaultPropertyDeclaration) {
    if (options.state) {
      options.attribute = false;
    }
    this.__prepare();
    if (this.prototype.hasOwnProperty(name)) {
      options = Object.create(options);
      options.wrapped = true;
    }
    this.elementProperties.set(name, options);
    if (!options.noAccessor) {
      const key = DEV_MODE ? (
        // Use Symbol.for in dev mode to make it easier to maintain state
        // when doing HMR.
        Symbol.for(`${String(name)} (@property() cache)`)
      ) : Symbol();
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== void 0) {
        defineProperty(this.prototype, name, descriptor);
      }
    }
  }
  /**
   * Returns a property descriptor to be defined on the given named property.
   * If no descriptor is returned, the property will not become an accessor.
   * For example,
   *
   * ```ts
   * class MyElement extends LitElement {
   *   static getPropertyDescriptor(name, key, options) {
   *     const defaultDescriptor =
   *         super.getPropertyDescriptor(name, key, options);
   *     const setter = defaultDescriptor.set;
   *     return {
   *       get: defaultDescriptor.get,
   *       set(value) {
   *         setter.call(this, value);
   *         // custom action.
   *       },
   *       configurable: true,
   *       enumerable: true
   *     }
   *   }
   * }
   * ```
   *
   * @nocollapse
   * @category properties
   */
  static getPropertyDescriptor(name, key, options) {
    const { get: get4, set: set4 } = getOwnPropertyDescriptor(this.prototype, name) ?? {
      get() {
        return this[key];
      },
      set(v) {
        this[key] = v;
      }
    };
    if (DEV_MODE && get4 == null) {
      if ("value" in (getOwnPropertyDescriptor(this.prototype, name) ?? {})) {
        throw new Error(`Field ${JSON.stringify(String(name))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);
      }
      issueWarning("reactive-property-without-getter", `Field ${JSON.stringify(String(name))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`);
    }
    return {
      get: get4,
      set(value) {
        const oldValue = get4?.call(this);
        set4?.call(this, value);
        this.requestUpdate(name, oldValue, options);
      },
      configurable: true,
      enumerable: true
    };
  }
  /**
   * Returns the property options associated with the given property.
   * These options are defined with a `PropertyDeclaration` via the `properties`
   * object or the `@property` decorator and are registered in
   * `createProperty(...)`.
   *
   * Note, this method should be considered "final" and not overridden. To
   * customize the options for a given property, override
   * {@linkcode createProperty}.
   *
   * @nocollapse
   * @final
   * @category properties
   */
  static getPropertyOptions(name) {
    return this.elementProperties.get(name) ?? defaultPropertyDeclaration;
  }
  /**
   * Initializes static own properties of the class used in bookkeeping
   * for element properties, initializers, etc.
   *
   * Can be called multiple times by code that needs to ensure these
   * properties exist before using them.
   *
   * This method ensures the superclass is finalized so that inherited
   * property metadata can be copied down.
   * @nocollapse
   */
  static __prepare() {
    if (this.hasOwnProperty(JSCompiler_renameProperty("elementProperties", this))) {
      return;
    }
    const superCtor = getPrototypeOf(this);
    superCtor.finalize();
    if (superCtor._initializers !== void 0) {
      this._initializers = [...superCtor._initializers];
    }
    this.elementProperties = new Map(superCtor.elementProperties);
  }
  /**
   * Finishes setting up the class so that it's ready to be registered
   * as a custom element and instantiated.
   *
   * This method is called by the ReactiveElement.observedAttributes getter.
   * If you override the observedAttributes getter, you must either call
   * super.observedAttributes to trigger finalization, or call finalize()
   * yourself.
   *
   * @nocollapse
   */
  static finalize() {
    if (this.hasOwnProperty(JSCompiler_renameProperty("finalized", this))) {
      return;
    }
    this.finalized = true;
    this.__prepare();
    if (this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const props = this.properties;
      const propKeys = [
        ...getOwnPropertyNames(props),
        ...getOwnPropertySymbols(props)
      ];
      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }
    const metadata = this[Symbol.metadata];
    if (metadata !== null) {
      const properties = litPropertyMetadata.get(metadata);
      if (properties !== void 0) {
        for (const [p, options] of properties) {
          this.elementProperties.set(p, options);
        }
      }
    }
    this.__attributeToPropertyMap = /* @__PURE__ */ new Map();
    for (const [p, options] of this.elementProperties) {
      const attr = this.__attributeNameForProperty(p, options);
      if (attr !== void 0) {
        this.__attributeToPropertyMap.set(attr, p);
      }
    }
    this.elementStyles = this.finalizeStyles(this.styles);
    if (DEV_MODE) {
      if (this.hasOwnProperty("createProperty")) {
        issueWarning("no-override-create-property", "Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");
      }
      if (this.hasOwnProperty("getPropertyDescriptor")) {
        issueWarning("no-override-get-property-descriptor", "Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators");
      }
    }
  }
  /**
   * Takes the styles the user supplied via the `static styles` property and
   * returns the array of styles to apply to the element.
   * Override this method to integrate into a style management system.
   *
   * Styles are deduplicated preserving the _last_ instance in the list. This
   * is a performance optimization to avoid duplicated styles that can occur
   * especially when composing via subclassing. The last item is kept to try
   * to preserve the cascade order with the assumption that it's most important
   * that last added styles override previous styles.
   *
   * @nocollapse
   * @category styles
   */
  static finalizeStyles(styles) {
    const elementStyles = [];
    if (Array.isArray(styles)) {
      const set4 = new Set(styles.flat(Infinity).reverse());
      for (const s2 of set4) {
        elementStyles.unshift(getCompatibleStyle(s2));
      }
    } else if (styles !== void 0) {
      elementStyles.push(getCompatibleStyle(styles));
    }
    return elementStyles;
  }
  /**
   * Returns the property name for the given attribute `name`.
   * @nocollapse
   */
  static __attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false ? void 0 : typeof attribute === "string" ? attribute : typeof name === "string" ? name.toLowerCase() : void 0;
  }
  constructor() {
    super();
    this.__instanceProperties = void 0;
    this.isUpdatePending = false;
    this.hasUpdated = false;
    this.__reflectingProperty = null;
    this.__initialize();
  }
  /**
   * Internal only override point for customizing work done when elements
   * are constructed.
   */
  __initialize() {
    this.__updatePromise = new Promise((res) => this.enableUpdating = res);
    this._$changedProperties = /* @__PURE__ */ new Map();
    this.__saveInstanceProperties();
    this.requestUpdate();
    this.constructor._initializers?.forEach((i) => i(this));
  }
  /**
   * Registers a `ReactiveController` to participate in the element's reactive
   * update cycle. The element automatically calls into any registered
   * controllers during its lifecycle callbacks.
   *
   * If the element is connected when `addController()` is called, the
   * controller's `hostConnected()` callback will be immediately called.
   * @category controllers
   */
  addController(controller) {
    (this.__controllers ??= /* @__PURE__ */ new Set()).add(controller);
    if (this.renderRoot !== void 0 && this.isConnected) {
      controller.hostConnected?.();
    }
  }
  /**
   * Removes a `ReactiveController` from the element.
   * @category controllers
   */
  removeController(controller) {
    this.__controllers?.delete(controller);
  }
  /**
   * Fixes any properties set on the instance before upgrade time.
   * Otherwise these would shadow the accessor and break these properties.
   * The properties are stored in a Map which is played back after the
   * constructor runs.
   */
  __saveInstanceProperties() {
    const instanceProperties = /* @__PURE__ */ new Map();
    const elementProperties = this.constructor.elementProperties;
    for (const p of elementProperties.keys()) {
      if (this.hasOwnProperty(p)) {
        instanceProperties.set(p, this[p]);
        delete this[p];
      }
    }
    if (instanceProperties.size > 0) {
      this.__instanceProperties = instanceProperties;
    }
  }
  /**
   * Returns the node into which the element should render and by default
   * creates and returns an open shadowRoot. Implement to customize where the
   * element's DOM is rendered. For example, to render into the element's
   * childNodes, return `this`.
   *
   * @return Returns a node into which to render.
   * @category rendering
   */
  createRenderRoot() {
    const renderRoot = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    adoptStyles(renderRoot, this.constructor.elementStyles);
    return renderRoot;
  }
  /**
   * On first connection, creates the element's renderRoot, sets up
   * element styling, and enables updating.
   * @category lifecycle
   */
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot();
    this.enableUpdating(true);
    this.__controllers?.forEach((c) => c.hostConnected?.());
  }
  /**
   * Note, this method should be considered final and not overridden. It is
   * overridden on the element instance with a function that triggers the first
   * update.
   * @category updates
   */
  enableUpdating(_requestedUpdate) {
  }
  /**
   * Allows for `super.disconnectedCallback()` in extensions while
   * reserving the possibility of making non-breaking feature additions
   * when disconnecting at some point in the future.
   * @category lifecycle
   */
  disconnectedCallback() {
    this.__controllers?.forEach((c) => c.hostDisconnected?.());
  }
  /**
   * Synchronizes property values when attributes change.
   *
   * Specifically, when an attribute is set, the corresponding property is set.
   * You should rarely need to implement this callback. If this method is
   * overridden, `super.attributeChangedCallback(name, _old, value)` must be
   * called.
   *
   * See [responding to attribute changes](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   * on MDN for more information about the `attributeChangedCallback`.
   * @category attributes
   */
  attributeChangedCallback(name, _old, value) {
    this._$attributeToProperty(name, value);
  }
  __propertyToAttribute(name, value) {
    const elemProperties = this.constructor.elementProperties;
    const options = elemProperties.get(name);
    const attr = this.constructor.__attributeNameForProperty(name, options);
    if (attr !== void 0 && options.reflect === true) {
      const converter = options.converter?.toAttribute !== void 0 ? options.converter : defaultConverter;
      const attrValue = converter.toAttribute(value, options.type);
      if (DEV_MODE && this.constructor.enabledWarnings.includes("migration") && attrValue === void 0) {
        issueWarning("undefined-attribute-value", `The attribute value for the ${name} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);
      }
      this.__reflectingProperty = name;
      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      }
      this.__reflectingProperty = null;
    }
  }
  /** @internal */
  _$attributeToProperty(name, value) {
    const ctor = this.constructor;
    const propName = ctor.__attributeToPropertyMap.get(name);
    if (propName !== void 0 && this.__reflectingProperty !== propName) {
      const options = ctor.getPropertyOptions(propName);
      const converter = typeof options.converter === "function" ? { fromAttribute: options.converter } : options.converter?.fromAttribute !== void 0 ? options.converter : defaultConverter;
      this.__reflectingProperty = propName;
      const convertedValue = converter.fromAttribute(value, options.type);
      this[propName] = convertedValue ?? this.__defaultValues?.get(propName) ?? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      convertedValue;
      this.__reflectingProperty = null;
    }
  }
  /**
   * Requests an update which is processed asynchronously. This should be called
   * when an element should update based on some state not triggered by setting
   * a reactive property. In this case, pass no arguments. It should also be
   * called when manually implementing a property setter. In this case, pass the
   * property `name` and `oldValue` to ensure that any configured property
   * options are honored.
   *
   * @param name name of requesting property
   * @param oldValue old value of requesting property
   * @param options property options to use instead of the previously
   *     configured options
   * @category updates
   */
  requestUpdate(name, oldValue, options) {
    if (name !== void 0) {
      if (DEV_MODE && name instanceof Event) {
        issueWarning(``, `The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()`);
      }
      const ctor = this.constructor;
      const newValue = this[name];
      options ??= ctor.getPropertyOptions(name);
      const changed = (options.hasChanged ?? notEqual)(newValue, oldValue) || // When there is no change, check a corner case that can occur when
      // 1. there's a initial value which was not reflected
      // 2. the property is subsequently set to this value.
      // For example, `prop: {useDefault: true, reflect: true}`
      // and el.prop = 'foo'. This should be considered a change if the
      // attribute is not set because we will now reflect the property to the attribute.
      options.useDefault && options.reflect && newValue === this.__defaultValues?.get(name) && !this.hasAttribute(ctor.__attributeNameForProperty(name, options));
      if (changed) {
        this._$changeProperty(name, oldValue, options);
      } else {
        return;
      }
    }
    if (this.isUpdatePending === false) {
      this.__updatePromise = this.__enqueueUpdate();
    }
  }
  /**
   * @internal
   */
  _$changeProperty(name, oldValue, { useDefault, reflect, wrapped }, initializeValue) {
    if (useDefault && !(this.__defaultValues ??= /* @__PURE__ */ new Map()).has(name)) {
      this.__defaultValues.set(name, initializeValue ?? oldValue ?? this[name]);
      if (wrapped !== true || initializeValue !== void 0) {
        return;
      }
    }
    if (!this._$changedProperties.has(name)) {
      if (!this.hasUpdated && !useDefault) {
        oldValue = void 0;
      }
      this._$changedProperties.set(name, oldValue);
    }
    if (reflect === true && this.__reflectingProperty !== name) {
      (this.__reflectingProperties ??= /* @__PURE__ */ new Set()).add(name);
    }
  }
  /**
   * Sets up the element to asynchronously update.
   */
  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.__updatePromise;
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }
  /**
   * Schedules an element update. You can override this method to change the
   * timing of updates by returning a Promise. The update will await the
   * returned Promise, and you should resolve the Promise to allow the update
   * to proceed. If this method is overridden, `super.scheduleUpdate()`
   * must be called.
   *
   * For instance, to schedule updates to occur just before the next frame:
   *
   * ```ts
   * override protected async scheduleUpdate(): Promise<unknown> {
   *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
   *   super.scheduleUpdate();
   * }
   * ```
   * @category updates
   */
  scheduleUpdate() {
    const result = this.performUpdate();
    if (DEV_MODE && this.constructor.enabledWarnings.includes("async-perform-update") && typeof result?.then === "function") {
      issueWarning("async-perform-update", `Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);
    }
    return result;
  }
  /**
   * Performs an element update. Note, if an exception is thrown during the
   * update, `firstUpdated` and `updated` will not be called.
   *
   * Call `performUpdate()` to immediately process a pending update. This should
   * generally not be needed, but it can be done in rare cases when you need to
   * update synchronously.
   *
   * @category updates
   */
  performUpdate() {
    if (!this.isUpdatePending) {
      return;
    }
    debugLogEvent?.({ kind: "update" });
    if (!this.hasUpdated) {
      this.renderRoot ??= this.createRenderRoot();
      if (DEV_MODE) {
        const ctor = this.constructor;
        const shadowedProperties = [...ctor.elementProperties.keys()].filter((p) => this.hasOwnProperty(p) && p in getPrototypeOf(this));
        if (shadowedProperties.length) {
          throw new Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${shadowedProperties.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`);
        }
      }
      if (this.__instanceProperties) {
        for (const [p, value] of this.__instanceProperties) {
          this[p] = value;
        }
        this.__instanceProperties = void 0;
      }
      const elementProperties = this.constructor.elementProperties;
      if (elementProperties.size > 0) {
        for (const [p, options] of elementProperties) {
          const { wrapped } = options;
          const value = this[p];
          if (wrapped === true && !this._$changedProperties.has(p) && value !== void 0) {
            this._$changeProperty(p, void 0, options, value);
          }
        }
      }
    }
    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties);
      if (shouldUpdate) {
        this.willUpdate(changedProperties);
        this.__controllers?.forEach((c) => c.hostUpdate?.());
        this.update(changedProperties);
      } else {
        this.__markUpdated();
      }
    } catch (e) {
      shouldUpdate = false;
      this.__markUpdated();
      throw e;
    }
    if (shouldUpdate) {
      this._$didUpdate(changedProperties);
    }
  }
  /**
   * Invoked before `update()` to compute values needed during the update.
   *
   * Implement `willUpdate` to compute property values that depend on other
   * properties and are used in the rest of the update process.
   *
   * ```ts
   * willUpdate(changedProperties) {
   *   // only need to check changed properties for an expensive computation.
   *   if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
   *     this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
   *   }
   * }
   *
   * render() {
   *   return html`SHA: ${this.sha}`;
   * }
   * ```
   *
   * @category updates
   */
  willUpdate(_changedProperties) {
  }
  // Note, this is an override point for polyfill-support.
  // @internal
  _$didUpdate(changedProperties) {
    this.__controllers?.forEach((c) => c.hostUpdated?.());
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.firstUpdated(changedProperties);
    }
    this.updated(changedProperties);
    if (DEV_MODE && this.isUpdatePending && this.constructor.enabledWarnings.includes("change-in-update")) {
      issueWarning("change-in-update", `Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`);
    }
  }
  __markUpdated() {
    this._$changedProperties = /* @__PURE__ */ new Map();
    this.isUpdatePending = false;
  }
  /**
   * Returns a Promise that resolves when the element has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * To await additional asynchronous work, override the `getUpdateComplete`
   * method. For example, it is sometimes useful to await a rendered element
   * before fulfilling this Promise. To do this, first await
   * `super.getUpdateComplete()`, then any subsequent state.
   *
   * @return A promise of a boolean that resolves to true if the update completed
   *     without triggering another update.
   * @category updates
   */
  get updateComplete() {
    return this.getUpdateComplete();
  }
  /**
   * Override point for the `updateComplete` promise.
   *
   * It is not safe to override the `updateComplete` getter directly due to a
   * limitation in TypeScript which means it is not possible to call a
   * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
   * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
   * This method should be overridden instead. For example:
   *
   * ```ts
   * class MyElement extends LitElement {
   *   override async getUpdateComplete() {
   *     const result = await super.getUpdateComplete();
   *     await this._myChild.updateComplete;
   *     return result;
   *   }
   * }
   * ```
   *
   * @return A promise of a boolean that resolves to true if the update completed
   *     without triggering another update.
   * @category updates
   */
  getUpdateComplete() {
    return this.__updatePromise;
  }
  /**
   * Controls whether or not `update()` should be called when the element requests
   * an update. By default, this method always returns `true`, but this can be
   * customized to control when to update.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  shouldUpdate(_changedProperties) {
    return true;
  }
  /**
   * Updates the element. This method reflects property values to attributes.
   * It can be overridden to render and keep updated element DOM.
   * Setting properties inside this method will *not* trigger
   * another update.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  update(_changedProperties) {
    this.__reflectingProperties &&= this.__reflectingProperties.forEach((p) => this.__propertyToAttribute(p, this[p]));
    this.__markUpdated();
  }
  /**
   * Invoked whenever the element is updated. Implement to perform
   * post-updating tasks via DOM APIs, for example, focusing an element.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  updated(_changedProperties) {
  }
  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * ```ts
   * firstUpdated() {
   *   this.renderRoot.getElementById('my-text-area').focus();
   * }
   * ```
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * @param _changedProperties Map of changed properties with old values
   * @category updates
   */
  firstUpdated(_changedProperties) {
  }
};
ReactiveElement.elementStyles = [];
ReactiveElement.shadowRootOptions = { mode: "open" };
ReactiveElement[JSCompiler_renameProperty("elementProperties", ReactiveElement)] = /* @__PURE__ */ new Map();
ReactiveElement[JSCompiler_renameProperty("finalized", ReactiveElement)] = /* @__PURE__ */ new Map();
polyfillSupport?.({ ReactiveElement });
if (DEV_MODE) {
  ReactiveElement.enabledWarnings = [
    "change-in-update",
    "async-perform-update"
  ];
  const ensureOwnWarnings = function(ctor) {
    if (!ctor.hasOwnProperty(JSCompiler_renameProperty("enabledWarnings", ctor))) {
      ctor.enabledWarnings = ctor.enabledWarnings.slice();
    }
  };
  ReactiveElement.enableWarning = function(warning) {
    ensureOwnWarnings(this);
    if (!this.enabledWarnings.includes(warning)) {
      this.enabledWarnings.push(warning);
    }
  };
  ReactiveElement.disableWarning = function(warning) {
    ensureOwnWarnings(this);
    const i = this.enabledWarnings.indexOf(warning);
    if (i >= 0) {
      this.enabledWarnings.splice(i, 1);
    }
  };
}
(global2.reactiveElementVersions ??= []).push("2.1.1");
if (DEV_MODE && global2.reactiveElementVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`);
  });
}

// node_modules/lit-html/development/lit-html.js
var DEV_MODE2 = true;
var ENABLE_EXTRA_SECURITY_HOOKS = true;
var ENABLE_SHADYDOM_NOPATCH = true;
var NODE_MODE3 = false;
var global3 = globalThis;
var debugLogEvent2 = DEV_MODE2 ? (event) => {
  const shouldEmit = global3.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global3.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
} : void 0;
var debugLogRenderId = 0;
var issueWarning2;
if (DEV_MODE2) {
  global3.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning2 = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!global3.litIssuedWarnings.has(warning) && !global3.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global3.litIssuedWarnings.add(warning);
    }
  };
  queueMicrotask(() => {
    issueWarning2("dev-mode", `Lit is in dev mode. Not recommended for production!`);
  });
}
var wrap = ENABLE_SHADYDOM_NOPATCH && global3.ShadyDOM?.inUse && global3.ShadyDOM?.noPatch === true ? global3.ShadyDOM.wrap : (node) => node;
var trustedTypes2 = global3.trustedTypes;
var policy = trustedTypes2 ? trustedTypes2.createPolicy("lit-html", {
  createHTML: (s2) => s2
}) : void 0;
var identityFunction = (value) => value;
var noopSanitizer = (_node, _name3, _type) => identityFunction;
var setSanitizer = (newSanitizer) => {
  if (!ENABLE_EXTRA_SECURITY_HOOKS) {
    return;
  }
  if (sanitizerFactoryInternal !== noopSanitizer) {
    throw new Error(`Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.`);
  }
  sanitizerFactoryInternal = newSanitizer;
};
var _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
  sanitizerFactoryInternal = noopSanitizer;
};
var createSanitizer = (node, name, type) => {
  return sanitizerFactoryInternal(node, name, type);
};
var boundAttributeSuffix = "$lit$";
var marker = `lit$${Math.random().toFixed(9).slice(2)}$`;
var markerMatch = "?" + marker;
var nodeMarker = `<${markerMatch}>`;
var d = NODE_MODE3 && global3.document === void 0 ? {
  createTreeWalker() {
    return {};
  }
} : document;
var createMarker = () => d.createComment("");
var isPrimitive = (value) => value === null || typeof value != "object" && typeof value != "function";
var isArray = Array.isArray;
var isIterable = (value) => isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
typeof value?.[Symbol.iterator] === "function";
var SPACE_CHAR = `[ 	
\f\r]`;
var ATTR_VALUE_CHAR = `[^ 	
\f\r"'\`<>=]`;
var NAME_CHAR = `[^\\s"'>=/]`;
var textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var COMMENT_START = 1;
var TAG_NAME = 2;
var DYNAMIC_TAG_NAME = 3;
var commentEndRegex = /-->/g;
var comment2EndRegex = />/g;
var tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
var ENTIRE_MATCH = 0;
var ATTRIBUTE_NAME = 1;
var SPACES_AND_EQUALS = 2;
var QUOTE_CHAR = 3;
var singleQuoteAttrEndRegex = /'/g;
var doubleQuoteAttrEndRegex = /"/g;
var rawTextElement = /^(?:script|style|textarea|title)$/i;
var HTML_RESULT = 1;
var SVG_RESULT = 2;
var MATHML_RESULT = 3;
var ATTRIBUTE_PART = 1;
var CHILD_PART = 2;
var PROPERTY_PART = 3;
var BOOLEAN_ATTRIBUTE_PART = 4;
var EVENT_PART = 5;
var ELEMENT_PART = 6;
var COMMENT_PART = 7;
var tag = (type) => (strings, ...values) => {
  if (DEV_MODE2 && strings.some((s2) => s2 === void 0)) {
    console.warn("Some template strings are undefined.\nThis is probably caused by illegal octal escape sequences.");
  }
  if (DEV_MODE2) {
    if (values.some((val) => val?.["_$litStatic$"])) {
      issueWarning2("", `Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);
    }
  }
  return {
    // This property needs to remain unminified.
    ["_$litType$"]: type,
    strings,
    values
  };
};
var html = tag(HTML_RESULT);
var svg = tag(SVG_RESULT);
var mathml = tag(MATHML_RESULT);
var noChange = Symbol.for("lit-noChange");
var nothing = Symbol.for("lit-nothing");
var templateCache = /* @__PURE__ */ new WeakMap();
var walker = d.createTreeWalker(
  d,
  129
  /* NodeFilter.SHOW_{ELEMENT|COMMENT} */
);
var sanitizerFactoryInternal = noopSanitizer;
function trustFromTemplateString(tsa, stringFromTSA) {
  if (!isArray(tsa) || !tsa.hasOwnProperty("raw")) {
    let message = "invalid template strings array";
    if (DEV_MODE2) {
      message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, "\n");
    }
    throw new Error(message);
  }
  return policy !== void 0 ? policy.createHTML(stringFromTSA) : stringFromTSA;
}
var getTemplateHtml = (strings, type) => {
  const l2 = strings.length - 1;
  const attrNames = [];
  let html2 = type === SVG_RESULT ? "<svg>" : type === MATHML_RESULT ? "<math>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex;
  for (let i = 0; i < l2; i++) {
    const s2 = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match2;
    while (lastIndex < s2.length) {
      regex.lastIndex = lastIndex;
      match2 = regex.exec(s2);
      if (match2 === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex) {
        if (match2[COMMENT_START] === "!--") {
          regex = commentEndRegex;
        } else if (match2[COMMENT_START] !== void 0) {
          regex = comment2EndRegex;
        } else if (match2[TAG_NAME] !== void 0) {
          if (rawTextElement.test(match2[TAG_NAME])) {
            rawTextEndRegex = new RegExp(`</${match2[TAG_NAME]}`, "g");
          }
          regex = tagEndRegex;
        } else if (match2[DYNAMIC_TAG_NAME] !== void 0) {
          if (DEV_MODE2) {
            throw new Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions");
          }
          regex = tagEndRegex;
        }
      } else if (regex === tagEndRegex) {
        if (match2[ENTIRE_MATCH] === ">") {
          regex = rawTextEndRegex ?? textEndRegex;
          attrNameEndIndex = -1;
        } else if (match2[ATTRIBUTE_NAME] === void 0) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match2[SPACES_AND_EQUALS].length;
          attrName = match2[ATTRIBUTE_NAME];
          regex = match2[QUOTE_CHAR] === void 0 ? tagEndRegex : match2[QUOTE_CHAR] === '"' ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
        }
      } else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) {
        regex = tagEndRegex;
      } else if (regex === commentEndRegex || regex === comment2EndRegex) {
        regex = textEndRegex;
      } else {
        regex = tagEndRegex;
        rawTextEndRegex = void 0;
      }
    }
    if (DEV_MODE2) {
      console.assert(attrNameEndIndex === -1 || regex === tagEndRegex || regex === singleQuoteAttrEndRegex || regex === doubleQuoteAttrEndRegex, "unexpected parse state B");
    }
    const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
    html2 += regex === textEndRegex ? s2 + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s2.slice(0, attrNameEndIndex) + boundAttributeSuffix + s2.slice(attrNameEndIndex)) + marker + end : s2 + marker + (attrNameEndIndex === -2 ? i : end);
  }
  const htmlResult = html2 + (strings[l2] || "<?>") + (type === SVG_RESULT ? "</svg>" : type === MATHML_RESULT ? "</math>" : "");
  return [trustFromTemplateString(strings, htmlResult), attrNames];
};
var Template = class _Template {
  constructor({ strings, ["_$litType$"]: type }, options) {
    this.parts = [];
    let node;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings.length - 1;
    const parts = this.parts;
    const [html2, attrNames] = getTemplateHtml(strings, type);
    this.el = _Template.createElement(html2, options);
    walker.currentNode = this.el.content;
    if (type === SVG_RESULT || type === MATHML_RESULT) {
      const wrapper = this.el.content.firstChild;
      wrapper.replaceWith(...wrapper.childNodes);
    }
    while ((node = walker.nextNode()) !== null && parts.length < partCount) {
      if (node.nodeType === 1) {
        if (DEV_MODE2) {
          const tag2 = node.localName;
          if (/^(?:textarea|template)$/i.test(tag2) && node.innerHTML.includes(marker)) {
            const m = `Expressions are not supported inside \`${tag2}\` elements. See https://lit.dev/msg/expression-in-${tag2} for more information.`;
            if (tag2 === "template") {
              throw new Error(m);
            } else
              issueWarning2("", m);
          }
        }
        if (node.hasAttributes()) {
          for (const name of node.getAttributeNames()) {
            if (name.endsWith(boundAttributeSuffix)) {
              const realName = attrNames[attrNameIndex++];
              const value = node.getAttribute(name);
              const statics = value.split(marker);
              const m = /([.?@])?(.*)/.exec(realName);
              parts.push({
                type: ATTRIBUTE_PART,
                index: nodeIndex,
                name: m[2],
                strings: statics,
                ctor: m[1] === "." ? PropertyPart : m[1] === "?" ? BooleanAttributePart : m[1] === "@" ? EventPart : AttributePart
              });
              node.removeAttribute(name);
            } else if (name.startsWith(marker)) {
              parts.push({
                type: ELEMENT_PART,
                index: nodeIndex
              });
              node.removeAttribute(name);
            }
          }
        }
        if (rawTextElement.test(node.tagName)) {
          const strings2 = node.textContent.split(marker);
          const lastIndex = strings2.length - 1;
          if (lastIndex > 0) {
            node.textContent = trustedTypes2 ? trustedTypes2.emptyScript : "";
            for (let i = 0; i < lastIndex; i++) {
              node.append(strings2[i], createMarker());
              walker.nextNode();
              parts.push({ type: CHILD_PART, index: ++nodeIndex });
            }
            node.append(strings2[lastIndex], createMarker());
          }
        }
      } else if (node.nodeType === 8) {
        const data2 = node.data;
        if (data2 === markerMatch) {
          parts.push({ type: CHILD_PART, index: nodeIndex });
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
            parts.push({ type: COMMENT_PART, index: nodeIndex });
            i += marker.length - 1;
          }
        }
      }
      nodeIndex++;
    }
    if (DEV_MODE2) {
      if (attrNames.length !== attrNameIndex) {
        throw new Error(`Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=\${true} ?disabled=\${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: 
\`` + strings.join("${...}") + "`");
      }
    }
    debugLogEvent2 && debugLogEvent2({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings
    });
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @nocollapse */
  static createElement(html2, _options) {
    const el = d.createElement("template");
    el.innerHTML = html2;
    return el;
  }
};
function resolveDirective(part, value, parent = part, attributeIndex) {
  if (value === noChange) {
    return value;
  }
  let currentDirective = attributeIndex !== void 0 ? parent.__directives?.[attributeIndex] : parent.__directive;
  const nextDirectiveConstructor = isPrimitive(value) ? void 0 : (
    // This property needs to remain unminified.
    value["_$litDirective$"]
  );
  if (currentDirective?.constructor !== nextDirectiveConstructor) {
    currentDirective?.["_$notifyDirectiveConnectionChanged"]?.(false);
    if (nextDirectiveConstructor === void 0) {
      currentDirective = void 0;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== void 0) {
      (parent.__directives ??= [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== void 0) {
    value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
  }
  return value;
}
var TemplateInstance = class {
  constructor(template, parent) {
    this._$parts = [];
    this._$disconnectableChildren = void 0;
    this._$template = template;
    this._$parent = parent;
  }
  // Called by ChildPart parentNode getter
  get parentNode() {
    return this._$parent.parentNode;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  // This method is separate from the constructor because we need to return a
  // DocumentFragment and we don't want to hold onto it with an instance field.
  _clone(options) {
    const { el: { content }, parts } = this._$template;
    const fragment = (options?.creationScope ?? d).importNode(content, true);
    walker.currentNode = fragment;
    let node = walker.nextNode();
    let nodeIndex = 0;
    let partIndex = 0;
    let templatePart = parts[0];
    while (templatePart !== void 0) {
      if (nodeIndex === templatePart.index) {
        let part;
        if (templatePart.type === CHILD_PART) {
          part = new ChildPart(node, node.nextSibling, this, options);
        } else if (templatePart.type === ATTRIBUTE_PART) {
          part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
        } else if (templatePart.type === ELEMENT_PART) {
          part = new ElementPart(node, this, options);
        }
        this._$parts.push(part);
        templatePart = parts[++partIndex];
      }
      if (nodeIndex !== templatePart?.index) {
        node = walker.nextNode();
        nodeIndex++;
      }
    }
    walker.currentNode = d;
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._$parts) {
      if (part !== void 0) {
        debugLogEvent2 && debugLogEvent2({
          kind: "set part",
          part,
          value: values[i],
          valueIndex: i,
          values,
          templateInstance: this
        });
        if (part.strings !== void 0) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
};
var ChildPart = class _ChildPart {
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent?._$isConnected ?? this.__isConnected;
  }
  constructor(startNode, endNode, parent, options) {
    this.type = CHILD_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = void 0;
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent;
    this.options = options;
    this.__isConnected = options?.isConnected ?? true;
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._textSanitizer = void 0;
    }
  }
  /**
   * The parent node into which the part renders its content.
   *
   * A ChildPart's content consists of a range of adjacent child nodes of
   * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
   * `.endNode`).
   *
   * - If both `.startNode` and `.endNode` are non-null, then the part's content
   * consists of all siblings between `.startNode` and `.endNode`, exclusively.
   *
   * - If `.startNode` is non-null but `.endNode` is null, then the part's
   * content consists of all siblings following `.startNode`, up to and
   * including the last child of `.parentNode`. If `.endNode` is non-null, then
   * `.startNode` will always be non-null.
   *
   * - If both `.endNode` and `.startNode` are null, then the part's content
   * consists of all child nodes of `.parentNode`.
   */
  get parentNode() {
    let parentNode = wrap(this._$startNode).parentNode;
    const parent = this._$parent;
    if (parent !== void 0 && parentNode?.nodeType === 11) {
      parentNode = parent.parentNode;
    }
    return parentNode;
  }
  /**
   * The part's leading marker node, if any. See `.parentNode` for more
   * information.
   */
  get startNode() {
    return this._$startNode;
  }
  /**
   * The part's trailing marker node, if any. See `.parentNode` for more
   * information.
   */
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    if (DEV_MODE2 && this.parentNode === null) {
      throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
    }
    value = resolveDirective(this, value, directiveParent);
    if (isPrimitive(value)) {
      if (value === nothing || value == null || value === "") {
        if (this._$committedValue !== nothing) {
          debugLogEvent2 && debugLogEvent2({
            kind: "commit nothing to child",
            start: this._$startNode,
            end: this._$endNode,
            parent: this._$parent,
            options: this.options
          });
          this._$clear();
        }
        this._$committedValue = nothing;
      } else if (value !== this._$committedValue && value !== noChange) {
        this._commitText(value);
      }
    } else if (value["_$litType$"] !== void 0) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== void 0) {
      if (DEV_MODE2 && this.options?.host === value) {
        this._commitText(`[probable mistake: rendered a template's host in itself (commonly caused by writing \${this} in a template]`);
        console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
        return;
      }
      this._commitNode(value);
    } else if (isIterable(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node) {
    return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
  }
  _commitNode(value) {
    if (this._$committedValue !== value) {
      this._$clear();
      if (ENABLE_EXTRA_SECURITY_HOOKS && sanitizerFactoryInternal !== noopSanitizer) {
        const parentNodeName = this._$startNode.parentNode?.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          let message = "Forbidden";
          if (DEV_MODE2) {
            if (parentNodeName === "STYLE") {
              message = `Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css\`...\` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.`;
            } else {
              message = `Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.`;
            }
          }
          throw new Error(message);
        }
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value,
        options: this.options
      });
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    if (this._$committedValue !== nothing && isPrimitive(this._$committedValue)) {
      const node = wrap(this._$startNode).nextSibling;
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._textSanitizer === void 0) {
          this._textSanitizer = createSanitizer(node, "data", "property");
        }
        value = this._textSanitizer(value);
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit text",
        node,
        value,
        options: this.options
      });
      node.data = value;
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        const textNode = d.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === void 0) {
          this._textSanitizer = createSanitizer(textNode, "data", "property");
        }
        value = this._textSanitizer(value);
        debugLogEvent2 && debugLogEvent2({
          kind: "commit text",
          node: textNode,
          value,
          options: this.options
        });
        textNode.data = value;
      } else {
        this._commitNode(d.createTextNode(value));
        debugLogEvent2 && debugLogEvent2({
          kind: "commit text",
          node: wrap(this._$startNode).nextSibling,
          value,
          options: this.options
        });
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    const { values, ["_$litType$"]: type } = result;
    const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === void 0 && (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)), type);
    if (this._$committedValue?._$template === template) {
      debugLogEvent2 && debugLogEvent2({
        kind: "template updating",
        template,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values
      });
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance(template, this);
      const fragment = instance._clone(this.options);
      debugLogEvent2 && debugLogEvent2({
        kind: "template instantiated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      instance._update(values);
      debugLogEvent2 && debugLogEvent2({
        kind: "template instantiated and updated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @internal */
  _$getTemplate(result) {
    let template = templateCache.get(result.strings);
    if (template === void 0) {
      templateCache.set(result.strings, template = new Template(result));
    }
    return template;
  }
  _commitIterable(value) {
    if (!isArray(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(itemPart = new _ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  /**
   * Removes the nodes contained within this Part from the DOM.
   *
   * @param start Start node to clear from, for clearing a subset of the part's
   *     DOM (used when truncating iterables)
   * @param from  When `start` is specified, the index within the iterable from
   *     which ChildParts are being removed, used for disconnecting directives
   *     in those Parts.
   *
   * @internal
   */
  _$clear(start = wrap(this._$startNode).nextSibling, from) {
    this._$notifyConnectionChanged?.(false, true, from);
    while (start !== this._$endNode) {
      const n2 = wrap(start).nextSibling;
      wrap(start).remove();
      start = n2;
    }
  }
  /**
   * Implementation of RootPart's `isConnected`. Note that this method
   * should only be called on `RootPart`s (the `ChildPart` returned from a
   * top-level `render()` call). It has no effect on non-root ChildParts.
   * @param isConnected Whether to set
   * @internal
   */
  setConnected(isConnected) {
    if (this._$parent === void 0) {
      this.__isConnected = isConnected;
      this._$notifyConnectionChanged?.(isConnected);
    } else if (DEV_MODE2) {
      throw new Error("part.setConnected() may only be called on a RootPart returned from render().");
    }
  }
};
var AttributePart = class {
  get tagName() {
    return this.element.tagName;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  constructor(element, name, strings, parent, options) {
    this.type = ATTRIBUTE_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = void 0;
    this.element = element;
    this.name = name;
    this._$parent = parent;
    this.options = options;
    if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
      this._$committedValue = new Array(strings.length - 1).fill(new String());
      this.strings = strings;
    } else {
      this._$committedValue = nothing;
    }
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      this._sanitizer = void 0;
    }
  }
  /**
   * Sets the value of this part by resolving the value from possibly multiple
   * values and static strings and committing it to the DOM.
   * If this part is single-valued, `this._strings` will be undefined, and the
   * method will be called with a single value argument. If this part is
   * multi-value, `this._strings` will be defined, and the method is called
   * with the value array of the part's owning TemplateInstance, and an offset
   * into the value array from which the values should be read.
   * This method is overloaded this way to eliminate short-lived array slices
   * of the template instance values, and allow a fast-path for single-valued
   * parts.
   *
   * @param value The part value, or an array of values for multi-valued parts
   * @param valueIndex the index to start reading values from. `undefined` for
   *   single-valued parts
   * @param noCommit causes the part to not commit its value to the DOM. Used
   *   in hydration to prime attribute parts with their first-rendered value,
   *   but not set the attribute, and in SSR to no-op the DOM operation and
   *   capture the value for serialization.
   *
   * @internal
   */
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings = this.strings;
    let change = false;
    if (strings === void 0) {
      value = resolveDirective(this, value, directiveParent, 0);
      change = !isPrimitive(value) || value !== this._$committedValue && value !== noChange;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings[0];
      let i, v;
      for (i = 0; i < strings.length - 1; i++) {
        v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange) {
          v = this._$committedValue[i];
        }
        change ||= !isPrimitive(v) || v !== this._$committedValue[i];
        if (v === nothing) {
          value = nothing;
        } else if (value !== nothing) {
          value += (v ?? "") + strings[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  /** @internal */
  _commitValue(value) {
    if (value === nothing) {
      wrap(this.element).removeAttribute(this.name);
    } else {
      if (ENABLE_EXTRA_SECURITY_HOOKS) {
        if (this._sanitizer === void 0) {
          this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "attribute");
        }
        value = this._sanitizer(value ?? "");
      }
      debugLogEvent2 && debugLogEvent2({
        kind: "commit attribute",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      wrap(this.element).setAttribute(this.name, value ?? "");
    }
  }
};
var PropertyPart = class extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = PROPERTY_PART;
  }
  /** @internal */
  _commitValue(value) {
    if (ENABLE_EXTRA_SECURITY_HOOKS) {
      if (this._sanitizer === void 0) {
        this._sanitizer = sanitizerFactoryInternal(this.element, this.name, "property");
      }
      value = this._sanitizer(value);
    }
    debugLogEvent2 && debugLogEvent2({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value,
      options: this.options
    });
    this.element[this.name] = value === nothing ? void 0 : value;
  }
};
var BooleanAttributePart = class extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = BOOLEAN_ATTRIBUTE_PART;
  }
  /** @internal */
  _commitValue(value) {
    debugLogEvent2 && debugLogEvent2({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(value && value !== nothing),
      options: this.options
    });
    wrap(this.element).toggleAttribute(this.name, !!value && value !== nothing);
  }
};
var EventPart = class extends AttributePart {
  constructor(element, name, strings, parent, options) {
    super(element, name, strings, parent, options);
    this.type = EVENT_PART;
    if (DEV_MODE2 && this.strings !== void 0) {
      throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`);
    }
  }
  // EventPart does not use the base _$setValue/_resolveValue implementation
  // since the dirty checking is more complex
  /** @internal */
  _$setValue(newListener, directiveParent = this) {
    newListener = resolveDirective(this, newListener, directiveParent, 0) ?? nothing;
    if (newListener === noChange) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener = newListener === nothing && oldListener !== nothing || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing && (oldListener === nothing || shouldRemoveListener);
    debugLogEvent2 && debugLogEvent2({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: newListener,
      options: this.options,
      removeListener: shouldRemoveListener,
      addListener: shouldAddListener,
      oldListener
    });
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call(this.options?.host ?? this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
};
var ElementPart = class {
  constructor(element, parent, options) {
    this.element = element;
    this.type = ELEMENT_PART;
    this._$disconnectableChildren = void 0;
    this._$parent = parent;
    this.options = options;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value) {
    debugLogEvent2 && debugLogEvent2({
      kind: "commit to element binding",
      element: this.element,
      value,
      options: this.options
    });
    resolveDirective(this, value);
  }
};
var _$LH = {
  // Used in lit-ssr
  _boundAttributeSuffix: boundAttributeSuffix,
  _marker: marker,
  _markerMatch: markerMatch,
  _HTML_RESULT: HTML_RESULT,
  _getTemplateHtml: getTemplateHtml,
  // Used in tests and private-ssr-support
  _TemplateInstance: TemplateInstance,
  _isIterable: isIterable,
  _resolveDirective: resolveDirective,
  _ChildPart: ChildPart,
  _AttributePart: AttributePart,
  _BooleanAttributePart: BooleanAttributePart,
  _EventPart: EventPart,
  _PropertyPart: PropertyPart,
  _ElementPart: ElementPart
};
var polyfillSupport2 = DEV_MODE2 ? global3.litHtmlPolyfillSupportDevMode : global3.litHtmlPolyfillSupport;
polyfillSupport2?.(Template, ChildPart);
(global3.litHtmlVersions ??= []).push("3.3.1");
if (DEV_MODE2 && global3.litHtmlVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning2("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`);
  });
}
var render = (value, container, options) => {
  if (DEV_MODE2 && container == null) {
    throw new TypeError(`The container to render into may not be ${container}`);
  }
  const renderId = DEV_MODE2 ? debugLogRenderId++ : 0;
  const partOwnerNode = options?.renderBefore ?? container;
  let part = partOwnerNode["_$litPart$"];
  debugLogEvent2 && debugLogEvent2({
    kind: "begin render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  if (part === void 0) {
    const endNode = options?.renderBefore ?? null;
    partOwnerNode["_$litPart$"] = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, void 0, options ?? {});
  }
  part._$setValue(value);
  debugLogEvent2 && debugLogEvent2({
    kind: "end render",
    id: renderId,
    value,
    container,
    options,
    part
  });
  return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS) {
  render.setSanitizer = setSanitizer;
  render.createSanitizer = createSanitizer;
  if (DEV_MODE2) {
    render._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse;
  }
}

// node_modules/lit-element/development/lit-element.js
var JSCompiler_renameProperty2 = (prop, _obj) => prop;
var DEV_MODE3 = true;
var global4 = globalThis;
var issueWarning3;
if (DEV_MODE3) {
  global4.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning3 = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!global4.litIssuedWarnings.has(warning) && !global4.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global4.litIssuedWarnings.add(warning);
    }
  };
}
var LitElement = class extends ReactiveElement {
  constructor() {
    super(...arguments);
    this.renderOptions = { host: this };
    this.__childPart = void 0;
  }
  /**
   * @category rendering
   */
  createRenderRoot() {
    const renderRoot = super.createRenderRoot();
    this.renderOptions.renderBefore ??= renderRoot.firstChild;
    return renderRoot;
  }
  /**
   * Updates the element. This method reflects property values to attributes
   * and calls `render` to render DOM via lit-html. Setting properties inside
   * this method will *not* trigger another update.
   * @param changedProperties Map of changed properties with old values
   * @category updates
   */
  update(changedProperties) {
    const value = this.render();
    if (!this.hasUpdated) {
      this.renderOptions.isConnected = this.isConnected;
    }
    super.update(changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
  /**
   * Invoked when the component is added to the document's DOM.
   *
   * In `connectedCallback()` you should setup tasks that should only occur when
   * the element is connected to the document. The most common of these is
   * adding event listeners to nodes external to the element, like a keydown
   * event handler added to the window.
   *
   * ```ts
   * connectedCallback() {
   *   super.connectedCallback();
   *   addEventListener('keydown', this._handleKeydown);
   * }
   * ```
   *
   * Typically, anything done in `connectedCallback()` should be undone when the
   * element is disconnected, in `disconnectedCallback()`.
   *
   * @category lifecycle
   */
  connectedCallback() {
    super.connectedCallback();
    this.__childPart?.setConnected(true);
  }
  /**
   * Invoked when the component is removed from the document's DOM.
   *
   * This callback is the main signal to the element that it may no longer be
   * used. `disconnectedCallback()` should ensure that nothing is holding a
   * reference to the element (such as event listeners added to nodes external
   * to the element), so that it is free to be garbage collected.
   *
   * ```ts
   * disconnectedCallback() {
   *   super.disconnectedCallback();
   *   window.removeEventListener('keydown', this._handleKeydown);
   * }
   * ```
   *
   * An element may be re-connected after being disconnected.
   *
   * @category lifecycle
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.__childPart?.setConnected(false);
  }
  /**
   * Invoked on each update to perform rendering tasks. This method may return
   * any value renderable by lit-html's `ChildPart` - typically a
   * `TemplateResult`. Setting properties inside this method will *not* trigger
   * the element to update.
   * @category rendering
   */
  render() {
    return noChange;
  }
};
LitElement["_$litElement$"] = true;
LitElement[JSCompiler_renameProperty2("finalized", LitElement)] = true;
global4.litElementHydrateSupport?.({ LitElement });
var polyfillSupport3 = DEV_MODE3 ? global4.litElementPolyfillSupportDevMode : global4.litElementPolyfillSupport;
polyfillSupport3?.({ LitElement });
(global4.litElementVersions ??= []).push("4.2.1");
if (DEV_MODE3 && global4.litElementVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning3("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`);
  });
}

// node_modules/@lit/reactive-element/development/decorators/custom-element.js
var customElement = (tagName) => (classOrTarget, context) => {
  if (context !== void 0) {
    context.addInitializer(() => {
      customElements.define(tagName, classOrTarget);
    });
  } else {
    customElements.define(tagName, classOrTarget);
  }
};

// node_modules/@lit/reactive-element/development/decorators/property.js
var DEV_MODE4 = true;
var issueWarning4;
if (DEV_MODE4) {
  globalThis.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning4 = (code, warning) => {
    warning += ` See https://lit.dev/msg/${code} for more information.`;
    if (!globalThis.litIssuedWarnings.has(warning) && !globalThis.litIssuedWarnings.has(code)) {
      console.warn(warning);
      globalThis.litIssuedWarnings.add(warning);
    }
  };
}
var legacyProperty = (options, proto, name) => {
  const hasOwnProperty2 = proto.hasOwnProperty(name);
  proto.constructor.createProperty(name, options);
  return hasOwnProperty2 ? Object.getOwnPropertyDescriptor(proto, name) : void 0;
};
var defaultPropertyDeclaration2 = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual
};
var standardProperty = (options = defaultPropertyDeclaration2, target, context) => {
  const { kind, metadata } = context;
  if (DEV_MODE4 && metadata == null) {
    issueWarning4("missing-class-metadata", `The class ${target} is missing decorator metadata. This could mean that you're using a compiler that supports decorators but doesn't support decorator metadata, such as TypeScript 5.1. Please update your compiler.`);
  }
  let properties = globalThis.litPropertyMetadata.get(metadata);
  if (properties === void 0) {
    globalThis.litPropertyMetadata.set(metadata, properties = /* @__PURE__ */ new Map());
  }
  if (kind === "setter") {
    options = Object.create(options);
    options.wrapped = true;
  }
  properties.set(context.name, options);
  if (kind === "accessor") {
    const { name } = context;
    return {
      set(v) {
        const oldValue = target.get.call(this);
        target.set.call(this, v);
        this.requestUpdate(name, oldValue, options);
      },
      init(v) {
        if (v !== void 0) {
          this._$changeProperty(name, void 0, options, v);
        }
        return v;
      }
    };
  } else if (kind === "setter") {
    const { name } = context;
    return function(value) {
      const oldValue = this[name];
      target.call(this, value);
      this.requestUpdate(name, oldValue, options);
    };
  }
  throw new Error(`Unsupported decorator location: ${kind}`);
};
function property(options) {
  return (protoOrTarget, nameOrContext) => {
    return typeof nameOrContext === "object" ? standardProperty(options, protoOrTarget, nameOrContext) : legacyProperty(options, protoOrTarget, nameOrContext);
  };
}

// node_modules/@lit/reactive-element/development/decorators/state.js
function state(options) {
  return property({
    ...options,
    // Add both `state` and `attribute` because we found a third party
    // controller that is keying off of PropertyOptions.state to determine
    // whether a field is a private internal property or not.
    state: true,
    attribute: false
  });
}

// node_modules/@lit/reactive-element/development/decorators/base.js
var desc = (obj, name, descriptor) => {
  descriptor.configurable = true;
  descriptor.enumerable = true;
  if (
    // We check for Reflect.decorate each time, in case the zombiefill
    // is applied via lazy loading some Angular code.
    Reflect.decorate && typeof name !== "object"
  ) {
    Object.defineProperty(obj, name, descriptor);
  }
  return descriptor;
};

// node_modules/@lit/reactive-element/development/decorators/query.js
var DEV_MODE5 = true;
var issueWarning5;
if (DEV_MODE5) {
  globalThis.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning5 = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!globalThis.litIssuedWarnings.has(warning) && !globalThis.litIssuedWarnings.has(code)) {
      console.warn(warning);
      globalThis.litIssuedWarnings.add(warning);
    }
  };
}

// node_modules/@lit/reactive-element/development/decorators/query-assigned-elements.js
function queryAssignedElements(options) {
  return (obj, name) => {
    const { slot, selector } = options ?? {};
    const slotSelector = `slot${slot ? `[name=${slot}]` : ":not([name])"}`;
    return desc(obj, name, {
      get() {
        const slotEl = this.renderRoot?.querySelector(slotSelector);
        const elements = slotEl?.assignedElements(options) ?? [];
        return selector === void 0 ? elements : elements.filter((node) => node.matches(selector));
      }
    });
  };
}

// node_modules/lit-html/development/directives/if-defined.js
var ifDefined = (value) => value ?? nothing;

// node_modules/lit-html/development/directive.js
var PartType = {
  ATTRIBUTE: 1,
  CHILD: 2,
  PROPERTY: 3,
  BOOLEAN_ATTRIBUTE: 4,
  EVENT: 5,
  ELEMENT: 6
};
var directive = (c) => (...values) => ({
  // This property needs to remain unminified.
  ["_$litDirective$"]: c,
  values
});
var Directive = class {
  constructor(_partInfo) {
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  /** @internal */
  _$initialize(part, parent, attributeIndex) {
    this.__part = part;
    this._$parent = parent;
    this.__attributeIndex = attributeIndex;
  }
  /** @internal */
  _$resolve(part, props) {
    return this.update(part, props);
  }
  update(_part, props) {
    return this.render(...props);
  }
};

// node_modules/lit-html/development/directives/style-map.js
var important = "important";
var importantFlag = " !" + important;
var flagTrim = 0 - importantFlag.length;
var StyleMapDirective = class extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ATTRIBUTE || partInfo.name !== "style" || partInfo.strings?.length > 2) {
      throw new Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
    }
  }
  render(styleInfo) {
    return Object.keys(styleInfo).reduce((style25, prop) => {
      const value = styleInfo[prop];
      if (value == null) {
        return style25;
      }
      prop = prop.includes("-") ? prop : prop.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase();
      return style25 + `${prop}:${value};`;
    }, "");
  }
  update(part, [styleInfo]) {
    const { style: style25 } = part.element;
    if (this._previousStyleProperties === void 0) {
      this._previousStyleProperties = new Set(Object.keys(styleInfo));
      return this.render(styleInfo);
    }
    for (const name of this._previousStyleProperties) {
      if (styleInfo[name] == null) {
        this._previousStyleProperties.delete(name);
        if (name.includes("-")) {
          style25.removeProperty(name);
        } else {
          style25[name] = null;
        }
      }
    }
    for (const name in styleInfo) {
      const value = styleInfo[name];
      if (value != null) {
        this._previousStyleProperties.add(name);
        const isImportant = typeof value === "string" && value.endsWith(importantFlag);
        if (name.includes("-") || isImportant) {
          style25.setProperty(name, isImportant ? value.slice(0, flagTrim) : value, isImportant ? important : "");
        } else {
          style25[name] = value;
        }
      }
    }
    return noChange;
  }
};
var styleMap = directive(StyleMapDirective);

// node_modules/@mdui/shared/base/mdui-element.js
var MduiElement = class extends LitElement {
  /**
   * 触发自定义事件。若返回 false，表示事件被取消
   * @param type
   * @param options 通常只用到 cancelable 和 detail；bubbles、composed 统一不用
   */
  emit(type, options) {
    const event = new CustomEvent(type, Object.assign({
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {}
    }, options));
    return this.dispatchEvent(event);
  }
};

// node_modules/@mdui/shared/controllers/has-slot.js
var HasSlotController = class {
  constructor(host, ...slotNames) {
    this.slotNames = [];
    (this.host = host).addController(this);
    this.slotNames = slotNames;
    this.onSlotChange = this.onSlotChange.bind(this);
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.onSlotChange);
    if (!isDomReady()) {
      $(() => {
        this.host.requestUpdate();
      });
    }
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.onSlotChange);
  }
  test(slotName) {
    return slotName === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }
  hasDefaultSlot() {
    return [...this.host.childNodes].some((node) => {
      if (node.nodeType === node.TEXT_NODE && node.textContent.trim() !== "") {
        return true;
      }
      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node;
        if (!el.hasAttribute("slot")) {
          return true;
        }
      }
      return false;
    });
  }
  hasNamedSlot(name) {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }
  onSlotChange(event) {
    const slot = event.target;
    if (this.slotNames.includes("[default]") && !slot.name || slot.name && this.slotNames.includes(slot.name)) {
      this.host.requestUpdate();
    }
  }
};

// node_modules/@mdui/shared/helpers/template.js
var nothingTemplate = html`${nothing}`;

// node_modules/@mdui/shared/lit-styles/component-style.js
var componentStyle = css`:host{box-sizing:border-box}:host *,:host ::after,:host ::before{box-sizing:inherit}:host :focus,:host :focus-visible,:host(:focus),:host(:focus-visible){outline:0}[hidden]{display:none!important}`;

// node_modules/lit-html/development/directives/unsafe-html.js
var HTML_RESULT2 = 1;
var UnsafeHTMLDirective = class extends Directive {
  constructor(partInfo) {
    super(partInfo);
    this._value = nothing;
    if (partInfo.type !== PartType.CHILD) {
      throw new Error(`${this.constructor.directiveName}() can only be used in child bindings`);
    }
  }
  render(value) {
    if (value === nothing || value == null) {
      this._templateResult = void 0;
      return this._value = value;
    }
    if (value === noChange) {
      return value;
    }
    if (typeof value != "string") {
      throw new Error(`${this.constructor.directiveName}() called with a non-string value`);
    }
    if (value === this._value) {
      return this._templateResult;
    }
    this._value = value;
    const strings = [value];
    strings.raw = strings;
    return this._templateResult = {
      // Cast to a known set of integers that satisfy ResultType so that we
      // don't have to export ResultType and possibly encourage this pattern.
      // This property needs to remain unminified.
      ["_$litType$"]: this.constructor.resultType,
      strings,
      values: []
    };
  }
};
UnsafeHTMLDirective.directiveName = "unsafeHTML";
UnsafeHTMLDirective.resultType = HTML_RESULT2;
var unsafeHTML = directive(UnsafeHTMLDirective);

// node_modules/lit-html/development/directives/unsafe-svg.js
var SVG_RESULT2 = 2;
var UnsafeSVGDirective = class extends UnsafeHTMLDirective {
};
UnsafeSVGDirective.directiveName = "unsafeSVG";
UnsafeSVGDirective.resultType = SVG_RESULT2;
var unsafeSVG = directive(UnsafeSVGDirective);

// node_modules/lit-html/development/directive-helpers.js
var { _ChildPart: ChildPart2 } = _$LH;
var ENABLE_SHADYDOM_NOPATCH2 = true;
var wrap2 = ENABLE_SHADYDOM_NOPATCH2 && window.ShadyDOM?.inUse && window.ShadyDOM?.noPatch === true ? window.ShadyDOM.wrap : (node) => node;
var isPrimitive2 = (value) => value === null || typeof value != "object" && typeof value != "function";
var isSingleExpression = (part) => part.strings === void 0;
var RESET_VALUE = {};
var setCommittedValue = (part, value = RESET_VALUE) => part._$committedValue = value;

// node_modules/lit-html/development/async-directive.js
var DEV_MODE6 = true;
var notifyChildrenConnectedChanged = (parent, isConnected) => {
  const children = parent._$disconnectableChildren;
  if (children === void 0) {
    return false;
  }
  for (const obj of children) {
    obj["_$notifyDirectiveConnectionChanged"]?.(isConnected, false);
    notifyChildrenConnectedChanged(obj, isConnected);
  }
  return true;
};
var removeDisconnectableFromParent = (obj) => {
  let parent, children;
  do {
    if ((parent = obj._$parent) === void 0) {
      break;
    }
    children = parent._$disconnectableChildren;
    children.delete(obj);
    obj = parent;
  } while (children?.size === 0);
};
var addDisconnectableToParent = (obj) => {
  for (let parent; parent = obj._$parent; obj = parent) {
    let children = parent._$disconnectableChildren;
    if (children === void 0) {
      parent._$disconnectableChildren = children = /* @__PURE__ */ new Set();
    } else if (children.has(obj)) {
      break;
    }
    children.add(obj);
    installDisconnectAPI(parent);
  }
};
function reparentDisconnectables(newParent) {
  if (this._$disconnectableChildren !== void 0) {
    removeDisconnectableFromParent(this);
    this._$parent = newParent;
    addDisconnectableToParent(this);
  } else {
    this._$parent = newParent;
  }
}
function notifyChildPartConnectedChanged(isConnected, isClearingValue = false, fromPartIndex = 0) {
  const value = this._$committedValue;
  const children = this._$disconnectableChildren;
  if (children === void 0 || children.size === 0) {
    return;
  }
  if (isClearingValue) {
    if (Array.isArray(value)) {
      for (let i = fromPartIndex; i < value.length; i++) {
        notifyChildrenConnectedChanged(value[i], false);
        removeDisconnectableFromParent(value[i]);
      }
    } else if (value != null) {
      notifyChildrenConnectedChanged(value, false);
      removeDisconnectableFromParent(value);
    }
  } else {
    notifyChildrenConnectedChanged(this, isConnected);
  }
}
var installDisconnectAPI = (obj) => {
  if (obj.type == PartType.CHILD) {
    obj._$notifyConnectionChanged ??= notifyChildPartConnectedChanged;
    obj._$reparentDisconnectables ??= reparentDisconnectables;
  }
};
var AsyncDirective = class extends Directive {
  constructor() {
    super(...arguments);
    this._$disconnectableChildren = void 0;
  }
  /**
   * Initialize the part with internal fields
   * @param part
   * @param parent
   * @param attributeIndex
   */
  _$initialize(part, parent, attributeIndex) {
    super._$initialize(part, parent, attributeIndex);
    addDisconnectableToParent(this);
    this.isConnected = part._$isConnected;
  }
  // This property needs to remain unminified.
  /**
   * Called from the core code when a directive is going away from a part (in
   * which case `shouldRemoveFromParent` should be true), and from the
   * `setChildrenConnected` helper function when recursively changing the
   * connection state of a tree (in which case `shouldRemoveFromParent` should
   * be false).
   *
   * @param isConnected
   * @param isClearingDirective - True when the directive itself is being
   *     removed; false when the tree is being disconnected
   * @internal
   */
  ["_$notifyDirectiveConnectionChanged"](isConnected, isClearingDirective = true) {
    if (isConnected !== this.isConnected) {
      this.isConnected = isConnected;
      if (isConnected) {
        this.reconnected?.();
      } else {
        this.disconnected?.();
      }
    }
    if (isClearingDirective) {
      notifyChildrenConnectedChanged(this, isConnected);
      removeDisconnectableFromParent(this);
    }
  }
  /**
   * Sets the value of the directive's Part outside the normal `update`/`render`
   * lifecycle of a directive.
   *
   * This method should not be called synchronously from a directive's `update`
   * or `render`.
   *
   * @param directive The directive to update
   * @param value The value to set
   */
  setValue(value) {
    if (isSingleExpression(this.__part)) {
      this.__part._$setValue(value, this);
    } else {
      if (DEV_MODE6 && this.__attributeIndex === void 0) {
        throw new Error(`Expected this.__attributeIndex to be a number`);
      }
      const newValues = [...this.__part._$committedValue];
      newValues[this.__attributeIndex] = value;
      this.__part._$setValue(newValues, this, 0);
    }
  }
  /**
   * User callbacks for implementing logic to release any resources/subscriptions
   * that may have been retained by this directive. Since directives may also be
   * re-connected, `reconnected` should also be implemented to restore the
   * working state of the directive prior to the next render.
   */
  disconnected() {
  }
  reconnected() {
  }
};

// node_modules/lit-html/development/directives/private-async-helpers.js
var PseudoWeakRef = class {
  constructor(ref2) {
    this._ref = ref2;
  }
  /**
   * Disassociates the ref with the backing instance.
   */
  disconnect() {
    this._ref = void 0;
  }
  /**
   * Reassociates the ref with the backing instance.
   */
  reconnect(ref2) {
    this._ref = ref2;
  }
  /**
   * Retrieves the backing instance (will be undefined when disconnected)
   */
  deref() {
    return this._ref;
  }
};
var Pauser = class {
  constructor() {
    this._promise = void 0;
    this._resolve = void 0;
  }
  /**
   * When paused, returns a promise to be awaited; when unpaused, returns
   * undefined. Note that in the microtask between the pauser being resumed
   * an await of this promise resolving, the pauser could be paused again,
   * hence callers should check the promise in a loop when awaiting.
   * @returns A promise to be awaited when paused or undefined
   */
  get() {
    return this._promise;
  }
  /**
   * Creates a promise to be awaited
   */
  pause() {
    this._promise ??= new Promise((resolve) => this._resolve = resolve);
  }
  /**
   * Resolves the promise which may be awaited
   */
  resume() {
    this._resolve?.();
    this._promise = this._resolve = void 0;
  }
};

// node_modules/lit-html/development/directives/until.js
var isPromise = (x) => {
  return !isPrimitive2(x) && typeof x.then === "function";
};
var _infinity = 1073741823;
var UntilDirective = class extends AsyncDirective {
  constructor() {
    super(...arguments);
    this.__lastRenderedIndex = _infinity;
    this.__values = [];
    this.__weakThis = new PseudoWeakRef(this);
    this.__pauser = new Pauser();
  }
  render(...args) {
    return args.find((x) => !isPromise(x)) ?? noChange;
  }
  update(_part, args) {
    const previousValues = this.__values;
    let previousLength = previousValues.length;
    this.__values = args;
    const weakThis = this.__weakThis;
    const pauser = this.__pauser;
    if (!this.isConnected) {
      this.disconnected();
    }
    for (let i = 0; i < args.length; i++) {
      if (i > this.__lastRenderedIndex) {
        break;
      }
      const value = args[i];
      if (!isPromise(value)) {
        this.__lastRenderedIndex = i;
        return value;
      }
      if (i < previousLength && value === previousValues[i]) {
        continue;
      }
      this.__lastRenderedIndex = _infinity;
      previousLength = 0;
      Promise.resolve(value).then(async (result) => {
        while (pauser.get()) {
          await pauser.get();
        }
        const _this = weakThis.deref();
        if (_this !== void 0) {
          const index = _this.__values.indexOf(value);
          if (index > -1 && index < _this.__lastRenderedIndex) {
            _this.__lastRenderedIndex = index;
            _this.setValue(result);
          }
        }
      });
    }
    return noChange;
  }
  disconnected() {
    this.__weakThis.disconnect();
    this.__pauser.pause();
  }
  reconnected() {
    this.__weakThis.reconnect(this);
    this.__pauser.resume();
  }
};
var until = directive(UntilDirective);

// node_modules/mdui/components/icon/style.js
var style = css`:host{display:inline-block;width:1em;height:1em;font-weight:400;font-family:'Material Icons';font-display:block;font-style:normal;line-height:1;direction:ltr;letter-spacing:normal;white-space:nowrap;text-transform:none;word-wrap:normal;-webkit-font-smoothing:antialiased;text-rendering:optimizelegibility;-moz-osx-font-smoothing:grayscale;font-size:1.5rem}::slotted(svg),svg{width:100%;height:100%;fill:currentcolor}`;

// node_modules/mdui/components/icon/index.js
var Icon = class Icon2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "[default]");
  }
  render() {
    const renderDefault = () => {
      if (this.name) {
        const [name, variant] = this.name.split("--");
        const familyMap = /* @__PURE__ */ new Map([
          ["outlined", "Material Icons Outlined"],
          ["filled", "Material Icons"],
          ["rounded", "Material Icons Round"],
          ["sharp", "Material Icons Sharp"],
          ["two-tone", "Material Icons Two Tone"]
        ]);
        return html`<span translate="no" style="${styleMap({ fontFamily: familyMap.get(variant) })}">${name}</span>`;
      }
      if (this.src) {
        return html`${until(ajax({ url: this.src }).then(unsafeSVG))}`;
      }
      return html``;
    };
    return this.hasSlotController.test("[default]") ? html`<slot></slot>` : renderDefault();
  }
};
Icon.styles = [componentStyle, style];
__decorate([
  property({ reflect: true })
], Icon.prototype, "name", void 0);
__decorate([
  property({ reflect: true })
], Icon.prototype, "src", void 0);
Icon = __decorate([
  customElement("mdui-icon")
], Icon);

// node_modules/mdui/components/avatar/style.js
var style2 = css`:host{--shape-corner:var(--mdui-shape-corner-full);position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;white-space:nowrap;vertical-align:middle;border-radius:var(--shape-corner);-webkit-user-select:none;user-select:none;width:2.5rem;height:2.5rem;background-color:rgb(var(--mdui-color-primary-container));color:rgb(var(--mdui-color-on-primary-container));font-size:var(--mdui-typescale-title-medium-size);font-weight:var(--mdui-typescale-title-medium-weight);letter-spacing:var(--mdui-typescale-title-medium-tracking);line-height:var(--mdui-typescale-title-medium-line-height)}img{width:100%;height:100%}::slotted(mdui-icon),mdui-icon{font-size:1.5em}`;

// node_modules/mdui/components/avatar/index.js
var Avatar = class Avatar2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "[default]");
  }
  render() {
    return this.hasSlotController.test("[default]") ? html`<slot></slot>` : this.src ? html`<img part="image" alt="${ifDefined(this.label)}" src="${this.src}" style="${styleMap({ objectFit: this.fit })}">` : this.icon ? html`<mdui-icon part="icon" name="${this.icon}"></mdui-icon>` : nothingTemplate;
  }
};
Avatar.styles = [componentStyle, style2];
__decorate([
  property({ reflect: true })
], Avatar.prototype, "src", void 0);
__decorate([
  property({ reflect: true })
], Avatar.prototype, "fit", void 0);
__decorate([
  property({ reflect: true })
], Avatar.prototype, "icon", void 0);
__decorate([
  property({ reflect: true })
], Avatar.prototype, "label", void 0);
Avatar = __decorate([
  customElement("mdui-avatar")
], Avatar);

// node_modules/mdui/components/badge/style.js
var style3 = css`:host{--shape-corner:var(--mdui-shape-corner-full);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:var(--shape-corner);padding-left:.25rem;padding-right:.25rem;color:rgb(var(--mdui-color-on-error));background-color:rgb(var(--mdui-color-error));height:1rem;min-width:1rem;font-size:var(--mdui-typescale-label-small-size);font-weight:var(--mdui-typescale-label-small-weight);letter-spacing:var(--mdui-typescale-label-small-tracking);line-height:var(--mdui-typescale-label-small-line-height)}:host([variant=small]){min-width:0;padding:0;width:.375rem;height:.375rem}`;

// node_modules/mdui/components/badge/index.js
var Badge = class Badge2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.variant = "large";
  }
  render() {
    if (this.variant === "small") {
      return nothingTemplate;
    }
    return html`<slot></slot>`;
  }
};
Badge.styles = [componentStyle, style3];
__decorate([
  property({ reflect: true })
], Badge.prototype, "variant", void 0);
Badge = __decorate([
  customElement("mdui-badge")
], Badge);

// node_modules/@mdui/shared/helpers/decorator.js
var booleanConverter = (value) => {
  return value !== null && value.toLowerCase() !== "false";
};

// node_modules/@mdui/shared/controllers/defined.js
var DefinedController = class {
  constructor(host, options) {
    this.defined = false;
    (this.host = host).addController(this);
    this.relatedElements = options.relatedElements;
    this.needDomReady = options.needDomReady || !!options.relatedElements;
    this.onSlotChange = this.onSlotChange.bind(this);
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.onSlotChange);
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.onSlotChange);
  }
  /**
   * 判断组件是否定义完成
   */
  isDefined() {
    if (this.defined) {
      return true;
    }
    this.defined = (!this.needDomReady || isDomReady()) && !this.getUndefinedLocalNames().length;
    return this.defined;
  }
  /**
   * 在组件定义完成后，promise 被 resolve
   */
  async whenDefined() {
    if (this.defined) {
      return Promise.resolve();
    }
    const document3 = getDocument();
    if (this.needDomReady && !isDomReady(document3)) {
      await new Promise((resolve) => {
        document3.addEventListener("DOMContentLoaded", () => resolve(), {
          once: true
        });
      });
    }
    const undefinedLocalNames = this.getUndefinedLocalNames();
    if (undefinedLocalNames.length) {
      const promises = [];
      undefinedLocalNames.forEach((localName) => {
        promises.push(customElements.whenDefined(localName));
      });
      await Promise.all(promises);
    }
    this.defined = true;
    return;
  }
  /**
   * slot 中的未完成定义的相关 Web components 组件的 CSS 选择器
   */
  getScopeLocalNameSelector() {
    const localNames = this.relatedElements;
    if (!localNames) {
      return null;
    }
    if (Array.isArray(localNames)) {
      return localNames.map((localName) => `${localName}:not(:defined)`).join(",");
    }
    return Object.keys(localNames).filter((localName) => !localNames[localName]).map((localName) => `${localName}:not(:defined)`).join(",");
  }
  /**
   * 整个页面中的未完成定义的相关 Web components 组件的 CSS 选择器
   */
  getGlobalLocalNameSelector() {
    const localNames = this.relatedElements;
    if (!localNames || Array.isArray(localNames)) {
      return null;
    }
    return Object.keys(localNames).filter((localName) => localNames[localName]).map((localName) => `${localName}:not(:defined)`).join(",");
  }
  /**
   * 获取未完成定义的相关 Web components 组件名
   */
  getUndefinedLocalNames() {
    const scopeSelector = this.getScopeLocalNameSelector();
    const globalSelector = this.getGlobalLocalNameSelector();
    const undefinedScopeElements = scopeSelector ? [...this.host.querySelectorAll(scopeSelector)] : [];
    const undefinedGlobalElements = globalSelector ? [...getDocument().querySelectorAll(globalSelector)] : [];
    const localNames = [
      ...undefinedScopeElements,
      ...undefinedGlobalElements
    ].map((element) => element.localName);
    return unique(localNames);
  }
  /**
   * slot 变更时，若 slot 中包含未完成定义的相关 Web components 组件，则组件未定义完成
   */
  onSlotChange() {
    const selector = this.getScopeLocalNameSelector();
    if (selector) {
      const undefinedElements = this.host.querySelectorAll(selector);
      if (undefinedElements.length) {
        this.defined = false;
      }
    }
  }
};

// node_modules/@mdui/shared/decorators/watch.js
function watch(propName, waitUntilFirstUpdate = false) {
  return (proto, functionName) => {
    const { update } = proto;
    if (propName in proto) {
      proto.update = function(changedProperties) {
        if (changedProperties.has(propName)) {
          const oldValue = changedProperties.get(propName);
          const newValue = this[propName];
          if (oldValue !== newValue) {
            if (!waitUntilFirstUpdate || this.hasUpdated) {
              this[functionName](oldValue, newValue);
            }
          }
        }
        update.call(this, changedProperties);
      };
    }
  };
}

// node_modules/@mdui/shared/mixins/scrollBehavior.js
var weakMap2 = /* @__PURE__ */ new WeakMap();
var ScrollBehaviorMixin = (superclass) => {
  class ScrollBehaviorMixinClass extends superclass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args) {
      super(...args);
      this.scrollBehaviorDefinedController = new DefinedController(this, {
        needDomReady: true
      });
      this.lastScrollTopThreshold = 0;
      this.lastScrollTopNoThreshold = 0;
      this.isParentLayout = false;
      this.onListeningScroll = this.onListeningScroll.bind(this);
    }
    /**
     * 滚动时，如果需要给 container 添加 padding，添加在顶部还是底部
     */
    get scrollPaddingPosition() {
      throw new Error("Must implement scrollPaddingPosition getter");
    }
    async onScrollTargetChange(oldValue, newValue) {
      const hasUpdated = this.hasUpdated;
      await this.scrollBehaviorDefinedController.whenDefined();
      if (hasUpdated) {
        this.setContainerPadding("remove", oldValue);
        this.setContainerPadding("add", newValue);
      }
      if (!this.scrollBehavior) {
        return;
      }
      const oldListening = this.getListening(oldValue);
      if (oldListening) {
        oldListening.removeEventListener("scroll", this.onListeningScroll);
      }
      const newListening = this.getListening(newValue);
      if (newListening) {
        this.updateScrollTop(newListening);
        newListening.addEventListener("scroll", this.onListeningScroll);
      }
    }
    async onScrollBehaviorChange() {
      await this.scrollBehaviorDefinedController.whenDefined();
      const listening = this.getListening(this.scrollTarget);
      if (!listening) {
        return;
      }
      if (this.scrollBehavior) {
        this.updateScrollTop(listening);
        listening.addEventListener("scroll", this.onListeningScroll);
      } else {
        listening.removeEventListener("scroll", this.onListeningScroll);
      }
    }
    connectedCallback() {
      super.connectedCallback();
      this.scrollBehaviorDefinedController.whenDefined().then(() => {
        this.isParentLayout = isNodeName(this.parentElement, "mdui-layout");
        this.setContainerPadding("add", this.scrollTarget);
      });
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.scrollBehaviorDefinedController.whenDefined().then(() => {
        this.setContainerPadding("remove", this.scrollTarget);
      });
    }
    /**
     * scrollBehavior 包含多个滚动行为，用空格分割
     * 用该方法判断指定滚动行为是否在 scrollBehavior 中
     * @param behavior 为数组时，只要其中一个行为在 scrollBehavior 中，即返回 `true`
     */
    hasScrollBehavior(behavior) {
      const behaviors = this.scrollBehavior?.split(" ") ?? [];
      if (Array.isArray(behavior)) {
        return !!behaviors.filter((v) => behavior.includes(v)).length;
      } else {
        return behaviors.includes(behavior);
      }
    }
    /**
     * 执行滚动事件，在滚动距离超过 scrollThreshold 时才会执行
     * Note: 父类可以按需实现该方法
     * @param _isScrollingUp 是否向上滚动
     * @param _scrollTop 距离 scrollTarget 顶部的距离
     */
    runScrollThreshold(_isScrollingUp, _scrollTop) {
      return;
    }
    /**
     * 执行滚动事件，会无视 scrollThreshold，始终会执行
     * @param _isScrollingUp 是否向上滚动
     * @param _scrollTop 距离 scrollTarget 顶部的距离
     */
    runScrollNoThreshold(_isScrollingUp, _scrollTop) {
      return;
    }
    /**
     * 更新滚动容器的 padding，避免内容被 navigation-bar 覆盖
     * @param action 新增、更新、移除 padding
     * @param scrollTarget 在该元素上添加、更新或移除 padding
     */
    setContainerPadding(action, scrollTarget) {
      const container = this.getContainer(scrollTarget);
      if (!container || this.isParentLayout) {
        return;
      }
      const position = this.scrollPaddingPosition;
      const propName = position === "top" ? "paddingTop" : "paddingBottom";
      if (action === "add" || action === "update") {
        const propValue = ["fixed", "absolute"].includes($(this).css("position")) ? this.offsetHeight : null;
        $(container).css({ [propName]: propValue });
        if (action === "add" && propValue !== null) {
          const options = weakMap2.get(container) ?? { top: [], bottom: [] };
          options[position].push(this);
          weakMap2.set(container, options);
        }
      }
      if (action === "remove") {
        const options = weakMap2.get(container);
        if (!options) {
          return;
        }
        const index = options[position].indexOf(this);
        if (index > -1) {
          options[position].splice(index, 1);
          weakMap2.set(container, options);
        }
        if (!options[position].length) {
          $(container).css({ [propName]: null });
        }
      }
    }
    onListeningScroll() {
      const listening = this.getListening(this.scrollTarget);
      window.requestAnimationFrame(() => this.onScroll(listening));
    }
    /**
     * 滚动事件，这里过滤掉不符合条件的滚动
     */
    onScroll(listening) {
      const scrollTop = listening.scrollY ?? listening.scrollTop;
      if (this.lastScrollTopNoThreshold !== scrollTop) {
        this.runScrollNoThreshold(scrollTop < this.lastScrollTopNoThreshold, scrollTop);
        this.lastScrollTopNoThreshold = scrollTop;
      }
      if (Math.abs(scrollTop - this.lastScrollTopThreshold) > (this.scrollThreshold || 0)) {
        this.runScrollThreshold(scrollTop < this.lastScrollTopThreshold, scrollTop);
        this.lastScrollTopThreshold = scrollTop;
      }
    }
    /**
     * 重新更新 lastScrollTopThreshold、lastScrollTopNoThreshold 的值
     * 用于在 scrollTarget、scrollBehavior 变更时，重新设置 lastScrollTopThreshold、lastScrollTopNoThreshold 的初始值
     */
    updateScrollTop(listening) {
      this.lastScrollTopThreshold = this.lastScrollTopNoThreshold = listening.scrollY ?? listening.scrollTop;
    }
    /**
     * 获取组件需要监听哪个元素的滚动状态
     */
    getListening(target) {
      return target ? $(target)[0] : window;
    }
    /**
     * 获取组件在哪个容器内滚动
     */
    getContainer(target) {
      return target ? $(target)[0] : document.body;
    }
  }
  __decorate([
    property({ attribute: "scroll-target" })
  ], ScrollBehaviorMixinClass.prototype, "scrollTarget", void 0);
  __decorate([
    property({ reflect: true, attribute: "scroll-behavior" })
  ], ScrollBehaviorMixinClass.prototype, "scrollBehavior", void 0);
  __decorate([
    property({ type: Number, reflect: true, attribute: "scroll-threshold" })
  ], ScrollBehaviorMixinClass.prototype, "scrollThreshold", void 0);
  __decorate([
    watch("scrollTarget")
  ], ScrollBehaviorMixinClass.prototype, "onScrollTargetChange", null);
  __decorate([
    watch("scrollBehavior")
  ], ScrollBehaviorMixinClass.prototype, "onScrollBehaviorChange", null);
  return ScrollBehaviorMixinClass;
};

// node_modules/@mdui/shared/helpers/uniqueId.js
var id = 0;
var uniqueId = () => {
  return ++id;
};

// node_modules/@mdui/shared/helpers/observeResize.js
var weakMap3;
var observer;
var observeResize = (target, callback) => {
  const $target = $(target);
  const key = uniqueId();
  const result = {
    unobserve: () => {
      $target.each((_, target2) => {
        const options = weakMap3.get(target2);
        const index = options.coArr.findIndex((co) => co.key === key);
        if (index !== -1) {
          options.coArr.splice(index, 1);
        }
        if (!options.coArr.length) {
          observer.unobserve(target2);
          weakMap3.delete(target2);
        } else {
          weakMap3.set(target2, options);
        }
      });
    }
  };
  if (!weakMap3) {
    weakMap3 = /* @__PURE__ */ new WeakMap();
    observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const target2 = entry.target;
        const options = weakMap3.get(target2);
        options.entry = entry;
        options.coArr.forEach((co) => {
          co.callback.call(result, entry, result);
        });
      });
    });
  }
  $target.each((_, target2) => {
    const options = weakMap3.get(target2) ?? { coArr: [] };
    if (options.coArr.length && options.entry) {
      callback.call(result, options.entry, result);
    }
    options.coArr.push({ callback, key });
    weakMap3.set(target2, options);
    observer.observe(target2);
  });
  return result;
};

// node_modules/mdui/components/layout/helper.js
var LayoutManager = class {
  constructor() {
    this.states = [];
  }
  /**
   * 注册 `<mdui-layout-main>`
   */
  registerMain(element) {
    this.$main = $(element);
  }
  /**
   * 取消注册 `<mdui-layout-main>`
   */
  unregisterMain() {
    this.$main = void 0;
  }
  /**
   * 注册新的 `<mdui-layout-item>`
   */
  registerItem(element) {
    const state2 = { element };
    this.states.push(state2);
    state2.observeResize = observeResize(state2.element, () => {
      this.updateLayout(state2.element, {
        width: this.isNoWidth(state2) ? 0 : void 0
      });
    });
    this.items = void 0;
    this.resort();
    this.updateLayout();
  }
  /**
   * 取消注册 `<mdui-layout-item>`
   */
  unregisterItem(element) {
    const index = this.states.findIndex((item2) => item2.element === element);
    if (index < 0) {
      return;
    }
    const item = this.states[index];
    item.observeResize?.unobserve();
    this.items = void 0;
    this.states.splice(index, 1);
    if (this.states[index]) {
      this.updateLayout(this.states[index].element);
    }
  }
  /**
   * 获取所有 `<mdui-layout-item>` 元素（按在 DOM 中的顺序）
   */
  getItems() {
    if (!this.items) {
      const items = this.states.map((state2) => state2.element);
      this.items = items.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    return this.items;
  }
  /**
   * 获取 `<mdui-layout-main>` 元素
   */
  getMain() {
    return this.$main ? this.$main[0] : void 0;
  }
  /**
   * 获取 `<mdui-layout-item>` 及 `<mdui-layout-main>` 元素
   */
  getItemsAndMain() {
    return [...this.getItems(), this.getMain()].filter((i) => i);
  }
  /**
   * 更新 `order` 值，更新完后重新计算布局
   */
  updateOrder() {
    this.resort();
    this.updateLayout();
  }
  /**
   * 重新计算布局
   * @param element 从哪一个元素开始更新；若未传入参数，则将更新所有元素
   * @param size 此次更新中，元素的宽高（仅在此次更新中使用）。若不传则自动计算
   */
  updateLayout(element, size) {
    const state2 = element ? {
      element,
      width: size?.width,
      height: size?.height
    } : void 0;
    const index = state2 ? this.states.findIndex((v) => v.element === state2.element) : 0;
    if (index < 0) {
      return;
    }
    Object.assign(this.states[index], state2);
    this.states.forEach((currState, currIndex) => {
      if (currIndex < index) {
        return;
      }
      const placement = currState.element.layoutPlacement;
      const prevState = currIndex > 0 ? this.states[currIndex - 1] : void 0;
      const top = prevState?.top ?? 0;
      const right = prevState?.right ?? 0;
      const bottom = prevState?.bottom ?? 0;
      const left = prevState?.left ?? 0;
      Object.assign(currState, { top, right, bottom, left });
      switch (placement) {
        case "top":
        case "bottom":
          currState[placement] += currState.height ?? currState.element.offsetHeight;
          break;
        case "right":
        case "left":
          currState[placement] += (this.isNoWidth(currState) ? 0 : currState.width) ?? currState.element.offsetWidth;
          break;
      }
      currState.height = currState.width = void 0;
      $(currState.element).css({
        position: "absolute",
        top: placement === "bottom" ? null : top,
        right: placement === "left" ? null : right,
        bottom: placement === "top" ? null : bottom,
        left: placement === "right" ? null : left
      });
    });
    const lastState = this.states[this.states.length - 1];
    if (this.$main) {
      this.$main.css({
        paddingTop: lastState.top,
        paddingRight: lastState.right,
        paddingBottom: lastState.bottom,
        paddingLeft: lastState.left
      });
    }
  }
  /**
   * 按 order 排序，order 相同时，按在 DOM 中的顺序排序
   */
  resort() {
    const items = this.getItems();
    this.states.sort((a, b) => {
      const aOrder = a.element.order ?? 0;
      const bOrder = b.element.order ?? 0;
      if (aOrder > bOrder) {
        return 1;
      }
      if (aOrder < bOrder) {
        return -1;
      }
      if (items.indexOf(a.element) > items.indexOf(b.element)) {
        return 1;
      }
      if (items.indexOf(a.element) < items.indexOf(b.element)) {
        return -1;
      }
      return 0;
    });
  }
  /**
   * 组件宽度是否为 0
   * mdui-navigation-drawer 较为特殊，在为模态化时，占据的宽度为 0
   */
  isNoWidth(state2) {
    return isNodeName(state2.element, "mdui-navigation-drawer") && // @ts-ignore
    state2.element.isModal;
  }
};
var layoutManagerMap = /* @__PURE__ */ new WeakMap();
var getLayout = (element) => {
  if (!layoutManagerMap.has(element)) {
    layoutManagerMap.set(element, new LayoutManager());
  }
  return layoutManagerMap.get(element);
};

// node_modules/mdui/components/layout/layout-item-base.js
var LayoutItemBase = class extends MduiElement {
  constructor() {
    super(...arguments);
    this.isParentLayout = false;
  }
  /**
   * 当前布局组件所处的位置，父类必须实现该 getter
   */
  get layoutPlacement() {
    throw new Error("Must implement placement getter!");
  }
  // order 变更时，需要重新调整布局
  onOrderChange() {
    this.layoutManager?.updateOrder();
  }
  connectedCallback() {
    super.connectedCallback();
    const parentElement = this.parentElement;
    this.isParentLayout = isNodeName(parentElement, "mdui-layout");
    if (this.isParentLayout) {
      this.layoutManager = getLayout(parentElement);
      this.layoutManager.registerItem(this);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.layoutManager) {
      this.layoutManager.unregisterItem(this);
    }
  }
};
__decorate([
  property({ type: Number, reflect: true })
], LayoutItemBase.prototype, "order", void 0);
__decorate([
  watch("order", true)
], LayoutItemBase.prototype, "onOrderChange", null);

// node_modules/mdui/components/bottom-app-bar/style.js
var style4 = css`:host{--shape-corner:var(--mdui-shape-corner-none);--z-index:2000;position:fixed;right:0;bottom:0;left:0;display:flex;flex:0 0 auto;align-items:center;justify-content:flex-start;border-radius:var(--shape-corner) var(--shape-corner) 0 0;z-index:var(--z-index);transition:bottom var(--mdui-motion-duration-long2) var(--mdui-motion-easing-emphasized);padding:0 1rem;height:5rem;background-color:rgb(var(--mdui-color-surface-container));box-shadow:var(--mdui-elevation-level2)}:host([scroll-target]:not([scroll-target=''])){position:absolute}:host([hide]:not([hide=false i])){transition-duration:var(--mdui-motion-duration-short4);bottom:-5.625rem}::slotted(:not(:first-child)){margin-left:.5rem}::slotted(mdui-fab){box-shadow:var(--mdui-elevation-level0)}:host([fab-detach]:not([fab-detach=false i])) ::slotted(mdui-fab){position:absolute;transition:bottom var(--mdui-motion-duration-long2) var(--mdui-motion-easing-standard);right:1rem;bottom:.75rem}:host([fab-detach][hide][scroll-behavior~=hide]:not([hide=false i],[fab-detach=false i])) ::slotted(mdui-fab){transition-duration:var(--mdui-motion-duration-short4);bottom:1rem;box-shadow:var(--mdui-elevation-level2)}:host([fab-detach][hide][scroll-behavior~=hide][scroll-target]:not([fab-detach=false i],[hide=false i],[scroll-target=''])) ::slotted(mdui-fab){bottom:6.625rem}:host([hide]:not([hide=false i])) ::slotted(:not(mdui-fab)),:host([hide]:not([hide=false i],[fab-detach])) ::slotted(mdui-fab),:host([hide][fab-detach=false i]:not([hide=false i])) ::slotted(mdui-fab){transform:translateY(8.75rem);transition:transform var(--mdui-motion-duration-0) var(--mdui-motion-easing-emphasized-accelerate) var(--mdui-motion-duration-short4)}::slotted(:first-child){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-short1)}::slotted(:nth-child(2)){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-short3)}::slotted(:nth-child(3)){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-short4)}::slotted(:nth-child(4)){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-medium1)}::slotted(:nth-child(5)){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-medium2)}::slotted(:nth-child(6)){transition:transform var(--mdui-motion-duration-short3) var(--mdui-motion-easing-emphasized-decelerate) var(--mdui-motion-duration-medium3)}`;

// node_modules/mdui/components/bottom-app-bar/index.js
var BottomAppBar = class BottomAppBar2 extends ScrollBehaviorMixin(LayoutItemBase) {
  constructor() {
    super(...arguments);
    this.hide = false;
    this.fabDetach = false;
  }
  get scrollPaddingPosition() {
    return "bottom";
  }
  get layoutPlacement() {
    return "bottom";
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("transitionend", (event) => {
      if (event.target === this) {
        this.emit(this.hide ? "hidden" : "shown");
      }
    });
  }
  render() {
    return html`<slot></slot>`;
  }
  /**
   * 滚动行为
   * 当前仅支持 hide 这一个行为，所以不做行为类型判断
   */
  runScrollThreshold(isScrollingUp) {
    if (!isScrollingUp && !this.hide) {
      const eventProceeded = this.emit("hide", { cancelable: true });
      if (eventProceeded) {
        this.hide = true;
      }
    }
    if (isScrollingUp && this.hide) {
      const eventProceeded = this.emit("show", { cancelable: true });
      if (eventProceeded) {
        this.hide = false;
      }
    }
  }
};
BottomAppBar.styles = [componentStyle, style4];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], BottomAppBar.prototype, "hide", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "fab-detach"
  })
], BottomAppBar.prototype, "fabDetach", void 0);
__decorate([
  property({ reflect: true, attribute: "scroll-behavior" })
], BottomAppBar.prototype, "scrollBehavior", void 0);
BottomAppBar = __decorate([
  customElement("mdui-bottom-app-bar")
], BottomAppBar);

// node_modules/lit-html/development/directives/ref.js
var createRef = () => new Ref();
var Ref = class {
};
var lastElementForContextAndCallback = /* @__PURE__ */ new WeakMap();
var RefDirective = class extends AsyncDirective {
  render(_ref) {
    return nothing;
  }
  update(part, [ref2]) {
    const refChanged = ref2 !== this._ref;
    if (refChanged && this._ref !== void 0) {
      this._updateRefValue(void 0);
    }
    if (refChanged || this._lastElementForRef !== this._element) {
      this._ref = ref2;
      this._context = part.options?.host;
      this._updateRefValue(this._element = part.element);
    }
    return nothing;
  }
  _updateRefValue(element) {
    if (!this.isConnected) {
      element = void 0;
    }
    if (typeof this._ref === "function") {
      const context = this._context ?? globalThis;
      let lastElementForCallback = lastElementForContextAndCallback.get(context);
      if (lastElementForCallback === void 0) {
        lastElementForCallback = /* @__PURE__ */ new WeakMap();
        lastElementForContextAndCallback.set(context, lastElementForCallback);
      }
      if (lastElementForCallback.get(this._ref) !== void 0) {
        this._ref.call(this._context, void 0);
      }
      lastElementForCallback.set(this._ref, element);
      if (element !== void 0) {
        this._ref.call(this._context, element);
      }
    } else {
      this._ref.value = element;
    }
  }
  get _lastElementForRef() {
    return typeof this._ref === "function" ? lastElementForContextAndCallback.get(this._context ?? globalThis)?.get(this._ref) : this._ref?.value;
  }
  disconnected() {
    if (this._lastElementForRef === this._element) {
      this._updateRefValue(void 0);
    }
  }
  reconnected() {
    this._updateRefValue(this._element);
  }
};
var ref = directive(RefDirective);

// node_modules/classcat/index.js
function cc(names) {
  if (typeof names === "string" || typeof names === "number") return "" + names;
  let out = "";
  if (Array.isArray(names)) {
    for (let i = 0, tmp; i < names.length; i++) {
      if ((tmp = cc(names[i])) !== "") {
        out += (out && " ") + tmp;
      }
    }
  } else {
    for (let k in names) {
      if (names[k]) out += (out && " ") + k;
    }
  }
  return out;
}

// node_modules/@mdui/shared/controllers/form.js
var reportValidityOverloads = /* @__PURE__ */ new WeakMap();
var formResets = /* @__PURE__ */ new WeakMap();
var FormController = class {
  constructor(host, options) {
    (this.host = host).addController(this);
    this.definedController = new DefinedController(host, {
      needDomReady: true
    });
    this.options = {
      form: (control) => {
        const formId = $(control).attr("form");
        if (formId) {
          const root = control.getRootNode();
          return root.getElementById(formId);
        }
        return control.closest("form");
      },
      name: (control) => control.name,
      value: (control) => control.value,
      defaultValue: (control) => control.defaultValue,
      setValue: (control, value) => control.value = value,
      disabled: (control) => control.disabled,
      reportValidity: (control) => isFunction(control.reportValidity) ? control.reportValidity() : true,
      ...options
    };
    this.onFormData = this.onFormData.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFormReset = this.onFormReset.bind(this);
    this.reportFormValidity = this.reportFormValidity.bind(this);
  }
  hostConnected() {
    this.definedController.whenDefined().then(() => {
      this.form = this.options.form(this.host);
      if (this.form) {
        this.attachForm(this.form);
      }
    });
  }
  hostDisconnected() {
    this.detachForm();
  }
  hostUpdated() {
    this.definedController.whenDefined().then(() => {
      const form = this.options.form(this.host);
      if (!form) {
        this.detachForm();
      }
      if (form && this.form !== form) {
        this.detachForm();
        this.attachForm(form);
      }
    });
  }
  /**
   * 获取当前表单控件关联的 `<form>` 元素
   */
  getForm() {
    return this.form ?? null;
  }
  /**
   * 重置整个表单，所有表单控件恢复成默认值
   */
  reset(invoker) {
    this.doAction("reset", invoker);
  }
  /**
   * 提交整个表单
   */
  submit(invoker) {
    this.doAction("submit", invoker);
  }
  attachForm(form) {
    if (!form) {
      this.form = void 0;
      return;
    }
    this.form = form;
    if (formCollections.has(this.form)) {
      formCollections.get(this.form).add(this.host);
    } else {
      formCollections.set(this.form, /* @__PURE__ */ new Set([this.host]));
    }
    this.form.addEventListener("formdata", this.onFormData);
    this.form.addEventListener("submit", this.onFormSubmit);
    this.form.addEventListener("reset", this.onFormReset);
    if (!reportValidityOverloads.has(this.form)) {
      reportValidityOverloads.set(this.form, this.form.reportValidity);
      this.form.reportValidity = () => this.reportFormValidity();
    }
  }
  detachForm() {
    if (this.form) {
      formCollections.get(this.form).delete(this.host);
      this.form.removeEventListener("formdata", this.onFormData);
      this.form.removeEventListener("submit", this.onFormSubmit);
      this.form.removeEventListener("reset", this.onFormReset);
      if (reportValidityOverloads.has(this.form) && !formCollections.get(this.form).size) {
        this.form.reportValidity = reportValidityOverloads.get(this.form);
        reportValidityOverloads.delete(this.form);
      }
    }
  }
  doAction(type, invoker) {
    if (!this.form) {
      return;
    }
    const $button = $(`<button type="${type}">`).css({
      position: "absolute",
      width: 0,
      height: 0,
      clipPath: "inset(50%)",
      overflow: "hidden",
      whiteSpace: "nowrap"
    });
    const button = $button[0];
    if (invoker) {
      button.name = invoker.name;
      button.value = invoker.value;
      [
        "formaction",
        "formenctype",
        "formmethod",
        "formnovalidate",
        "formtarget"
      ].forEach((attr) => {
        $button.attr(attr, $(invoker).attr(attr));
      });
    }
    this.form.append(button);
    button.click();
    button.remove();
  }
  onFormData(event) {
    const disabled = this.options.disabled(this.host);
    const name = this.options.name(this.host);
    const value = this.options.value(this.host);
    const isButton = [
      "mdui-button",
      "mdui-button-icon",
      "mdui-chip",
      "mdui-fab",
      "mdui-segmented-button"
    ].includes(this.host.tagName.toLowerCase());
    if (!disabled && !isButton && isString(name) && name && !isUndefined(value)) {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          event.formData.append(name, val.toString());
        });
      } else {
        event.formData.append(name, value.toString());
      }
    }
  }
  // todo: 当前组件进行验证的顺序，取决于组件的注册顺序，而不会按在 DOM 中的顺序从上到下验证。如何按 DOM 顺序验证？
  onFormSubmit(event) {
    const disabled = this.options.disabled(this.host);
    const reportValidity = this.options.reportValidity;
    if (this.form && !this.form.noValidate && !disabled && !reportValidity(this.host)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  onFormReset() {
    if (this.form) {
      this.options.setValue(this.host, this.options.defaultValue(this.host));
      this.host.invalid = false;
      if (formResets.has(this.form)) {
        formResets.get(this.form).add(this.host);
      } else {
        formResets.set(this.form, /* @__PURE__ */ new Set([this.host]));
      }
    }
  }
  reportFormValidity() {
    if (this.form && !this.form.noValidate) {
      const elements = getFormControls(this.form);
      for (const element of elements) {
        if (isFunction(element.reportValidity) && !element.reportValidity()) {
          return false;
        }
      }
    }
    return true;
  }
};

// node_modules/@mdui/shared/mixins/anchor.js
var AnchorMixin = (superclass) => {
  class AnchorMixinClass extends superclass {
    renderAnchor({ id: id2, className: className2, part, content = html`<slot></slot>`, refDirective, tabIndex }) {
      return html`<a ${refDirective} id="${ifDefined(id2)}" class="_a ${className2 ? className2 : ""}" part="${ifDefined(part)}" href="${ifDefined(this.href)}" download="${ifDefined(this.download)}" target="${ifDefined(this.target)}" rel="${ifDefined(this.rel)}" tabindex="${ifDefined(tabIndex)}">${content}</a>`;
    }
  }
  __decorate([
    property({ reflect: true })
  ], AnchorMixinClass.prototype, "href", void 0);
  __decorate([
    property({ reflect: true })
  ], AnchorMixinClass.prototype, "download", void 0);
  __decorate([
    property({ reflect: true })
  ], AnchorMixinClass.prototype, "target", void 0);
  __decorate([
    property({ reflect: true })
  ], AnchorMixinClass.prototype, "rel", void 0);
  return AnchorMixinClass;
};

// node_modules/@mdui/shared/mixins/focusable.js
var isClick = true;
var document2 = getDocument();
document2.addEventListener("pointerdown", () => {
  isClick = true;
});
document2.addEventListener("keydown", () => {
  isClick = false;
});
var FocusableMixin = (superclass) => {
  class FocusableMixinClass extends superclass {
    constructor() {
      super(...arguments);
      this.autofocus = false;
      this.focused = false;
      this.focusVisible = false;
      this.focusableDefinedController = new DefinedController(this, { relatedElements: [""] });
      this._manipulatingTabindex = false;
      this._tabIndex = 0;
    }
    /**
     * 元素在使用 Tab 键切换焦点时的顺序
     */
    get tabIndex() {
      const $this = $(this);
      if (this.focusElement === this) {
        return Number($this.attr("tabindex") || -1);
      }
      const tabIndexAttribute = Number($this.attr("tabindex") || 0);
      if (this.focusDisabled || tabIndexAttribute < 0) {
        return -1;
      }
      if (!this.focusElement) {
        return tabIndexAttribute;
      }
      return this.focusElement.tabIndex;
    }
    set tabIndex(tabIndex) {
      if (this._manipulatingTabindex) {
        this._manipulatingTabindex = false;
        return;
      }
      const $this = $(this);
      if (this.focusElement === this) {
        if (tabIndex !== null) {
          this._tabIndex = tabIndex;
        }
        $this.attr("tabindex", this.focusDisabled ? null : tabIndex);
        return;
      }
      const onPointerDown = () => {
        if (this.tabIndex === -1) {
          this.tabIndex = 0;
          this.focus({ preventScroll: true });
        }
      };
      if (tabIndex === -1) {
        this.addEventListener("pointerdown", onPointerDown);
      } else {
        this._manipulatingTabindex = true;
        this.removeEventListener("pointerdown", onPointerDown);
      }
      if (tabIndex === -1 || this.focusDisabled) {
        $this.attr("tabindex", -1);
        if (tabIndex !== -1) {
          this.manageFocusElementTabindex(tabIndex);
        }
        return;
      }
      if (!this.hasAttribute("tabindex")) {
        this._manipulatingTabindex = false;
      }
      this.manageFocusElementTabindex(tabIndex);
    }
    /**
     * 父类要实现该属性，表示是否禁用 focus 状态
     */
    get focusDisabled() {
      throw new Error("Must implement focusDisabled getter!");
    }
    /**
     * 最终获得焦点的元素
     */
    get focusElement() {
      throw new Error("Must implement focusElement getter!");
    }
    connectedCallback() {
      super.connectedCallback();
      this.updateComplete.then(() => {
        requestAnimationFrame(() => {
          this.manageAutoFocus();
        });
      });
    }
    /**
     * 模拟鼠标点击元素
     */
    click() {
      if (this.focusDisabled) {
        return;
      }
      if (this.focusElement !== this) {
        this.focusElement.click();
      } else {
        HTMLElement.prototype.click.apply(this);
      }
    }
    /**
     * 将焦点设置到当前元素。
     *
     * 可以传入一个对象作为参数，该对象的属性包括：
     *
     * * `preventScroll`：默认情况下，元素获取焦点后，页面会滚动以将该元素滚动到视图中。如果不希望页面滚动，可以将此属性设置为 `true`。
     */
    focus(options) {
      if (this.focusDisabled || !this.focusElement) {
        return;
      }
      if (this.focusElement !== this) {
        this.focusElement.focus(options);
      } else {
        HTMLElement.prototype.focus.apply(this, [options]);
      }
    }
    /**
     * 移除当前元素的焦点
     */
    blur() {
      if (this.focusElement !== this) {
        this.focusElement.blur();
      } else {
        HTMLElement.prototype.blur.apply(this);
      }
    }
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      this.focusElement.addEventListener("focus", () => {
        this.focused = true;
        this.focusVisible = !isClick;
      });
      this.focusElement.addEventListener("blur", () => {
        this.focused = false;
        this.focusVisible = false;
      });
    }
    update(changedProperties) {
      if (this._lastFocusDisabled === void 0 || this._lastFocusDisabled !== this.focusDisabled) {
        this._lastFocusDisabled = this.focusDisabled;
        const $this = $(this);
        if (this.focusDisabled) {
          $this.removeAttr("tabindex");
        } else {
          if (this.focusElement === this) {
            this._manipulatingTabindex = true;
            $this.attr("tabindex", this._tabIndex);
          } else if (this.tabIndex > -1) {
            $this.removeAttr("tabindex");
          }
        }
      }
      super.update(changedProperties);
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      if (this.focused && this.focusDisabled) {
        this.blur();
      }
    }
    async manageFocusElementTabindex(tabIndex) {
      if (!this.focusElement) {
        await this.updateComplete;
      }
      if (tabIndex === null) {
        this.focusElement.removeAttribute("tabindex");
      } else {
        this.focusElement.tabIndex = tabIndex;
      }
    }
    manageAutoFocus() {
      if (this.autofocus) {
        this.dispatchEvent(new KeyboardEvent("keydown", {
          code: "Tab"
        }));
        this.focusElement.focus();
      }
    }
  }
  __decorate([
    property({
      type: Boolean,
      /**
       * 哪些属性需要 reflect: true？
       * 一般所有属性都需要 reflect，但以下情况除外：
       * 1. 会频繁变更的属性
       * 2. 属性同步会造成较大性能开销的属性
       * 3. 复杂类型属性（数组、对象等，仅提供 property，不提供 attribute）
       */
      reflect: true,
      converter: booleanConverter
    })
  ], FocusableMixinClass.prototype, "autofocus", void 0);
  __decorate([
    property({
      type: Boolean,
      reflect: true,
      converter: booleanConverter
    })
  ], FocusableMixinClass.prototype, "focused", void 0);
  __decorate([
    property({
      type: Boolean,
      reflect: true,
      converter: booleanConverter,
      attribute: "focus-visible"
    })
  ], FocusableMixinClass.prototype, "focusVisible", void 0);
  __decorate([
    property({ type: Number, attribute: "tabindex" })
  ], FocusableMixinClass.prototype, "tabIndex", null);
  return FocusableMixinClass;
};

// node_modules/lit-html/development/directives/class-map.js
var ClassMapDirective = class extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ATTRIBUTE || partInfo.name !== "class" || partInfo.strings?.length > 2) {
      throw new Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
    }
  }
  render(classInfo) {
    return " " + Object.keys(classInfo).filter((key) => classInfo[key]).join(" ") + " ";
  }
  update(part, [classInfo]) {
    if (this._previousClasses === void 0) {
      this._previousClasses = /* @__PURE__ */ new Set();
      if (part.strings !== void 0) {
        this._staticClasses = new Set(part.strings.join(" ").split(/\s/).filter((s2) => s2 !== ""));
      }
      for (const name in classInfo) {
        if (classInfo[name] && !this._staticClasses?.has(name)) {
          this._previousClasses.add(name);
        }
      }
      return this.render(classInfo);
    }
    const classList = part.element.classList;
    for (const name of this._previousClasses) {
      if (!(name in classInfo)) {
        classList.remove(name);
        this._previousClasses.delete(name);
      }
    }
    for (const name in classInfo) {
      const value = !!classInfo[name];
      if (value !== this._previousClasses.has(name) && !this._staticClasses?.has(name)) {
        if (value) {
          classList.add(name);
          this._previousClasses.add(name);
        } else {
          classList.remove(name);
          this._previousClasses.delete(name);
        }
      }
    }
    return noChange;
  }
};
var classMap = directive(ClassMapDirective);

// node_modules/mdui/components/circular-progress/style.js
var style5 = css`:host{position:relative;display:inline-block;flex-shrink:0;width:2.5rem;height:2.5rem;stroke:rgb(var(--mdui-color-primary))}.progress{position:relative;display:inline-block;width:100%;height:100%;text-align:left;transition:opacity var(--mdui-motion-duration-medium1) var(--mdui-motion-easing-linear)}.determinate svg{transform:rotate(-90deg);fill:transparent}.determinate .track{stroke:transparent}.determinate .circle{stroke:inherit;transition:stroke-dashoffset var(--mdui-motion-duration-long2) var(--mdui-motion-easing-standard)}.indeterminate{font-size:0;letter-spacing:0;white-space:nowrap;animation:mdui-comp-circular-progress-rotate 1568ms var(--mdui-motion-easing-linear) infinite}.indeterminate .circle,.indeterminate .layer{position:absolute;width:100%;height:100%}.indeterminate .layer{animation:mdui-comp-circular-progress-layer-rotate 5332ms var(--mdui-motion-easing-standard) infinite both}.indeterminate .circle{fill:transparent;stroke:inherit}.indeterminate .gap-patch{position:absolute;top:0;left:47.5%;width:5%;height:100%;overflow:hidden}.indeterminate .gap-patch .circle{left:-900%;width:2000%;transform:rotate(180deg)}.indeterminate .clipper{position:relative;display:inline-block;width:50%;height:100%;overflow:hidden}.indeterminate .clipper .circle{width:200%}.indeterminate .clipper.left .circle{animation:mdui-comp-circular-progress-left-spin 1333ms var(--mdui-motion-easing-standard) infinite both}.indeterminate .clipper.right .circle{left:-100%;animation:mdui-comp-circular-progress-right-spin 1333ms var(--mdui-motion-easing-standard) infinite both}@keyframes mdui-comp-circular-progress-rotate{to{transform:rotate(360deg)}}@keyframes mdui-comp-circular-progress-layer-rotate{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes mdui-comp-circular-progress-left-spin{0%{transform:rotate(265deg)}50%{transform:rotate(130deg)}100%{transform:rotate(265deg)}}@keyframes mdui-comp-circular-progress-right-spin{0%{transform:rotate(-265deg)}50%{transform:rotate(-130deg)}100%{transform:rotate(-265deg)}}`;

// node_modules/mdui/components/circular-progress/index.js
var CircularProgress = class CircularProgress2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.max = 1;
  }
  render() {
    const isDeterminate = !isUndefined(this.value);
    return html`<div class="progress ${classMap({
      determinate: isDeterminate,
      indeterminate: !isDeterminate
    })}">${isDeterminate ? this.renderDeterminate() : this.renderInDeterminate()}</div>`;
  }
  renderDeterminate() {
    const value = this.value;
    const strokeWidth = 4;
    const circleRadius = 18;
    const \u03C0 = 3.1415926;
    const center = circleRadius + strokeWidth / 2;
    const circumference = 2 * \u03C0 * circleRadius;
    const determinateStrokeDashOffset = (1 - value / Math.max(this.max ?? value, value)) * circumference;
    return html`<svg viewBox="0 0 ${center * 2} ${center * 2}"><circle class="track" cx="${center}" cy="${center}" r="${circleRadius}" stroke-width="${strokeWidth}"></circle><circle class="circle" cx="${center}" cy="${center}" r="${circleRadius}" stroke-dasharray="${2 * \u03C0 * circleRadius}" stroke-dashoffset="${determinateStrokeDashOffset}" stroke-width="${strokeWidth}"></circle></svg>`;
  }
  renderInDeterminate() {
    const strokeWidth = 4;
    const circleRadius = 18;
    const \u03C0 = 3.1415926;
    const center = circleRadius + strokeWidth / 2;
    const circumference = 2 * \u03C0 * circleRadius;
    const halfCircumference = 0.5 * circumference;
    const circle = (thisStrokeWidth) => html`<svg class="circle" viewBox="0 0 ${center * 2} ${center * 2}"><circle cx="${center}" cy="${center}" r="${circleRadius}" stroke-dasharray="${circumference}" stroke-dashoffset="${halfCircumference}" stroke-width="${thisStrokeWidth}"></circle></svg>`;
    return html`<div class="layer"><div class="clipper left">${circle(strokeWidth)}</div><div class="gap-patch">${circle(strokeWidth * 0.8)}</div><div class="clipper right">${circle(strokeWidth)}</div></div>`;
  }
};
CircularProgress.styles = [componentStyle, style5];
__decorate([
  property({ type: Number, reflect: true })
], CircularProgress.prototype, "max", void 0);
__decorate([
  property({ type: Number })
], CircularProgress.prototype, "value", void 0);
CircularProgress = __decorate([
  customElement("mdui-circular-progress")
], CircularProgress);

// node_modules/mdui/components/ripple/style.js
var style6 = css`:host{position:absolute;top:0;left:0;display:block;width:100%;height:100%;overflow:hidden;pointer-events:none}.surface{position:absolute;top:0;left:0;width:100%;height:100%;transition-duration:280ms;transition-property:background-color;pointer-events:none;transition-timing-function:var(--mdui-motion-easing-standard)}.hover{background-color:rgba(var(--mdui-comp-ripple-state-layer-color,var(--mdui-color-on-surface)),var(--mdui-state-layer-hover))}:host-context([focus-visible]) .focused{background-color:rgba(var(--mdui-comp-ripple-state-layer-color,var(--mdui-color-on-surface)),var(--mdui-state-layer-focus))}.dragged{background-color:rgba(var(--mdui-comp-ripple-state-layer-color,var(--mdui-color-on-surface)),var(--mdui-state-layer-dragged))}.wave{position:absolute;z-index:1;background-color:rgb(var(--mdui-comp-ripple-state-layer-color,var(--mdui-color-on-surface)));border-radius:50%;transform:translate3d(0,0,0) scale(.4);opacity:0;animation:225ms ease 0s 1 normal forwards running mdui-comp-ripple-radius-in,75ms ease 0s 1 normal forwards running mdui-comp-ripple-opacity-in;pointer-events:none}.out{transform:translate3d(var(--mdui-comp-ripple-transition-x,0),var(--mdui-comp-ripple-transition-y,0),0) scale(1);animation:150ms ease 0s 1 normal none running mdui-comp-ripple-opacity-out}@keyframes mdui-comp-ripple-radius-in{from{transform:translate3d(0,0,0) scale(.4);animation-timing-function:var(--mdui-motion-easing-standard)}to{transform:translate3d(var(--mdui-comp-ripple-transition-x,0),var(--mdui-comp-ripple-transition-y,0),0) scale(1)}}@keyframes mdui-comp-ripple-opacity-in{from{opacity:0;animation-timing-function:linear}to{opacity:var(--mdui-state-layer-pressed)}}@keyframes mdui-comp-ripple-opacity-out{from{animation-timing-function:linear;opacity:var(--mdui-state-layer-pressed)}to{opacity:0}}`;

// node_modules/mdui/components/ripple/index.js
var Ripple = class Ripple2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.noRipple = false;
    this.hover = false;
    this.focused = false;
    this.dragged = false;
    this.surfaceRef = createRef();
  }
  startPress(event) {
    if (this.noRipple) {
      return;
    }
    const $surface = $(this.surfaceRef.value);
    const surfaceHeight = $surface.innerHeight();
    const surfaceWidth = $surface.innerWidth();
    let touchStartX;
    let touchStartY;
    if (!event) {
      touchStartX = surfaceWidth / 2;
      touchStartY = surfaceHeight / 2;
    } else {
      const touchPosition = typeof TouchEvent !== "undefined" && event instanceof TouchEvent && event.touches.length ? event.touches[0] : event;
      const offset2 = $surface.offset();
      if (touchPosition.pageX < offset2.left || touchPosition.pageX > offset2.left + surfaceWidth || touchPosition.pageY < offset2.top || touchPosition.pageY > offset2.top + surfaceHeight) {
        return;
      }
      touchStartX = touchPosition.pageX - offset2.left;
      touchStartY = touchPosition.pageY - offset2.top;
    }
    const diameter = Math.max(Math.pow(Math.pow(surfaceHeight, 2) + Math.pow(surfaceWidth, 2), 0.5), 48);
    const translateX = `${-touchStartX + surfaceWidth / 2}px`;
    const translateY = `${-touchStartY + surfaceHeight / 2}px`;
    const translate = `translate3d(${translateX}, ${translateY}, 0) scale(1)`;
    $('<div class="wave"></div>').css({
      width: diameter,
      height: diameter,
      marginTop: -diameter / 2,
      marginLeft: -diameter / 2,
      left: touchStartX,
      top: touchStartY
    }).each((_, wave) => {
      wave.style.setProperty("--mdui-comp-ripple-transition-x", translateX);
      wave.style.setProperty("--mdui-comp-ripple-transition-y", translateY);
    }).prependTo(this.surfaceRef.value).each((_, wave) => wave.clientLeft).css("transform", translate).on("animationend", function(e) {
      const event2 = e;
      if (event2.animationName === "mdui-comp-ripple-radius-in") {
        $(this).data("filled", true);
      }
    });
  }
  endPress() {
    const $waves = $(this.surfaceRef.value).children().filter((_, wave) => !$(wave).data("removing")).data("removing", true);
    const hideAndRemove = ($waves2) => {
      $waves2.addClass("out").each((_, wave) => wave.clientLeft).on("animationend", function() {
        $(this).remove();
      });
    };
    $waves.filter((_, wave) => !$(wave).data("filled")).on("animationend", function(e) {
      const event = e;
      if (event.animationName === "mdui-comp-ripple-radius-in") {
        hideAndRemove($(this));
      }
    });
    hideAndRemove($waves.filter((_, wave) => !!$(wave).data("filled")));
  }
  startHover() {
    this.hover = true;
  }
  endHover() {
    this.hover = false;
  }
  startFocus() {
    this.focused = true;
  }
  endFocus() {
    this.focused = false;
  }
  startDrag() {
    this.dragged = true;
  }
  endDrag() {
    this.dragged = false;
  }
  render() {
    return html`<div ${ref(this.surfaceRef)} class="surface ${classMap({
      hover: this.hover,
      focused: this.focused,
      dragged: this.dragged
    })}"></div>`;
  }
};
Ripple.styles = [componentStyle, style6];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "no-ripple"
  })
], Ripple.prototype, "noRipple", void 0);
__decorate([
  state()
], Ripple.prototype, "hover", void 0);
__decorate([
  state()
], Ripple.prototype, "focused", void 0);
__decorate([
  state()
], Ripple.prototype, "dragged", void 0);
Ripple = __decorate([
  customElement("mdui-ripple")
], Ripple);

// node_modules/mdui/components/ripple/ripple-mixin.js
var RippleMixin = (superclass) => {
  class Mixin extends superclass {
    constructor() {
      super(...arguments);
      this.noRipple = false;
      this.rippleIndex = void 0;
      this.getRippleIndex = () => this.rippleIndex;
    }
    /**
     * 子类要添加该属性，指向 <mdui-ripple> 元素
     * 如果一个组件中包含多个 <mdui-ripple> 元素，则这里可以是一个数组或 NodeList
     */
    get rippleElement() {
      throw new Error("Must implement rippleElement getter!");
    }
    /**
     * 子类要实现该属性，表示是否禁用 ripple
     * 如果一个组件中包含多个 <mdui-ripple> 元素，则这里可以是一个数组；也可以是单个值，同时控制多个 <mdui-ripple> 元素
     */
    get rippleDisabled() {
      throw new Error("Must implement rippleDisabled getter!");
    }
    /**
     * 当前 <mdui-ripple> 元素相对于哪个元素存在，即 hover、pressed、dragged 属性要添加到哪个元素上，默认为 :host
     * 如果需要修改该属性，则子类可以实现该属性
     * 如果一个组件中包含多个 <mdui-ripple> 元素，则这里可以是一个数组；也可以是单个值，同时控制多个 <mdui-ripple> 元素
     */
    get rippleTarget() {
      return this;
    }
    firstUpdated(changedProperties) {
      super.firstUpdated(changedProperties);
      const $rippleTarget = $(this.rippleTarget);
      const setRippleIndex = (event) => {
        if (isArrayLike(this.rippleTarget)) {
          this.rippleIndex = $rippleTarget.index(event.target);
        }
      };
      const rippleTargetArr = isArrayLike(this.rippleTarget) ? this.rippleTarget : [this.rippleTarget];
      rippleTargetArr.forEach((rippleTarget) => {
        rippleTarget.addEventListener("pointerdown", (event) => {
          setRippleIndex(event);
          this.startPress(event);
        });
        rippleTarget.addEventListener("pointerenter", (event) => {
          setRippleIndex(event);
          this.startHover(event);
        });
        rippleTarget.addEventListener("pointerleave", (event) => {
          setRippleIndex(event);
          this.endHover(event);
        });
        rippleTarget.addEventListener("focus", (event) => {
          setRippleIndex(event);
          this.startFocus();
        });
        rippleTarget.addEventListener("blur", (event) => {
          setRippleIndex(event);
          this.endFocus();
        });
      });
    }
    /**
     * 若存在多个 <mdui-ripple>，但 rippleTarget 为同一个，则 hover 状态无法在多个 <mdui-ripple> 之间切换
     * 所以把 startHover 和 endHover 设置为 protected，供子类调用
     * 子类中，在 getRippleIndex() 的返回值变更前调用 endHover(event)，变更后调用 startHover(event)
     */
    startHover(event) {
      if (event.pointerType !== "mouse" || this.isRippleDisabled()) {
        return;
      }
      this.getRippleTarget().setAttribute("hover", "");
      this.getRippleElement().startHover();
    }
    endHover(event) {
      if (event.pointerType !== "mouse" || this.isRippleDisabled()) {
        return;
      }
      this.getRippleTarget().removeAttribute("hover");
      this.getRippleElement().endHover();
    }
    /**
     * 当前激活的 <mdui-ripple> 元素是否被禁用
     */
    isRippleDisabled() {
      const disabled = this.rippleDisabled;
      if (!Array.isArray(disabled)) {
        return disabled;
      }
      const rippleIndex = this.getRippleIndex();
      if (rippleIndex !== void 0) {
        return disabled[rippleIndex];
      }
      return disabled.length ? disabled[0] : false;
    }
    /**
     * 获取当前激活的 <mdui-ripple> 元素实例
     */
    getRippleElement() {
      const ripple = this.rippleElement;
      if (!isArrayLike(ripple)) {
        return ripple;
      }
      const rippleIndex = this.getRippleIndex();
      if (rippleIndex !== void 0) {
        return ripple[rippleIndex];
      }
      return ripple[0];
    }
    /**
     * 获取当前激活的 <mdui-ripple> 元素相对于哪个元素存在
     */
    getRippleTarget() {
      const target = this.rippleTarget;
      if (!isArrayLike(target)) {
        return target;
      }
      const rippleIndex = this.getRippleIndex();
      if (rippleIndex !== void 0) {
        return target[rippleIndex];
      }
      return target[0];
    }
    startFocus() {
      if (this.isRippleDisabled()) {
        return;
      }
      this.getRippleElement().startFocus();
    }
    endFocus() {
      if (this.isRippleDisabled()) {
        return;
      }
      this.getRippleElement().endFocus();
    }
    startPress(event) {
      if (this.isRippleDisabled() || event.button) {
        return;
      }
      const target = this.getRippleTarget();
      target.setAttribute("pressed", "");
      if (["touch", "pen"].includes(event.pointerType)) {
        let hidden = false;
        let timer = setTimeout(() => {
          timer = 0;
          this.getRippleElement().startPress(event);
        }, 70);
        const hideRipple = () => {
          if (timer) {
            clearTimeout(timer);
            timer = 0;
            this.getRippleElement().startPress(event);
          }
          if (!hidden) {
            hidden = true;
            this.endPress();
          }
          target.removeEventListener("pointerup", hideRipple);
          target.removeEventListener("pointercancel", hideRipple);
        };
        const touchMove = () => {
          if (timer) {
            clearTimeout(timer);
            timer = 0;
          }
          target.removeEventListener("touchmove", touchMove);
        };
        target.addEventListener("touchmove", touchMove);
        target.addEventListener("pointerup", hideRipple);
        target.addEventListener("pointercancel", hideRipple);
      }
      if (event.pointerType === "mouse" && event.button === 0) {
        const hideRipple = () => {
          this.endPress();
          target.removeEventListener("pointerup", hideRipple);
          target.removeEventListener("pointercancel", hideRipple);
          target.removeEventListener("pointerleave", hideRipple);
        };
        this.getRippleElement().startPress(event);
        target.addEventListener("pointerup", hideRipple);
        target.addEventListener("pointercancel", hideRipple);
        target.addEventListener("pointerleave", hideRipple);
      }
    }
    endPress() {
      if (this.isRippleDisabled()) {
        return;
      }
      this.getRippleTarget().removeAttribute("pressed");
      this.getRippleElement().endPress();
    }
    startDrag() {
      if (this.isRippleDisabled()) {
        return;
      }
      this.getRippleElement().startDrag();
    }
    endDrag() {
      if (this.isRippleDisabled()) {
        return;
      }
      this.getRippleElement().endDrag();
    }
  }
  __decorate([
    property({
      type: Boolean,
      reflect: true,
      converter: booleanConverter,
      attribute: "no-ripple"
    })
  ], Mixin.prototype, "noRipple", void 0);
  return Mixin;
};

// node_modules/mdui/components/button/button-base-style.js
var buttonBaseStyle = css`.button{position:relative;display:inline-flex;align-items:center;justify-content:center;height:100%;padding:0;overflow:hidden;color:inherit;font-size:inherit;font-family:inherit;font-weight:inherit;letter-spacing:inherit;white-space:nowrap;text-align:center;text-decoration:none;vertical-align:middle;background:0 0;border:none;outline:0;cursor:inherit;-webkit-user-select:none;user-select:none;touch-action:manipulation;zoom:1;-webkit-user-drag:none}`;

// node_modules/mdui/components/button/button-base.js
var ButtonBase = class extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.loading = false;
    this.name = "";
    this.value = "";
    this.type = "button";
    this.formNoValidate = false;
    this.formController = new FormController(this);
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    if (this.isButton()) {
      return this.focusElement.validity;
    }
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    if (this.isButton()) {
      return this.focusElement.validationMessage;
    }
  }
  get rippleDisabled() {
    return this.disabled || this.loading;
  }
  get focusElement() {
    return this.isButton() ? this.renderRoot?.querySelector("._button") : !this.focusDisabled ? this.renderRoot?.querySelector("._a") : this;
  }
  get focusDisabled() {
    return this.disabled || this.loading;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    if (this.isButton()) {
      const valid = this.focusElement.checkValidity();
      if (!valid) {
        this.emit("invalid", {
          bubbles: false,
          cancelable: true,
          composed: false
        });
      }
      return valid;
    }
    return true;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    if (this.isButton()) {
      const invalid = !this.focusElement.reportValidity();
      if (invalid) {
        this.emit("invalid", {
          bubbles: false,
          cancelable: true,
          composed: false
        });
      }
      return !invalid;
    }
    return true;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    if (this.isButton()) {
      this.focusElement.setCustomValidity(message);
    }
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("click", () => {
      if (this.type === "submit") {
        this.formController.submit(this);
      }
      if (this.type === "reset") {
        this.formController.reset(this);
      }
    });
  }
  renderLoading() {
    return this.loading ? html`<mdui-circular-progress part="loading"></mdui-circular-progress>` : nothingTemplate;
  }
  renderButton({ id: id2, className: className2, part, content = html`<slot></slot>` }) {
    return html`<button id="${ifDefined(id2)}" class="${cc(["_button", className2])}" part="${ifDefined(part)}" ?disabled="${this.rippleDisabled || this.focusDisabled}">${content}</button>`;
  }
  isButton() {
    return !this.href;
  }
};
ButtonBase.styles = [
  componentStyle,
  buttonBaseStyle
];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ButtonBase.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ButtonBase.prototype, "loading", void 0);
__decorate([
  property({ reflect: true })
], ButtonBase.prototype, "name", void 0);
__decorate([
  property({ reflect: true })
], ButtonBase.prototype, "value", void 0);
__decorate([
  property({ reflect: true })
], ButtonBase.prototype, "type", void 0);
__decorate([
  property({ reflect: true })
], ButtonBase.prototype, "form", void 0);
__decorate([
  property({ reflect: true, attribute: "formaction" })
], ButtonBase.prototype, "formAction", void 0);
__decorate([
  property({ reflect: true, attribute: "formenctype" })
], ButtonBase.prototype, "formEnctype", void 0);
__decorate([
  property({ reflect: true, attribute: "formmethod" })
], ButtonBase.prototype, "formMethod", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "formnovalidate"
  })
], ButtonBase.prototype, "formNoValidate", void 0);
__decorate([
  property({ reflect: true, attribute: "formtarget" })
], ButtonBase.prototype, "formTarget", void 0);

// node_modules/mdui/components/button/style.js
var style7 = css`:host{--shape-corner:var(--mdui-shape-corner-full);position:relative;display:inline-block;flex-shrink:0;overflow:hidden;text-align:center;border-radius:var(--shape-corner);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);min-width:3rem;height:2.5rem;color:rgb(var(--mdui-color-primary));font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height)}.button{width:100%;padding:0 1rem}:host([full-width]:not([full-width=false i])){display:block}:host([variant=elevated]){box-shadow:var(--mdui-elevation-level1);background-color:rgb(var(--mdui-color-surface-container-low));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=filled]){color:rgb(var(--mdui-color-on-primary));background-color:rgb(var(--mdui-color-primary));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-primary)}:host([variant=tonal]){color:rgb(var(--mdui-color-on-secondary-container));background-color:rgb(var(--mdui-color-secondary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([variant=outlined]){border:.0625rem solid rgb(var(--mdui-color-outline));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=text]){--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=outlined][focus-visible]){border-color:rgb(var(--mdui-color-primary))}:host([variant=elevated][hover]){box-shadow:var(--mdui-elevation-level2)}:host([variant=filled][hover]),:host([variant=tonal][hover]){box-shadow:var(--mdui-elevation-level1)}:host([disabled]:not([disabled=false i])),:host([loading]:not([loading=false i])){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])){color:rgba(var(--mdui-color-on-surface),38%);box-shadow:var(--mdui-elevation-level0)}:host([variant=elevated][disabled]:not([disabled=false i])),:host([variant=filled][disabled]:not([disabled=false i])),:host([variant=tonal][disabled]:not([disabled=false i])){background-color:rgba(var(--mdui-color-on-surface),12%)}:host([variant=outlined][disabled]:not([disabled=false i])){border-color:rgba(var(--mdui-color-on-surface),12%)}.label{display:inline-flex;padding-right:.5rem;padding-left:.5rem}.end-icon,.icon{display:inline-flex;font-size:1.28571429em}.end-icon mdui-icon,.icon mdui-icon,::slotted([slot=end-icon]),::slotted([slot=icon]){font-size:inherit}mdui-circular-progress{display:inline-flex;width:1.125rem;height:1.125rem}:host([variant=filled]) mdui-circular-progress{stroke:rgb(var(--mdui-color-on-primary))}:host([variant=tonal]) mdui-circular-progress{stroke:rgb(var(--mdui-color-on-secondary-container))}:host([disabled]:not([disabled=false i])) mdui-circular-progress{stroke:rgba(var(--mdui-color-on-surface),38%)}`;

// node_modules/mdui/components/button/index.js
var Button = class Button2 extends ButtonBase {
  constructor() {
    super(...arguments);
    this.variant = "filled";
    this.fullWidth = false;
    this.rippleRef = createRef();
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  render() {
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.isButton() ? this.renderButton({
      className: "button",
      part: "button",
      content: this.renderInner()
    }) : this.disabled || this.loading ? html`<span part="button" class="button _a">${this.renderInner()}</span>` : this.renderAnchor({
      className: "button",
      part: "button",
      content: this.renderInner()
    })}`;
  }
  renderIcon() {
    if (this.loading) {
      return this.renderLoading();
    }
    return html`<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderLabel() {
    return html`<slot part="label" class="label"></slot>`;
  }
  renderEndIcon() {
    return html`<slot name="end-icon" part="end-icon" class="end-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderInner() {
    return [this.renderIcon(), this.renderLabel(), this.renderEndIcon()];
  }
};
Button.styles = [ButtonBase.styles, style7];
__decorate([
  property({ reflect: true })
], Button.prototype, "variant", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "full-width"
  })
], Button.prototype, "fullWidth", void 0);
__decorate([
  property({ reflect: true })
], Button.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], Button.prototype, "endIcon", void 0);
Button = __decorate([
  customElement("mdui-button")
], Button);

// node_modules/mdui/components/button-icon/style.js
var style8 = css`:host{--shape-corner:var(--mdui-shape-corner-full);position:relative;display:inline-block;flex-shrink:0;overflow:hidden;text-align:center;border-radius:var(--shape-corner);cursor:pointer;-webkit-tap-highlight-color:transparent;font-size:1.5rem;width:2.5rem;height:2.5rem}:host([variant=standard]){color:rgb(var(--mdui-color-on-surface-variant));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}:host([variant=filled]){color:rgb(var(--mdui-color-primary));background-color:rgb(var(--mdui-color-surface-container-highest));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=tonal]){color:rgb(var(--mdui-color-on-surface-variant));background-color:rgb(var(--mdui-color-surface-container-highest));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}:host([variant=outlined]){border:.0625rem solid rgb(var(--mdui-color-outline));color:rgb(var(--mdui-color-on-surface-variant));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}:host([variant=outlined][pressed]){color:rgb(var(--mdui-color-on-surface));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([variant=standard][selected]:not([selected=false i])){color:rgb(var(--mdui-color-primary));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=filled]:not([selectable])),:host([variant=filled][selectable=false i]),:host([variant=filled][selected]:not([selected=false i])){color:rgb(var(--mdui-color-on-primary));background-color:rgb(var(--mdui-color-primary));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-primary)}:host([variant=tonal]:not([selectable])),:host([variant=tonal][selectable=false i]),:host([variant=tonal][selected]:not([selected=false i])){color:rgb(var(--mdui-color-on-secondary-container));background-color:rgb(var(--mdui-color-secondary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([variant=outlined][selected]:not([selected=false i])){border:none;color:rgb(var(--mdui-color-inverse-on-surface));background-color:rgb(var(--mdui-color-inverse-surface));--mdui-comp-ripple-state-layer-color:var(--mdui-color-inverse-on-surface)}:host([variant=filled][disabled]:not([disabled=false i])),:host([variant=outlined][disabled]:not([disabled=false i])),:host([variant=tonal][disabled]:not([disabled=false i])){background-color:rgba(var(--mdui-color-on-surface),.12);border-color:rgba(var(--mdui-color-on-surface),.12)}:host([disabled]:not([disabled=false i])),:host([loading]:not([loading=false i])){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])){color:rgba(var(--mdui-color-on-surface),.38)!important}.button{float:left;width:100%}:host([loading]:not([loading=false i])) .button,:host([loading]:not([loading=false i])) mdui-ripple{opacity:0}.icon,.selected-icon mdui-icon,::slotted(*){font-size:inherit}mdui-circular-progress{display:flex;position:absolute;top:calc(50% - 1.5rem / 2);left:calc(50% - 1.5rem / 2);width:1.5rem;height:1.5rem}:host([variant=filled]:not([disabled])) mdui-circular-progress,:host([variant=filled][disabled=false i]) mdui-circular-progress{stroke:rgb(var(--mdui-color-on-primary))}:host([disabled]:not([disabled=false i])) mdui-circular-progress{stroke:rgba(var(--mdui-color-on-surface),38%)}`;

// node_modules/mdui/components/button-icon/index.js
var ButtonIcon = class ButtonIcon2 extends ButtonBase {
  constructor() {
    super(...arguments);
    this.variant = "standard";
    this.selectable = false;
    this.selected = false;
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "[default]", "selected-icon");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  onSelectedChange() {
    this.emit("change");
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("click", () => {
      if (!this.selectable || this.disabled) {
        return;
      }
      this.selected = !this.selected;
    });
  }
  render() {
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.isButton() ? this.renderButton({
      className: "button",
      part: "button",
      content: this.renderIcon()
    }) : this.disabled || this.loading ? html`<span part="button" class="button _a">${this.renderIcon()}</span>` : this.renderAnchor({
      className: "button",
      part: "button",
      content: this.renderIcon()
    })} ${this.renderLoading()}`;
  }
  renderIcon() {
    const icon = () => this.hasSlotController.test("[default]") ? html`<slot></slot>` : this.icon ? html`<mdui-icon part="icon" class="icon" name="${this.icon}"></mdui-icon>` : nothingTemplate;
    const selectedIcon = () => this.hasSlotController.test("selected-icon") || this.selectedIcon ? html`<slot name="selected-icon" part="selected-icon" class="selected-icon"><mdui-icon name="${this.selectedIcon}"></mdui-icon></slot>` : icon();
    return this.selected ? selectedIcon() : icon();
  }
};
ButtonIcon.styles = [ButtonBase.styles, style8];
__decorate([
  property({ reflect: true })
], ButtonIcon.prototype, "variant", void 0);
__decorate([
  property({ reflect: true })
], ButtonIcon.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "selected-icon" })
], ButtonIcon.prototype, "selectedIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ButtonIcon.prototype, "selectable", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ButtonIcon.prototype, "selected", void 0);
__decorate([
  watch("selected", true)
], ButtonIcon.prototype, "onSelectedChange", null);
ButtonIcon = __decorate([
  customElement("mdui-button-icon")
], ButtonIcon);

// node_modules/mdui/components/card/style.js
var style9 = css`:host{--shape-corner:var(--mdui-shape-corner-medium);position:relative;display:inline-block;overflow:hidden;border-radius:var(--shape-corner);-webkit-tap-highlight-color:transparent;transition:box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([clickable]:not([clickable=false i])){cursor:pointer}:host([variant=elevated]){background-color:rgb(var(--mdui-color-surface-container-low));box-shadow:var(--mdui-elevation-level1)}:host([variant=filled]){background-color:rgb(var(--mdui-color-surface-container-highest))}:host([variant=outlined]){background-color:rgb(var(--mdui-color-surface));border:.0625rem solid rgb(var(--mdui-color-outline))}:host([variant=elevated][hover]){box-shadow:var(--mdui-elevation-level2)}:host([variant=filled][hover]),:host([variant=outlined][hover]){box-shadow:var(--mdui-elevation-level1)}:host([variant=elevated][dragged]),:host([variant=filled][dragged]),:host([variant=outlined][dragged]){box-shadow:var(--mdui-elevation-level3)}:host([disabled]:not([disabled=false i])){opacity:.38;cursor:default;-webkit-user-select:none;user-select:none}:host([variant=elevated][disabled]:not([disabled=false i])){background-color:rgb(var(--mdui-color-surface-variant));box-shadow:var(--mdui-elevation-level0)}:host([variant=filled][disabled]:not([disabled=false i])){background-color:rgb(var(--mdui-color-surface));box-shadow:var(--mdui-elevation-level1)}:host([variant=outlined][disabled]:not([disabled=false i])){box-shadow:var(--mdui-elevation-level0);border-color:rgba(var(--mdui-color-outline),.32)}.link{position:relative;display:inline-block;width:100%;height:100%;color:inherit;font-size:inherit;letter-spacing:inherit;text-decoration:none;touch-action:manipulation;-webkit-user-drag:none}`;

// node_modules/mdui/components/card/index.js
var Card = class Card2 extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super(...arguments);
    this.variant = "elevated";
    this.clickable = false;
    this.disabled = false;
    this.rippleRef = createRef();
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.disabled || !this.href && !this.clickable;
  }
  get focusElement() {
    return this.href && !this.disabled ? this.renderRoot.querySelector("._a") : this;
  }
  get focusDisabled() {
    return this.rippleDisabled;
  }
  render() {
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.href && !this.disabled ? this.renderAnchor({
      className: "link",
      content: html`<slot></slot>`
    }) : html`<slot></slot>`}`;
  }
};
Card.styles = [componentStyle, style9];
__decorate([
  property({ reflect: true })
], Card.prototype, "variant", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Card.prototype, "clickable", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Card.prototype, "disabled", void 0);
Card = __decorate([
  customElement("mdui-card")
], Card);

// node_modules/lit-html/development/directives/live.js
var LiveDirective = class extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (!(partInfo.type === PartType.PROPERTY || partInfo.type === PartType.ATTRIBUTE || partInfo.type === PartType.BOOLEAN_ATTRIBUTE)) {
      throw new Error("The `live` directive is not allowed on child or event bindings");
    }
    if (!isSingleExpression(partInfo)) {
      throw new Error("`live` bindings can only contain a single expression");
    }
  }
  render(value) {
    return value;
  }
  update(part, [value]) {
    if (value === noChange || value === nothing) {
      return value;
    }
    const element = part.element;
    const name = part.name;
    if (part.type === PartType.PROPERTY) {
      if (value === element[name]) {
        return noChange;
      }
    } else if (part.type === PartType.BOOLEAN_ATTRIBUTE) {
      if (!!value === element.hasAttribute(name)) {
        return noChange;
      }
    } else if (part.type === PartType.ATTRIBUTE) {
      if (element.getAttribute(name) === String(value)) {
        return noChange;
      }
    }
    setCommittedValue(part);
    return value;
  }
};
var live = directive(LiveDirective);

// node_modules/@mdui/shared/decorators/default-value.js
function defaultValue(propertyName = "value") {
  return (proto, key) => {
    const constructor = proto.constructor;
    const attributeChangedCallback = constructor.prototype.attributeChangedCallback;
    constructor.prototype.attributeChangedCallback = function(name, old, value) {
      const options = constructor.getPropertyOptions(propertyName);
      const attributeName = isString(options.attribute) ? options.attribute : propertyName;
      if (name === attributeName) {
        const converter = options.converter || defaultConverter;
        const fromAttribute = isFunction(converter) ? converter : converter?.fromAttribute ?? defaultConverter.fromAttribute;
        const newValue = fromAttribute(value, options.type);
        if (this[propertyName] !== newValue) {
          this[key] = newValue;
        }
      }
      attributeChangedCallback.call(this, name, old, value);
    };
  };
}

// node_modules/@mdui/shared/icons/shared/style.js
var style10 = css`:host{display:inline-block;width:1em;height:1em;line-height:1;font-size:1.5rem}`;

// node_modules/@mdui/shared/icons/shared/svg-tag.js
var svgTag = (svgPaths) => html`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">${unsafeSVG(svgPaths)}</svg>`;

// node_modules/@mdui/shared/icons/check-box-outline-blank.js
var IconCheckBoxOutlineBlank = class IconCheckBoxOutlineBlank2 extends LitElement {
  render() {
    return svgTag('<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>');
  }
};
IconCheckBoxOutlineBlank.styles = style10;
IconCheckBoxOutlineBlank = __decorate([
  customElement("mdui-icon-check-box-outline-blank")
], IconCheckBoxOutlineBlank);

// node_modules/@mdui/shared/icons/check-box.js
var IconCheckBox = class IconCheckBox2 extends LitElement {
  render() {
    return svgTag('<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>');
  }
};
IconCheckBox.styles = style10;
IconCheckBox = __decorate([
  customElement("mdui-icon-check-box")
], IconCheckBox);

// node_modules/@mdui/shared/icons/indeterminate-check-box.js
var IconIndeterminateCheckBox = class IconIndeterminateCheckBox2 extends LitElement {
  render() {
    return svgTag('<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>');
  }
};
IconIndeterminateCheckBox.styles = style10;
IconIndeterminateCheckBox = __decorate([
  customElement("mdui-icon-indeterminate-check-box")
], IconIndeterminateCheckBox);

// node_modules/mdui/components/checkbox/style.js
var style11 = css`:host{position:relative;display:inline-flex;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:.125rem;font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height)}label{display:inline-flex;align-items:center;width:100%;cursor:inherit;-webkit-user-select:none;user-select:none;touch-action:manipulation;zoom:1;-webkit-user-drag:none}input{position:absolute;padding:0;opacity:0;pointer-events:none;width:1.125rem;height:1.125rem;margin:0 0 0 .6875rem}.icon{display:flex;position:absolute;opacity:1;transform:scale(1);color:rgb(var(--mdui-color-on-surface));font-size:1.5rem;transition:color var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}.checked-icon,.indeterminate-icon{opacity:0;transform:scale(.5);transition-property:color,opacity,transform;transition-duration:var(--mdui-motion-duration-short4);transition-timing-function:var(--mdui-motion-easing-standard)}.icon .i,::slotted([slot=checked-icon]),::slotted([slot=indeterminate-icon]),::slotted([slot=unchecked-icon]){color:inherit;font-size:inherit}i{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:50%;width:2.5rem;height:2.5rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}.label{display:flex;width:100%;padding-top:.625rem;padding-bottom:.625rem;color:rgb(var(--mdui-color-on-surface));transition:color var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}:host([checked]:not([checked=false i])) i{--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([checked]:not([checked=false i])) .icon{color:rgb(var(--mdui-color-primary))}:host([checked]:not([checked=false i])) .indeterminate-icon{opacity:0;transform:scale(.5)}:host([checked]:not([checked=false i])) .checked-icon{opacity:1;transform:scale(1)}:host([indeterminate]:not([indeterminate=false i])) i{--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([indeterminate]:not([indeterminate=false i])) .icon{color:rgb(var(--mdui-color-primary))}:host([indeterminate]:not([indeterminate=false i])) .checked-icon{opacity:0;transform:scale(.5)}:host([indeterminate]:not([indeterminate=false i])) .indeterminate-icon{opacity:1;transform:scale(1)}.invalid i{--mdui-comp-ripple-state-layer-color:var(--mdui-color-error)}.invalid .icon{color:rgb(var(--mdui-color-error))}.invalid .label{color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])) .icon{color:rgba(var(--mdui-color-on-surface),38%)}:host([disabled]:not([disabled=false i])) .label{color:rgba(var(--mdui-color-on-surface),38%)}:host([disabled][checked]:not([disabled=false i],[checked=false i])) .unchecked-icon,:host([disabled][indeterminate]:not([disabled=false i],[indeterminate=false i])) .unchecked-icon{opacity:0}`;

// node_modules/mdui/components/checkbox/index.js
var Checkbox = class Checkbox2 extends RippleMixin(FocusableMixin(MduiElement)) {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.checked = false;
    this.defaultChecked = false;
    this.indeterminate = false;
    this.required = false;
    this.name = "";
    this.value = "on";
    this.invalid = false;
    this.inputRef = createRef();
    this.rippleRef = createRef();
    this.formController = new FormController(this, {
      value: (control) => control.checked ? control.value : void 0,
      defaultValue: (control) => control.defaultChecked,
      setValue: (control, checked) => control.checked = checked
    });
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get focusElement() {
    return this.inputRef.value;
  }
  get focusDisabled() {
    return this.disabled;
  }
  async onDisabledChange() {
    await this.updateComplete;
    this.invalid = !this.inputRef.value.checkValidity();
  }
  async onCheckedChange() {
    await this.updateComplete;
    const form = this.formController.getForm();
    if (form && formResets.get(form)?.has(this)) {
      this.invalid = false;
      formResets.get(form).delete(this);
    } else {
      this.invalid = !this.inputRef.value.checkValidity();
    }
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      const eventProceeded = this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      if (!eventProceeded) {
        this.blur();
        this.focus();
      }
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
  }
  render() {
    return html`<label class="${classMap({ invalid: this.invalid })}"><input ${ref(this.inputRef)} type="checkbox" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .indeterminate="${live(this.indeterminate)}" .disabled="${this.disabled}" .checked="${live(this.checked)}" .required="${this.required}" @change="${this.onChange}"> <i part="control"><mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple><slot name="unchecked-icon" part="unchecked-icon" class="icon unchecked-icon">${this.uncheckedIcon ? html`<mdui-icon name="${this.uncheckedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-check-box-outline-blank class="i"></mdui-icon-check-box-outline-blank>`}</slot><slot name="checked-icon" part="checked-icon" class="icon checked-icon">${this.checkedIcon ? html`<mdui-icon name="${this.checkedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-check-box class="i"></mdui-icon-check-box>`}</slot><slot name="indeterminate-icon" part="indeterminate-icon" class="icon indeterminate-icon">${this.indeterminateIcon ? html`<mdui-icon name="${this.indeterminateIcon}" class="i"></mdui-icon>` : html`<mdui-icon-indeterminate-check-box class="i"></mdui-icon-indeterminate-check-box>`}</slot></i><slot part="label" class="label"></slot></label>`;
  }
  /**
   * input[type="checkbox"] 的 change 事件无法冒泡越过 shadow dom
   */
  onChange() {
    this.checked = this.inputRef.value.checked;
    this.indeterminate = false;
    this.emit("change");
  }
};
Checkbox.styles = [componentStyle, style11];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Checkbox.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Checkbox.prototype, "checked", void 0);
__decorate([
  defaultValue("checked")
], Checkbox.prototype, "defaultChecked", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Checkbox.prototype, "indeterminate", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Checkbox.prototype, "required", void 0);
__decorate([
  property({ reflect: true })
], Checkbox.prototype, "form", void 0);
__decorate([
  property({ reflect: true })
], Checkbox.prototype, "name", void 0);
__decorate([
  property({ reflect: true })
], Checkbox.prototype, "value", void 0);
__decorate([
  property({ reflect: true, attribute: "unchecked-icon" })
], Checkbox.prototype, "uncheckedIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "checked-icon" })
], Checkbox.prototype, "checkedIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "indeterminate-icon" })
], Checkbox.prototype, "indeterminateIcon", void 0);
__decorate([
  state()
], Checkbox.prototype, "invalid", void 0);
__decorate([
  watch("disabled", true),
  watch("indeterminate", true),
  watch("required", true)
], Checkbox.prototype, "onDisabledChange", null);
__decorate([
  watch("checked", true)
], Checkbox.prototype, "onCheckedChange", null);
Checkbox = __decorate([
  customElement("mdui-checkbox")
], Checkbox);

// node_modules/@mdui/shared/icons/check.js
var IconCheck = class IconCheck2 extends LitElement {
  render() {
    return svgTag('<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>');
  }
};
IconCheck.styles = style10;
IconCheck = __decorate([
  customElement("mdui-icon-check")
], IconCheck);

// node_modules/@mdui/shared/icons/clear.js
var IconClear = class IconClear2 extends LitElement {
  render() {
    return svgTag('<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>');
  }
};
IconClear.styles = style10;
IconClear = __decorate([
  customElement("mdui-icon-clear")
], IconClear);

// node_modules/mdui/components/chip/style.js
var style12 = css`:host{--shape-corner:var(--mdui-shape-corner-small);position:relative;display:inline-block;flex-shrink:0;overflow:hidden;border-radius:var(--shape-corner);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);height:2rem;background-color:rgb(var(--mdui-color-surface));border:.0625rem solid rgb(var(--mdui-color-outline));color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height);--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}.button{padding-right:.4375rem;padding-left:.4375rem}:host([variant=input]) .button{padding-right:.1875rem;padding-left:.1875rem}:host([selected]:not([selected=false i])) .button{padding-right:.5rem;padding-left:.5rem}:host([selected][variant=input]:not([selected=false i])) .button{padding-right:.25rem;padding-left:.25rem}:host([elevated]:not([elevated=false i])) .button{padding-right:.5rem;padding-left:.5rem}:host([variant=assist]){color:rgb(var(--mdui-color-on-surface));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([elevated]:not([elevated=false i])){border-width:0;background-color:rgb(var(--mdui-color-surface-container-low));box-shadow:var(--mdui-elevation-level1)}:host([selected]:not([selected=false i])){color:rgb(var(--mdui-color-on-secondary-container));background-color:rgb(var(--mdui-color-secondary-container));border-width:0;--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([disabled]:not([disabled=false i])),:host([loading]:not([loading=false i])){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])){border-color:rgba(var(--mdui-color-on-surface),12%);color:rgba(var(--mdui-color-on-surface),38%);box-shadow:var(--mdui-elevation-level0)}:host([disabled][elevated]:not([disabled=false i],[elevated=false i])),:host([disabled][selected]:not([disabled=false i],[selected=false i])){background-color:rgba(var(--mdui-color-on-surface),12%)}:host([selected][hover]:not([selected=false i])){box-shadow:var(--mdui-elevation-level1)}:host([elevated][hover]:not([elevated=false i])){color:rgb(var(--mdui-color-on-secondary-container));box-shadow:var(--mdui-elevation-level2)}:host([variant=filter][hover]),:host([variant=input][hover]),:host([variant=suggestion][hover]){color:rgb(var(--mdui-color-on-surface-variant))}:host([variant=filter][focus-visible]),:host([variant=input][focus-visible]),:host([variant=suggestion][focus-visible]){border-color:rgb(var(--mdui-color-on-surface-variant))}:host([dragged]),:host([dragged][hover]){box-shadow:var(--mdui-elevation-level4)}.button{overflow:visible}.label{display:inline-flex;padding-right:.5rem;padding-left:.5rem}.end-icon,.icon,.selected-icon{display:inline-flex;font-size:1.28571429em;color:rgb(var(--mdui-color-on-surface-variant))}:host([variant=assist]) .end-icon,:host([variant=assist]) .icon,:host([variant=assist]) .selected-icon{color:rgb(var(--mdui-color-primary))}:host([selected]:not([selected=false i])) .end-icon,:host([selected]:not([selected=false i])) .icon,:host([selected]:not([selected=false i])) .selected-icon{color:rgb(var(--mdui-color-on-secondary-container))}:host([disabled]:not([disabled=false i])) .end-icon,:host([disabled]:not([disabled=false i])) .icon,:host([disabled]:not([disabled=false i])) .selected-icon{opacity:.38;color:rgb(var(--mdui-color-on-surface))}.end-icon .i,.icon .i,.selected-icon .i,::slotted([slot=end-icon]),::slotted([slot=icon]),::slotted([slot=selected-icon]){font-size:inherit}:host([variant=input]) .has-icon .icon,:host([variant=input]) .has-icon .selected-icon,:host([variant=input]) .has-icon mdui-circular-progress{margin-left:.25rem}:host([variant=input]) .has-end-icon .end-icon{margin-right:.25rem}mdui-circular-progress{display:inline-flex;width:1.125rem;height:1.125rem}:host([disabled]:not([disabled=false i])) mdui-circular-progress{stroke:rgba(var(--mdui-color-on-surface),38%)}::slotted(mdui-avatar[slot=end-icon]),::slotted(mdui-avatar[slot=icon]),::slotted(mdui-avatar[slot=selected-icon]){width:1.5rem;height:1.5rem}:host([disabled]:not([disabled=false i])) ::slotted(mdui-avatar[slot=end-icon]),:host([disabled]:not([disabled=false i])) ::slotted(mdui-avatar[slot=icon]),:host([disabled]:not([disabled=false i])) ::slotted(mdui-avatar[slot=selected-icon]){opacity:.38}::slotted(mdui-avatar[slot=icon]),::slotted(mdui-avatar[slot=selected-icon]){margin-left:-.25rem;margin-right:-.125rem}::slotted(mdui-avatar[slot=end-icon]){margin-right:-.25rem;margin-left:-.125rem}.delete-icon{display:inline-flex;font-size:1.28571429em;transition:background-color var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);border-radius:var(--mdui-shape-corner-full);margin-right:-.25rem;margin-left:-.25rem;padding:.25rem;color:rgb(var(--mdui-color-on-surface-variant))}.delete-icon:hover{background-color:rgba(var(--mdui-color-on-surface-variant),12%)}.has-end-icon .delete-icon{margin-left:.25rem}:host([variant=assiat]) .delete-icon{color:rgb(var(--mdui-color-primary))}:host([variant=input]) .delete-icon{margin-right:.0625rem}:host([disabled]:not([disabled=false i])) .delete-icon{color:rgba(var(--mdui-color-on-surface),38%)}.delete-icon .i,::slotted([slot=delete-icon]){font-size:inherit}::slotted(mdui-avatar[slot=delete-icon]){width:1.125rem;height:1.125rem}`;

// node_modules/mdui/components/chip/index.js
var Chip = class Chip2 extends ButtonBase {
  constructor() {
    super();
    this.variant = "assist";
    this.elevated = false;
    this.selectable = false;
    this.selected = false;
    this.deletable = false;
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "icon", "selected-icon", "end-icon");
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  onSelectedChange() {
    this.emit("change");
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
  }
  render() {
    const hasIcon = this.icon || this.hasSlotController.test("icon");
    const hasEndIcon = this.endIcon || this.hasSlotController.test("end-icon");
    const hasSelectedIcon = this.selectedIcon || ["assist", "filter"].includes(this.variant) || hasIcon || this.hasSlotController.test("selected-icon");
    const className2 = cc({
      button: true,
      "has-icon": this.loading || !this.selected && hasIcon || this.selected && hasSelectedIcon,
      "has-end-icon": hasEndIcon
    });
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.isButton() ? this.renderButton({
      className: className2,
      part: "button",
      content: this.renderInner()
    }) : this.disabled || this.loading ? html`<span part="button" class="${className2} _a">${this.renderInner()}</span>` : this.renderAnchor({
      className: className2,
      part: "button",
      content: this.renderInner()
    })}`;
  }
  onClick() {
    if (this.disabled || this.loading) {
      return;
    }
    if (this.selectable) {
      this.selected = !this.selected;
    }
  }
  onKeyDown(event) {
    if (this.disabled || this.loading) {
      return;
    }
    if (this.selectable && event.key === " ") {
      event.preventDefault();
      this.selected = !this.selected;
    }
    if (this.deletable && ["Delete", "Backspace"].includes(event.key)) {
      this.emit("delete");
    }
  }
  /**
   * 点击删除按钮
   */
  onDelete(event) {
    event.stopPropagation();
    this.emit("delete");
  }
  renderIcon() {
    if (this.loading) {
      return this.renderLoading();
    }
    const icon = () => {
      return this.icon ? html`<mdui-icon name="${this.icon}" class="i"></mdui-icon>` : nothingTemplate;
    };
    const selectedIcon = () => {
      if (this.selectedIcon) {
        return html`<mdui-icon name="${this.selectedIcon}" class="i"></mdui-icon>`;
      }
      if (this.variant === "assist" || this.variant === "filter") {
        return html`<mdui-icon-check class="i"></mdui-icon-check>`;
      }
      return icon();
    };
    return !this.selected ? html`<slot name="icon" part="icon" class="icon">${icon()}</slot>` : html`<slot name="selected-icon" part="selected-icon" class="selected-icon">${selectedIcon()}</slot>`;
  }
  renderLabel() {
    return html`<slot part="label" class="label"></slot>`;
  }
  renderEndIcon() {
    return html`<slot name="end-icon" part="end-icon" class="end-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}" class="i"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderDeleteIcon() {
    if (!this.deletable) {
      return nothingTemplate;
    }
    return html`<slot name="delete-icon" part="delete-icon" class="delete-icon" @click="${this.onDelete}">${this.deleteIcon ? html`<mdui-icon name="${this.deleteIcon}" class="i"></mdui-icon>` : html`<mdui-icon-clear class="i"></mdui-icon-clear>`}</slot>`;
  }
  renderInner() {
    return [
      this.renderIcon(),
      this.renderLabel(),
      this.renderEndIcon(),
      this.renderDeleteIcon()
    ];
  }
};
Chip.styles = [ButtonBase.styles, style12];
__decorate([
  property({ reflect: true })
], Chip.prototype, "variant", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Chip.prototype, "elevated", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Chip.prototype, "selectable", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Chip.prototype, "selected", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Chip.prototype, "deletable", void 0);
__decorate([
  property({ reflect: true })
], Chip.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "selected-icon" })
], Chip.prototype, "selectedIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], Chip.prototype, "endIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "delete-icon" })
], Chip.prototype, "deleteIcon", void 0);
__decorate([
  watch("selected", true)
], Chip.prototype, "onSelectedChange", null);
Chip = __decorate([
  customElement("mdui-chip")
], Chip);

// node_modules/@mdui/shared/helpers/array.js
var arraysEqualIgnoreOrder = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

// node_modules/mdui/components/collapse/collapse-style.js
var collapseStyle = css`:host{display:block}`;

// node_modules/mdui/components/collapse/collapse.js
var Collapse = class Collapse2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.accordion = false;
    this.disabled = false;
    this.activeKeys = [];
    this.isInitial = true;
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-collapse-item"]
    });
  }
  async onActiveKeysChange() {
    await this.definedController.whenDefined();
    const value = this.accordion ? this.items.find((item) => this.activeKeys.includes(item.key))?.value : this.items.filter((item) => this.activeKeys.includes(item.key)).map((item) => item.value);
    this.setValue(value);
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    if (this.accordion) {
      const value = this.value;
      if (!value) {
        this.setActiveKeys([]);
      } else {
        const item = this.items.find((item2) => item2.value === value);
        this.setActiveKeys(item ? [item.key] : []);
      }
    } else {
      const value = this.value;
      if (!value.length) {
        this.setActiveKeys([]);
      } else {
        const activeKeys = this.items.filter((item) => value.includes(item.value)).map((item) => item.key);
        this.setActiveKeys(activeKeys);
      }
    }
    this.updateItems();
  }
  render() {
    return html`<slot @slotchange="${this.onSlotChange}" @click="${this.onClick}"></slot>`;
  }
  setActiveKeys(activeKeys) {
    if (!arraysEqualIgnoreOrder(this.activeKeys, activeKeys)) {
      this.activeKeys = activeKeys;
    }
  }
  setValue(value) {
    if (this.accordion || isUndefined(this.value) || isUndefined(value)) {
      this.value = value;
    } else if (!arraysEqualIgnoreOrder(this.value, value)) {
      this.value = value;
    }
  }
  onClick(event) {
    if (this.disabled) {
      return;
    }
    if (event.button) {
      return;
    }
    const target = event.target;
    const item = target.closest("mdui-collapse-item");
    if (!item || item.disabled) {
      return;
    }
    const path = event.composedPath();
    if (item.trigger && !path.find((element) => isElement(element) && $(element).is(item.trigger))) {
      return;
    }
    if (!path.find((element) => isElement(element) && element.part.contains("header"))) {
      return;
    }
    if (this.accordion) {
      if (this.activeKeys.includes(item.key)) {
        this.setActiveKeys([]);
      } else {
        this.setActiveKeys([item.key]);
      }
    } else {
      const activeKeys = [...this.activeKeys];
      if (activeKeys.includes(item.key)) {
        activeKeys.splice(activeKeys.indexOf(item.key), 1);
      } else {
        activeKeys.push(item.key);
      }
      this.setActiveKeys(activeKeys);
    }
    this.isInitial = false;
    this.updateItems();
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
  // 更新 <mdui-collapse-item> 的状态
  updateItems() {
    this.items.forEach((item) => {
      item.active = this.activeKeys.includes(item.key);
      item.isInitial = this.isInitial;
    });
  }
};
Collapse.styles = [
  componentStyle,
  collapseStyle
];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Collapse.prototype, "accordion", void 0);
__decorate([
  property()
], Collapse.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Collapse.prototype, "disabled", void 0);
__decorate([
  state()
], Collapse.prototype, "activeKeys", void 0);
__decorate([
  queryAssignedElements({ selector: "mdui-collapse-item", flatten: true })
], Collapse.prototype, "items", void 0);
__decorate([
  watch("activeKeys", true)
], Collapse.prototype, "onActiveKeysChange", null);
__decorate([
  watch("value")
], Collapse.prototype, "onValueChange", null);
Collapse = __decorate([
  customElement("mdui-collapse")
], Collapse);

// node_modules/mdui/components/collapse/collapse-item-style.js
var collapseItemStyle = css`:host{display:flex;flex-direction:column}.header{display:block}.body{display:block;overflow:hidden;transition:height var(--mdui-motion-duration-short4) var(--mdui-motion-easing-emphasized)}.body.opened{overflow:visible}.body.active{transition-duration:var(--mdui-motion-duration-medium4)}`;

// node_modules/mdui/components/collapse/collapse-item.js
var CollapseItem = class CollapseItem2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.active = false;
    this.state = "closed";
    this.isInitial = true;
    this.key = uniqueId();
    this.bodyRef = createRef();
  }
  onActiveChange() {
    if (this.isInitial) {
      this.state = this.active ? "opened" : "closed";
      if (this.hasUpdated) {
        this.updateBodyHeight();
      }
    } else {
      this.state = this.active ? "open" : "close";
      this.emit(this.state);
      this.updateBodyHeight();
    }
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.updateBodyHeight();
  }
  render() {
    return html`<slot name="header" part="header" class="header">${this.header}</slot><slot part="body" class="body ${classMap({
      opened: this.state === "opened",
      active: this.active
    })}" ${ref(this.bodyRef)} @transitionend="${this.onTransitionEnd}"></slot>`;
  }
  onTransitionEnd(event) {
    if (event.target === this.bodyRef.value) {
      this.state = this.active ? "opened" : "closed";
      this.emit(this.state);
      this.updateBodyHeight();
    }
  }
  updateBodyHeight() {
    const scrollHeight = this.bodyRef.value.scrollHeight;
    if (this.state === "close") {
      $(this.bodyRef.value).height(scrollHeight);
      this.bodyRef.value.clientLeft;
    }
    $(this.bodyRef.value).height(this.state === "opened" ? "auto" : this.state === "open" ? scrollHeight : 0);
  }
};
CollapseItem.styles = [
  componentStyle,
  collapseItemStyle
];
__decorate([
  property({ reflect: true })
], CollapseItem.prototype, "value", void 0);
__decorate([
  property({ reflect: true })
], CollapseItem.prototype, "header", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], CollapseItem.prototype, "disabled", void 0);
__decorate([
  property()
], CollapseItem.prototype, "trigger", void 0);
__decorate([
  state()
], CollapseItem.prototype, "active", void 0);
__decorate([
  state()
], CollapseItem.prototype, "state", void 0);
__decorate([
  watch("active")
], CollapseItem.prototype, "onActiveChange", null);
CollapseItem = __decorate([
  customElement("mdui-collapse-item")
], CollapseItem);

// node_modules/lit-html/development/directives/when.js
function when(condition, trueCase, falseCase) {
  return condition ? trueCase(condition) : falseCase?.(condition);
}

// node_modules/@mdui/shared/helpers/animate.js
function animateTo(el, keyframes, options) {
  if (!el) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (options.duration === Infinity) {
      throw new Error("Promise-based animations must be finite.");
    }
    if (isNumber(options.duration) && isNaN(options.duration)) {
      options.duration = 0;
    }
    if (options.easing === "") {
      options.easing = "linear";
    }
    const animation = el.animate(keyframes, options);
    animation.addEventListener("cancel", resolve, { once: true });
    animation.addEventListener("finish", resolve, { once: true });
  });
}
function stopAnimations(el) {
  if (!el) {
    return Promise.resolve();
  }
  return Promise.all(el.getAnimations().map((animation) => {
    return new Promise((resolve) => {
      const handleAnimationEvent = requestAnimationFrame(resolve);
      animation.addEventListener("cancel", () => handleAnimationEvent, {
        once: true
      });
      animation.addEventListener("finish", () => handleAnimationEvent, {
        once: true
      });
      animation.cancel();
    });
  }));
}

// node_modules/@mdui/shared/helpers/tabbable.js
function isTabbable(el) {
  const window2 = getWindow();
  const localName = el.localName;
  if (el.getAttribute("tabindex") === "-1") {
    return false;
  }
  if (el.hasAttribute("disabled")) {
    return false;
  }
  if (el.hasAttribute("aria-disabled") && el.getAttribute("aria-disabled") !== "false") {
    return false;
  }
  if (localName === "input" && el.getAttribute("type") === "radio" && !el.hasAttribute("checked")) {
    return false;
  }
  if (el.offsetParent === null) {
    return false;
  }
  if (window2.getComputedStyle(el).visibility === "hidden") {
    return false;
  }
  if ((localName === "audio" || localName === "video") && el.hasAttribute("controls")) {
    return true;
  }
  if (el.hasAttribute("tabindex")) {
    return true;
  }
  if (el.hasAttribute("contenteditable") && el.getAttribute("contenteditable") !== "false") {
    return true;
  }
  return [
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "audio",
    "video",
    "summary"
  ].includes(localName);
}
function getTabbableBoundary(root) {
  const allElements = [];
  function walk(el) {
    if (el instanceof HTMLElement) {
      allElements.push(el);
      if (el.shadowRoot !== null && el.shadowRoot.mode === "open") {
        walk(el.shadowRoot);
      }
    }
    const children = el.children;
    [...children].forEach((e) => walk(e));
  }
  walk(root);
  const start = allElements.find((el) => isTabbable(el)) ?? null;
  const end = allElements.reverse().find((el) => isTabbable(el)) ?? null;
  return { start, end };
}

// node_modules/@mdui/shared/helpers/modal.js
var activeModals = [];
var Modal = class {
  constructor(element) {
    this.tabDirection = "forward";
    this.element = element;
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  activate() {
    activeModals.push(this.element);
    document.addEventListener("focusin", this.handleFocusIn);
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }
  deactivate() {
    activeModals = activeModals.filter((modal) => modal !== this.element);
    document.removeEventListener("focusin", this.handleFocusIn);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }
  isActive() {
    return activeModals[activeModals.length - 1] === this.element;
  }
  checkFocus() {
    if (this.isActive()) {
      if (!this.element.matches(":focus-within")) {
        const { start, end } = getTabbableBoundary(this.element);
        const target = this.tabDirection === "forward" ? start : end;
        if (typeof target?.focus === "function") {
          target.focus({ preventScroll: true });
        }
      }
    }
  }
  handleFocusIn() {
    this.checkFocus();
  }
  handleKeyDown(event) {
    if (event.key === "Tab" && event.shiftKey) {
      this.tabDirection = "backward";
    }
    requestAnimationFrame(() => this.checkFocus());
  }
  handleKeyUp() {
    this.tabDirection = "forward";
  }
};

// node_modules/@mdui/shared/helpers/motion.js
var getEasing = (element, name) => {
  const cssVariableName = `--mdui-motion-easing-${name}`;
  return $(element).css(cssVariableName).trim();
};
var getDuration = (element, name) => {
  const cssVariableName = `--mdui-motion-duration-${name}`;
  const cssValue = $(element).css(cssVariableName).trim().toLowerCase();
  if (cssValue.endsWith("ms")) {
    return parseFloat(cssValue);
  } else {
    return parseFloat(cssValue) * 1e3;
  }
};

// node_modules/@mdui/shared/helpers/scroll.js
var scrollBarSizeCached;
var getScrollBarSize = (fresh) => {
  if (isUndefined(document)) {
    return 0;
  }
  if (fresh || scrollBarSizeCached === void 0) {
    const $inner = $("<div>").css({
      width: "100%",
      height: "200px"
    });
    const $outer = $("<div>").css({
      position: "absolute",
      top: "0",
      left: "0",
      pointerEvents: "none",
      visibility: "hidden",
      width: "200px",
      height: "150px",
      overflow: "hidden"
    }).append($inner).appendTo(document.body);
    const widthContained = $inner[0].offsetWidth;
    $outer.css("overflow", "scroll");
    let widthScroll = $inner[0].offsetWidth;
    if (widthContained === widthScroll) {
      widthScroll = $outer[0].clientWidth;
    }
    $outer.remove();
    scrollBarSizeCached = widthContained - widthScroll;
  }
  return scrollBarSizeCached;
};
var hasScrollbar = (target) => {
  return target.scrollHeight > target.clientHeight;
};
var lockMap = /* @__PURE__ */ new WeakMap();
var className = "mdui-lock-screen";
var lockScreen = (source, target) => {
  const document3 = getDocument();
  target ??= document3.documentElement;
  if (!lockMap.has(target)) {
    lockMap.set(target, /* @__PURE__ */ new Set());
  }
  const lock = lockMap.get(target);
  lock.add(source);
  const $target = $(target);
  if (hasScrollbar(target)) {
    $target.css("width", `calc(100% - ${getScrollBarSize()}px)`);
  }
  $target.addClass(className);
};
var unlockScreen = (source, target) => {
  const document3 = getDocument();
  target ??= document3.documentElement;
  const lock = lockMap.get(target);
  if (!lock) {
    return;
  }
  lock.delete(source);
  if (lock.size === 0) {
    lockMap.delete(target);
    $(target).removeClass(className).width("");
  }
};

// node_modules/@lit/localize/internal/locale-status-event.js
var LOCALE_STATUS_EVENT = "lit-localize-status";

// node_modules/@lit/localize/internal/str-tag.js
var isStrTagged = (val) => typeof val !== "string" && "strTag" in val;
var joinStringsAndValues = (strings, values, valueOrder) => {
  let concat = strings[0];
  for (let i = 1; i < strings.length; i++) {
    concat += values[valueOrder ? valueOrder[i - 1] : i - 1];
    concat += strings[i];
  }
  return concat;
};

// node_modules/@lit/localize/internal/default-msg.js
var defaultMsg = (template) => isStrTagged(template) ? joinStringsAndValues(template.strings, template.values) : template;

// node_modules/@lit/localize/init/install.js
var msg = defaultMsg;

// node_modules/@lit/localize/internal/deferred.js
var Deferred = class {
  constructor() {
    this.settled = false;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  resolve(value) {
    this.settled = true;
    this._resolve(value);
  }
  reject(error) {
    this.settled = true;
    this._reject(error);
  }
};

// node_modules/@lit/localize/internal/fnv1a64.js
var hl = [];
for (let i = 0; i < 256; i++) {
  hl[i] = (i >> 4 & 15).toString(16) + (i & 15).toString(16);
}

// node_modules/@lit/localize/init/runtime.js
var loading = new Deferred();
loading.resolve();

// node_modules/mdui/internal/localize.js
var listeningLitLocalizeStatus = false;
var localeReadyCallbacksMap = /* @__PURE__ */ new Map();
var onLocaleReady = (target, callback) => {
  if (!listeningLitLocalizeStatus) {
    listeningLitLocalizeStatus = true;
    const window2 = getWindow();
    window2.addEventListener(LOCALE_STATUS_EVENT, (event) => {
      if (event.detail.status === "ready") {
        localeReadyCallbacksMap.forEach((callbacks2) => {
          callbacks2.forEach((cb) => cb());
        });
      }
    });
  }
  const callbacks = localeReadyCallbacksMap.get(target) || [];
  callbacks.push(callback);
  localeReadyCallbacksMap.set(target, callbacks);
};
var offLocaleReady = (target) => {
  localeReadyCallbacksMap.delete(target);
};

// node_modules/mdui/components/dialog/style.js
var style13 = css`:host{--shape-corner:var(--mdui-shape-corner-extra-large);--z-index:2300;position:fixed;z-index:var(--z-index);display:none;align-items:center;justify-content:center;inset:0;padding:3rem}::slotted(mdui-top-app-bar[slot=header]){position:absolute;border-top-left-radius:var(--mdui-shape-corner-extra-large);border-top-right-radius:var(--mdui-shape-corner-extra-large);background-color:rgb(var(--mdui-color-surface-container-high))}:host([fullscreen]:not([fullscreen=false i])){--shape-corner:var(--mdui-shape-corner-none);padding:0}:host([fullscreen]:not([fullscreen=false i])) ::slotted(mdui-top-app-bar[slot=header]){border-top-left-radius:var(--mdui-shape-corner-none);border-top-right-radius:var(--mdui-shape-corner-none)}.overlay{position:fixed;inset:0;background-color:rgba(var(--mdui-color-scrim),.4)}.panel{--mdui-color-background:var(--mdui-color-surface-container-high);position:relative;display:flex;flex-direction:column;max-height:100%;border-radius:var(--shape-corner);outline:0;transform-origin:top;min-width:17.5rem;max-width:35rem;padding:1.5rem;background-color:rgb(var(--mdui-color-surface-container-high));box-shadow:var(--mdui-elevation-level3)}:host([fullscreen]:not([fullscreen=false i])) .panel{width:100%;max-width:100%;height:100%;max-height:100%;box-shadow:var(--mdui-elevation-level0)}.header{display:flex;flex-direction:column}.has-icon .header{align-items:center}.icon{display:flex;color:rgb(var(--mdui-color-secondary));font-size:1.5rem}.icon mdui-icon,::slotted([slot=icon]){font-size:inherit}.headline{display:flex;color:rgb(var(--mdui-color-on-surface));font-size:var(--mdui-typescale-headline-small-size);font-weight:var(--mdui-typescale-headline-small-weight);letter-spacing:var(--mdui-typescale-headline-small-tracking);line-height:var(--mdui-typescale-headline-small-line-height)}.icon+.headline{padding-top:1rem}.body{overflow:auto}.header+.body{margin-top:1rem}.description{display:flex;color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-body-medium-size);font-weight:var(--mdui-typescale-body-medium-weight);letter-spacing:var(--mdui-typescale-body-medium-tracking);line-height:var(--mdui-typescale-body-medium-line-height)}:host([fullscreen]:not([fullscreen=false i])) .description{color:rgb(var(--mdui-color-on-surface))}.has-description.has-default .description{margin-bottom:1rem}.action{display:flex;justify-content:flex-end;padding-top:1.5rem}.action::slotted(:not(:first-child)){margin-left:.5rem}:host([stacked-actions]:not([stacked-actions=false i])) .action{flex-direction:column;align-items:end}:host([stacked-actions]:not([stacked-actions=false i])) .action::slotted(:not(:first-child)){margin-left:0;margin-top:.5rem}`;

// node_modules/mdui/components/dialog/index.js
var Dialog = class Dialog2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.open = false;
    this.fullscreen = false;
    this.closeOnEsc = false;
    this.closeOnOverlayClick = false;
    this.stackedActions = false;
    this.overlayRef = createRef();
    this.panelRef = createRef();
    this.bodyRef = createRef();
    this.hasSlotController = new HasSlotController(this, "header", "icon", "headline", "description", "action", "[default]");
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-top-app-bar"]
    });
  }
  async onOpenChange() {
    const hasUpdated = this.hasUpdated;
    if (!this.open && !hasUpdated) {
      return;
    }
    await this.definedController.whenDefined();
    if (!hasUpdated) {
      await this.updateComplete;
    }
    const children = Array.from(this.panelRef.value.querySelectorAll(".header, .body, .actions"));
    const easingLinear = getEasing(this, "linear");
    const easingEmphasizedDecelerate = getEasing(this, "emphasized-decelerate");
    const easingEmphasizedAccelerate = getEasing(this, "emphasized-accelerate");
    const stopAnimation = () => Promise.all([
      stopAnimations(this.overlayRef.value),
      stopAnimations(this.panelRef.value),
      ...children.map((child) => stopAnimations(child))
    ]);
    if (this.open) {
      if (hasUpdated) {
        const eventProceeded = this.emit("open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      this.style.display = "flex";
      const topAppBarElements = this.topAppBarElements ?? [];
      if (topAppBarElements.length) {
        const topAppBarElement = topAppBarElements[0];
        if (!topAppBarElement.scrollTarget) {
          topAppBarElement.scrollTarget = this.bodyRef.value;
        }
        this.bodyRef.value.style.marginTop = "0";
      }
      this.originalTrigger = document.activeElement;
      this.modalHelper.activate();
      lockScreen(this);
      await stopAnimation();
      requestAnimationFrame(() => {
        const autoFocusTarget = this.querySelector("[autofocus]");
        if (autoFocusTarget) {
          autoFocusTarget.focus({ preventScroll: true });
        } else {
          this.panelRef.value.focus({ preventScroll: true });
        }
      });
      const duration = getDuration(this, "medium4");
      await Promise.all([
        animateTo(this.overlayRef.value, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        }),
        animateTo(this.panelRef.value, [
          { transform: "translateY(-1.875rem) scaleY(0)" },
          { transform: "translateY(0) scaleY(1)" }
        ], {
          duration: hasUpdated ? duration : 0,
          easing: easingEmphasizedDecelerate
        }),
        animateTo(this.panelRef.value, [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        }),
        ...children.map((child) => animateTo(child, [
          { opacity: 0 },
          { opacity: 0, offset: 0.2 },
          { opacity: 1, offset: 0.8 },
          { opacity: 1 }
        ], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        }))
      ]);
      if (hasUpdated) {
        this.emit("opened");
      }
    } else {
      const eventProceeded = this.emit("close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      this.modalHelper.deactivate();
      await stopAnimation();
      const duration = getDuration(this, "short4");
      await Promise.all([
        animateTo(this.overlayRef.value, [{ opacity: 1 }, { opacity: 0 }], {
          duration,
          easing: easingLinear
        }),
        animateTo(this.panelRef.value, [
          { transform: "translateY(0) scaleY(1)" },
          { transform: "translateY(-1.875rem) scaleY(0.6)" }
        ], { duration, easing: easingEmphasizedAccelerate }),
        animateTo(this.panelRef.value, [{ opacity: 1 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration, easing: easingLinear }),
        ...children.map((child) => animateTo(child, [{ opacity: 1 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], { duration, easing: easingLinear }))
      ]);
      this.style.display = "none";
      unlockScreen(this);
      const trigger = this.originalTrigger;
      if (typeof trigger?.focus === "function") {
        setTimeout(() => trigger.focus());
      }
      this.emit("closed");
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unlockScreen(this);
    offLocaleReady(this);
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.modalHelper = new Modal(this);
    this.addEventListener("keydown", (event) => {
      if (this.open && this.closeOnEsc && event.key === "Escape") {
        event.stopPropagation();
        this.open = false;
      }
    });
  }
  render() {
    const hasActionSlot = this.hasSlotController.test("action");
    const hasDefaultSlot = this.hasSlotController.test("[default]");
    const hasIcon = !!this.icon || this.hasSlotController.test("icon");
    const hasHeadline = !!this.headline || this.hasSlotController.test("headline");
    const hasDescription = !!this.description || this.hasSlotController.test("description");
    const hasHeader = hasIcon || hasHeadline || this.hasSlotController.test("header");
    const hasBody = hasDescription || hasDefaultSlot;
    return html`<div ${ref(this.overlayRef)} part="overlay" class="overlay" @click="${this.onOverlayClick}" tabindex="-1"></div><div ${ref(this.panelRef)} part="panel" class="panel ${classMap({
      "has-icon": hasIcon,
      "has-description": hasDescription,
      "has-default": hasDefaultSlot
    })}" tabindex="0">${when(hasHeader, () => html`<slot name="header" part="header" class="header">${when(hasIcon, () => this.renderIcon())} ${when(hasHeadline, () => this.renderHeadline())}</slot>`)} ${when(hasBody, () => html`<div ${ref(this.bodyRef)} part="body" class="body">${when(hasDescription, () => this.renderDescription())}<slot></slot></div>`)} ${when(hasActionSlot, () => html`<slot name="action" part="action" class="action"></slot>`)}</div>`;
  }
  onOverlayClick() {
    this.emit("overlay-click");
    if (!this.closeOnOverlayClick) {
      return;
    }
    this.open = false;
  }
  renderIcon() {
    return html`<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderHeadline() {
    return html`<slot name="headline" part="headline" class="headline">${this.headline}</slot>`;
  }
  renderDescription() {
    return html`<slot name="description" part="description" class="description">${this.description}</slot>`;
  }
};
Dialog.styles = [componentStyle, style13];
__decorate([
  property({ reflect: true })
], Dialog.prototype, "icon", void 0);
__decorate([
  property({ reflect: true })
], Dialog.prototype, "headline", void 0);
__decorate([
  property({ reflect: true })
], Dialog.prototype, "description", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Dialog.prototype, "open", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Dialog.prototype, "fullscreen", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "close-on-esc"
  })
], Dialog.prototype, "closeOnEsc", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "close-on-overlay-click"
  })
], Dialog.prototype, "closeOnOverlayClick", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "stacked-actions"
  })
], Dialog.prototype, "stackedActions", void 0);
__decorate([
  queryAssignedElements({
    slot: "header",
    selector: "mdui-top-app-bar",
    flatten: true
  })
], Dialog.prototype, "topAppBarElements", void 0);
__decorate([
  watch("open")
], Dialog.prototype, "onOpenChange", null);
Dialog = __decorate([
  customElement("mdui-dialog")
], Dialog);

// node_modules/mdui/components/divider/style.js
var style14 = css`:host{display:block;height:.0625rem;background-color:rgb(var(--mdui-color-surface-variant))}:host([inset]:not([inset=false i])){margin-left:1rem}:host([middle]:not([middle=false i])){margin-left:1rem;margin-right:1rem}:host([vertical]:not([vertical=false i])){height:100%;width:.0625rem}`;

// node_modules/mdui/components/divider/index.js
var Divider = class Divider2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.vertical = false;
    this.inset = false;
    this.middle = false;
  }
  render() {
    return html``;
  }
};
Divider.styles = [componentStyle, style14];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Divider.prototype, "vertical", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Divider.prototype, "inset", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Divider.prototype, "middle", void 0);
Divider = __decorate([
  customElement("mdui-divider")
], Divider);

// node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName2(node) {
  if (isNode2(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow2(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode2(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode2(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow2(value).Node;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow2(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow2(value).ShadowRoot;
}
var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
var lastTraversableNodeNames = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName2(node));
}
function getComputedStyle2(element) {
  return getWindow2(element).getComputedStyle(element);
}
function getParentNode(node) {
  if (getNodeName2(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow2(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

// node_modules/mdui/components/dropdown/style.js
var style15 = css`:host{--z-index:2100;display:contents}.panel{display:block;position:fixed;z-index:var(--z-index)}`;

// node_modules/mdui/components/dropdown/index.js
var Dropdown = class Dropdown2 extends MduiElement {
  constructor() {
    super();
    this.open = false;
    this.disabled = false;
    this.trigger = "click";
    this.placement = "auto";
    this.stayOpenOnClick = false;
    this.openDelay = 150;
    this.closeDelay = 150;
    this.openOnPointer = false;
    this.panelRef = createRef();
    this.definedController = new DefinedController(this, {
      relatedElements: [""]
    });
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onDocumentKeydown = this.onDocumentKeydown.bind(this);
    this.onWindowScroll = this.onWindowScroll.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onPanelClick = this.onPanelClick.bind(this);
  }
  get triggerElement() {
    return this.triggerElements[0];
  }
  // 这些属性变更时，需要更新样式
  async onPositionChange() {
    if (this.open) {
      await this.definedController.whenDefined();
      this.updatePositioner();
    }
  }
  async onOpenChange() {
    const hasUpdated = this.hasUpdated;
    if (!this.open && !hasUpdated) {
      return;
    }
    await this.definedController.whenDefined();
    if (!hasUpdated) {
      await this.updateComplete;
    }
    const easingLinear = getEasing(this, "linear");
    const easingEmphasizedDecelerate = getEasing(this, "emphasized-decelerate");
    const easingEmphasizedAccelerate = getEasing(this, "emphasized-accelerate");
    if (this.open) {
      if (hasUpdated) {
        const eventProceeded = this.emit("open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      const focusablePanel = this.panelElements.find((panel) => isFunction(panel.focus));
      setTimeout(() => {
        focusablePanel?.focus();
      });
      const duration = getDuration(this, "medium4");
      await stopAnimations(this.panelRef.value);
      this.panelRef.value.hidden = false;
      this.updatePositioner();
      await Promise.all([
        animateTo(this.panelRef.value, [
          { transform: `${this.getCssScaleName()}(0.45)` },
          { transform: `${this.getCssScaleName()}(1)` }
        ], {
          duration: hasUpdated ? duration : 0,
          easing: easingEmphasizedDecelerate
        }),
        animateTo(this.panelRef.value, [{ opacity: 0 }, { opacity: 1, offset: 0.125 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        })
      ]);
      if (hasUpdated) {
        this.emit("opened");
      }
    } else {
      const eventProceeded = this.emit("close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      if (!this.hasTrigger("focus") && isFunction(this.triggerElement?.focus) && (this.contains(document.activeElement) || this.contains(document.activeElement?.assignedSlot ?? null))) {
        this.triggerElement.focus();
      }
      const duration = getDuration(this, "short4");
      await stopAnimations(this.panelRef.value);
      await Promise.all([
        animateTo(this.panelRef.value, [
          { transform: `${this.getCssScaleName()}(1)` },
          { transform: `${this.getCssScaleName()}(0.45)` }
        ], { duration, easing: easingEmphasizedAccelerate }),
        animateTo(this.panelRef.value, [{ opacity: 1 }, { opacity: 1, offset: 0.875 }, { opacity: 0 }], { duration, easing: easingLinear })
      ]);
      if (this.panelRef.value) {
        this.panelRef.value.hidden = true;
      }
      this.emit("closed");
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.definedController.whenDefined().then(() => {
      document.addEventListener("pointerdown", this.onDocumentClick);
      document.addEventListener("keydown", this.onDocumentKeydown);
      this.overflowAncestors = getOverflowAncestors(this.triggerElement);
      this.overflowAncestors.forEach((ancestor) => {
        ancestor.addEventListener("scroll", this.onWindowScroll);
      });
      this.observeResize = observeResize(this.triggerElement, () => {
        this.updatePositioner();
      });
    });
  }
  disconnectedCallback() {
    if (!this.open && this.panelRef.value) {
      this.panelRef.value.hidden = true;
    }
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this.onDocumentClick);
    document.removeEventListener("keydown", this.onDocumentKeydown);
    this.overflowAncestors?.forEach((ancestor) => {
      ancestor.removeEventListener("scroll", this.onWindowScroll);
    });
    this.observeResize?.unobserve();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("mouseleave", this.onMouseLeave);
    this.definedController.whenDefined().then(() => {
      this.triggerElement.addEventListener("focus", this.onFocus);
      this.triggerElement.addEventListener("click", this.onClick);
      this.triggerElement.addEventListener("contextmenu", this.onContextMenu);
      this.triggerElement.addEventListener("mouseenter", this.onMouseEnter);
    });
  }
  render() {
    return html`<slot name="trigger" part="trigger" class="trigger"></slot><slot ${ref(this.panelRef)} part="panel" class="panel" hidden @click="${this.onPanelClick}"></slot>`;
  }
  /**
   * 获取 dropdown 打开、关闭动画的 CSS scaleX 或 scaleY
   */
  getCssScaleName() {
    return this.animateDirection === "horizontal" ? "scaleX" : "scaleY";
  }
  /**
   * 在 document 上点击时，根据条件判断是否要关闭 dropdown
   */
  onDocumentClick(e) {
    if (this.disabled || !this.open) {
      return;
    }
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
    if (this.hasTrigger("contextmenu") && !this.hasTrigger("click") && path.includes(this.triggerElement)) {
      this.open = false;
    }
  }
  /**
   * 在 document 上按下按键时，根据条件判断是否要关闭 dropdown
   */
  onDocumentKeydown(event) {
    if (this.disabled || !this.open) {
      return;
    }
    if (event.key === "Escape") {
      this.open = false;
      return;
    }
    if (event.key === "Tab") {
      if (!this.hasTrigger("focus") && isFunction(this.triggerElement?.focus)) {
        event.preventDefault();
      }
      this.open = false;
    }
  }
  onWindowScroll() {
    window.requestAnimationFrame(() => this.onPositionChange());
  }
  hasTrigger(trigger) {
    const triggers = this.trigger.split(" ");
    return triggers.includes(trigger);
  }
  onFocus() {
    if (this.disabled || this.open || !this.hasTrigger("focus")) {
      return;
    }
    this.open = true;
  }
  onClick(e) {
    if (this.disabled || e.button || !this.hasTrigger("click")) {
      return;
    }
    if (this.open && (this.hasTrigger("hover") || this.hasTrigger("focus"))) {
      return;
    }
    this.pointerOffsetX = e.offsetX;
    this.pointerOffsetY = e.offsetY;
    this.open = !this.open;
  }
  onPanelClick(e) {
    if (!this.disabled && !this.stayOpenOnClick && $(e.target).is("mdui-menu-item")) {
      this.open = false;
    }
  }
  onContextMenu(e) {
    if (this.disabled || !this.hasTrigger("contextmenu")) {
      return;
    }
    e.preventDefault();
    this.pointerOffsetX = e.offsetX;
    this.pointerOffsetY = e.offsetY;
    this.open = true;
  }
  onMouseEnter() {
    if (this.disabled || !this.hasTrigger("hover")) {
      return;
    }
    window.clearTimeout(this.closeTimeout);
    if (this.openDelay) {
      this.openTimeout = window.setTimeout(() => {
        this.open = true;
      }, this.openDelay);
    } else {
      this.open = true;
    }
  }
  onMouseLeave() {
    if (this.disabled || !this.hasTrigger("hover")) {
      return;
    }
    window.clearTimeout(this.openTimeout);
    this.closeTimeout = window.setTimeout(() => {
      this.open = false;
    }, this.closeDelay || 50);
  }
  // 更新 panel 的位置
  updatePositioner() {
    const $panel = $(this.panelRef.value);
    const $window = $(window);
    const panelElements = this.panelElements;
    const panelRect = {
      width: Math.max(...panelElements?.map((panel) => panel.offsetWidth) ?? []),
      height: panelElements?.map((panel) => panel.offsetHeight).reduce((total, height) => total + height, 0)
    };
    const triggerClientRect = this.triggerElement.getBoundingClientRect();
    const triggerRect = this.openOnPointer ? {
      top: this.pointerOffsetY + triggerClientRect.top,
      left: this.pointerOffsetX + triggerClientRect.left,
      width: 0,
      height: 0
    } : triggerClientRect;
    const screenMargin = 8;
    let transformOriginX;
    let transformOriginY;
    let top;
    let left;
    let placement = this.placement;
    if (placement === "auto") {
      const windowWidth = $window.width();
      const windowHeight = $window.height();
      let position2;
      let alignment2;
      if (windowHeight - triggerRect.top - triggerRect.height > panelRect.height + screenMargin) {
        position2 = "bottom";
      } else if (triggerRect.top > panelRect.height + screenMargin) {
        position2 = "top";
      } else if (windowWidth - triggerRect.left - triggerRect.width > panelRect.width + screenMargin) {
        position2 = "right";
      } else if (triggerRect.left > panelRect.width + screenMargin) {
        position2 = "left";
      } else {
        position2 = "bottom";
      }
      if (["top", "bottom"].includes(position2)) {
        if (windowWidth - triggerRect.left > panelRect.width + screenMargin) {
          alignment2 = "start";
        } else if (triggerRect.left + triggerRect.width / 2 > panelRect.width / 2 + screenMargin && windowWidth - triggerRect.left - triggerRect.width / 2 > panelRect.width / 2 + screenMargin) {
          alignment2 = void 0;
        } else if (triggerRect.left + triggerRect.width > panelRect.width + screenMargin) {
          alignment2 = "end";
        } else {
          alignment2 = "start";
        }
      } else {
        if (windowHeight - triggerRect.top > panelRect.height + screenMargin) {
          alignment2 = "start";
        } else if (triggerRect.top + triggerRect.height / 2 > panelRect.height / 2 + screenMargin && windowHeight - triggerRect.top - triggerRect.height / 2 > panelRect.height / 2 + screenMargin) {
          alignment2 = void 0;
        } else if (triggerRect.top + triggerRect.height > panelRect.height + screenMargin) {
          alignment2 = "end";
        } else {
          alignment2 = "start";
        }
      }
      placement = alignment2 ? [position2, alignment2].join("-") : position2;
    }
    const [position, alignment] = placement.split("-");
    this.animateDirection = ["top", "bottom"].includes(position) ? "vertical" : "horizontal";
    switch (position) {
      case "top":
        transformOriginY = "bottom";
        top = triggerRect.top - panelRect.height;
        break;
      case "bottom":
        transformOriginY = "top";
        top = triggerRect.top + triggerRect.height;
        break;
      default:
        transformOriginY = "center";
        switch (alignment) {
          case "start":
            top = triggerRect.top;
            break;
          case "end":
            top = triggerRect.top + triggerRect.height - panelRect.height;
            break;
          default:
            top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
            break;
        }
        break;
    }
    switch (position) {
      case "left":
        transformOriginX = "right";
        left = triggerRect.left - panelRect.width;
        break;
      case "right":
        transformOriginX = "left";
        left = triggerRect.left + triggerRect.width;
        break;
      default:
        transformOriginX = "center";
        switch (alignment) {
          case "start":
            left = triggerRect.left;
            break;
          case "end":
            left = triggerRect.left + triggerRect.width - panelRect.width;
            break;
          default:
            left = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
            break;
        }
        break;
    }
    $panel.css({
      top,
      left,
      transformOrigin: [transformOriginX, transformOriginY].join(" ")
    });
  }
};
Dropdown.styles = [componentStyle, style15];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Dropdown.prototype, "open", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Dropdown.prototype, "disabled", void 0);
__decorate([
  property({ reflect: true })
], Dropdown.prototype, "trigger", void 0);
__decorate([
  property({ reflect: true })
], Dropdown.prototype, "placement", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "stay-open-on-click"
  })
], Dropdown.prototype, "stayOpenOnClick", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "open-delay" })
], Dropdown.prototype, "openDelay", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "close-delay" })
], Dropdown.prototype, "closeDelay", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "open-on-pointer"
  })
], Dropdown.prototype, "openOnPointer", void 0);
__decorate([
  queryAssignedElements({ slot: "trigger", flatten: true })
], Dropdown.prototype, "triggerElements", void 0);
__decorate([
  queryAssignedElements({ flatten: true })
], Dropdown.prototype, "panelElements", void 0);
__decorate([
  watch("placement", true),
  watch("openOnPointer", true)
], Dropdown.prototype, "onPositionChange", null);
__decorate([
  watch("open")
], Dropdown.prototype, "onOpenChange", null);
Dropdown = __decorate([
  customElement("mdui-dropdown")
], Dropdown);

// node_modules/@mdui/shared/helpers/delay.js
var delay = (duration = 0) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

// node_modules/mdui/components/fab/style.js
var style16 = css`:host{--shape-corner-small:var(--mdui-shape-corner-small);--shape-corner-normal:var(--mdui-shape-corner-large);--shape-corner-large:var(--mdui-shape-corner-extra-large);position:relative;display:inline-block;flex-shrink:0;overflow:hidden;text-align:center;border-radius:var(--shape-corner-normal);cursor:pointer;-webkit-tap-highlight-color:transparent;transition-property:box-shadow;transition-timing-function:var(--mdui-motion-easing-emphasized);transition-duration:var(--mdui-motion-duration-medium4);width:3.5rem;height:3.5rem;box-shadow:var(--mdui-elevation-level3);font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height)}.button{padding:0 1rem}:host([size=small]) .button{padding:0 .5rem}:host([size=large]) .button{padding:0 1.875rem}:host([lowered]){box-shadow:var(--mdui-elevation-level1)}:host([focus-visible]){box-shadow:var(--mdui-elevation-level3)}:host([lowered][focus-visible]){box-shadow:var(--mdui-elevation-level1)}:host([pressed]){box-shadow:var(--mdui-elevation-level3)}:host([lowered][pressed]){box-shadow:var(--mdui-elevation-level1)}:host([hover]){box-shadow:var(--mdui-elevation-level4)}:host([lowered][hover]){box-shadow:var(--mdui-elevation-level2)}:host([variant=primary]){color:rgb(var(--mdui-color-on-primary-container));background-color:rgb(var(--mdui-color-primary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-primary-container
    )}:host([variant=surface]){color:rgb(var(--mdui-color-primary));background-color:rgb(var(--mdui-color-surface-container-high));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([variant=surface][lowered]){background-color:rgb(var(--mdui-color-surface-container-low))}:host([variant=secondary]){color:rgb(var(--mdui-color-on-secondary-container));background-color:rgb(var(--mdui-color-secondary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([variant=tertiary]){color:rgb(var(--mdui-color-on-tertiary-container));background-color:rgb(var(--mdui-color-tertiary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-tertiary-container
    )}:host([size=small]){border-radius:var(--shape-corner-small);width:2.5rem;height:2.5rem}:host([size=large]){border-radius:var(--shape-corner-large);width:6rem;height:6rem}:host([disabled]:not([disabled=false i])),:host([loading]:not([loading=false i])){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])){color:rgba(var(--mdui-color-on-surface),38%);background-color:rgba(var(--mdui-color-on-surface),12%);box-shadow:var(--mdui-elevation-level0)}:host([extended]:not([extended=false i])){width:auto}.label{display:inline-flex;transition:opacity var(--mdui-motion-duration-short2) var(--mdui-motion-easing-linear) var(--mdui-motion-duration-short2);padding-left:.25rem;padding-right:.25rem}.has-icon .label{margin-left:.5rem}:host([size=small]) .has-icon .label{margin-left:.25rem}:host([size=large]) .has-icon .label{margin-left:1rem}:host(:not([extended])) .label,:host([extended=false i]) .label{opacity:0;transition-delay:0s;transition-duration:var(--mdui-motion-duration-short1)}:host([size=large]) .label{font-size:1.5em}.icon{display:inline-flex;font-size:1.71428571em}:host([size=large]) .icon{font-size:2.57142857em}.icon mdui-icon,::slotted([slot=icon]){font-size:inherit}mdui-circular-progress{display:inline-flex;width:1.5rem;height:1.5rem}:host([size=large]) mdui-circular-progress{width:2.25rem;height:2.25rem}:host([disabled]:not([disabled=false i])) mdui-circular-progress{stroke:rgba(var(--mdui-color-on-surface),38%)}`;

// node_modules/mdui/components/fab/index.js
var Fab = class Fab2 extends ButtonBase {
  constructor() {
    super(...arguments);
    this.variant = "primary";
    this.size = "normal";
    this.extended = false;
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "icon");
    this.definedController = new DefinedController(this, {
      relatedElements: [""]
    });
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  /**
   * extended 变更时，设置动画
   */
  async onExtendedChange() {
    const hasUpdated = this.hasUpdated;
    if (this.extended) {
      this.style.width = `${this.scrollWidth}px`;
    } else {
      this.style.width = "";
    }
    await this.definedController.whenDefined();
    await this.updateComplete;
    if (this.extended && !hasUpdated) {
      this.style.width = `${this.scrollWidth}px`;
    }
    if (!hasUpdated) {
      await delay();
      this.style.transitionProperty = "box-shadow, width, bottom, transform";
    }
  }
  render() {
    const className2 = cc({
      button: true,
      "has-icon": this.icon || this.hasSlotController.test("icon")
    });
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.isButton() ? this.renderButton({
      className: className2,
      part: "button",
      content: this.renderInner()
    }) : this.disabled || this.loading ? html`<span part="button" class="_a ${className2}">${this.renderInner()}</span>` : this.renderAnchor({
      className: className2,
      part: "button",
      content: this.renderInner()
    })}`;
  }
  renderLabel() {
    return html`<slot part="label" class="label"></slot>`;
  }
  renderIcon() {
    if (this.loading) {
      return this.renderLoading();
    }
    return html`<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderInner() {
    return [this.renderIcon(), this.renderLabel()];
  }
};
Fab.styles = [ButtonBase.styles, style16];
__decorate([
  property({ reflect: true })
], Fab.prototype, "variant", void 0);
__decorate([
  property({ reflect: true })
], Fab.prototype, "size", void 0);
__decorate([
  property({ reflect: true })
], Fab.prototype, "icon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Fab.prototype, "extended", void 0);
__decorate([
  watch("extended")
], Fab.prototype, "onExtendedChange", null);
Fab = __decorate([
  customElement("mdui-fab")
], Fab);

// node_modules/mdui/components/layout/layout-style.js
var layoutStyle = css`:host{position:relative;display:flex;flex:1 1 auto;overflow:hidden}:host([full-height]:not([full-height=false i])){height:100%}`;

// node_modules/mdui/components/layout/layout.js
var Layout = class Layout2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.fullHeight = false;
  }
  render() {
    return html`<slot></slot>`;
  }
};
Layout.styles = [componentStyle, layoutStyle];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "full-height"
  })
], Layout.prototype, "fullHeight", void 0);
Layout = __decorate([
  customElement("mdui-layout")
], Layout);

// node_modules/mdui/components/layout/layout-item-style.js
var layoutItemStyle = css`:host{display:flex;z-index:1}`;

// node_modules/mdui/components/layout/layout-item.js
var LayoutItem = class LayoutItem2 extends LayoutItemBase {
  constructor() {
    super(...arguments);
    this.placement = "top";
  }
  get layoutPlacement() {
    return this.placement;
  }
  // placement 变更时，需要重新调整布局
  onPlacementChange() {
    this.layoutManager?.updateLayout(this);
  }
  render() {
    return html`<slot></slot>`;
  }
};
LayoutItem.styles = [
  componentStyle,
  layoutItemStyle
];
__decorate([
  property({ reflect: true })
], LayoutItem.prototype, "placement", void 0);
__decorate([
  watch("placement", true)
], LayoutItem.prototype, "onPlacementChange", null);
LayoutItem = __decorate([
  customElement("mdui-layout-item")
], LayoutItem);

// node_modules/mdui/components/layout/layout-main-style.js
var layoutMainStyle = css`:host{flex:1 0 auto;max-width:100%;overflow:auto}`;

// node_modules/mdui/components/layout/layout-main.js
var LayoutMain = class LayoutMain2 extends MduiElement {
  connectedCallback() {
    super.connectedCallback();
    const parentElement = this.parentElement;
    if (isNodeName(parentElement, "mdui-layout")) {
      this.layoutManager = getLayout(parentElement);
      this.layoutManager.registerMain(this);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.layoutManager) {
      this.layoutManager.unregisterMain();
    }
  }
  render() {
    return html`<slot></slot>`;
  }
};
LayoutMain.styles = [
  componentStyle,
  layoutMainStyle
];
LayoutMain = __decorate([
  customElement("mdui-layout-main")
], LayoutMain);

// node_modules/mdui/components/linear-progress/style.js
var style17 = css`:host{--shape-corner:var(--mdui-shape-corner-none);position:relative;display:inline-block;width:100%;overflow:hidden;border-radius:var(--shape-corner);background-color:rgb(var(--mdui-color-surface-container-highest));height:.25rem}.determinate,.indeterminate{background-color:rgb(var(--mdui-color-primary))}.determinate{height:100%;transition:width var(--mdui-motion-duration-long2) var(--mdui-motion-easing-standard)}.indeterminate::before{position:absolute;top:0;bottom:0;left:0;background-color:inherit;animation:mdui-comp-progress-indeterminate 2s var(--mdui-motion-easing-linear) infinite;content:' '}.indeterminate::after{position:absolute;top:0;bottom:0;left:0;background-color:inherit;animation:mdui-comp-progress-indeterminate-short 2s var(--mdui-motion-easing-linear) infinite;content:' '}@keyframes mdui-comp-progress-indeterminate{0%{left:0;width:0}50%{left:30%;width:70%}75%{left:100%;width:0}}@keyframes mdui-comp-progress-indeterminate-short{0%{left:0;width:0}50%{left:0;width:0}75%{left:0;width:25%}100%{left:100%;width:0}}`;

// node_modules/mdui/components/linear-progress/index.js
var LinearProgress = class LinearProgress2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.max = 1;
  }
  render() {
    const isDeterminate = !isUndefined(this.value);
    if (isDeterminate) {
      const value = this.value;
      return html`<div part="indicator" class="determinate" style="${styleMap({
        width: `${value / Math.max(this.max ?? value, value) * 100}%`
      })}"></div>`;
    }
    return html`<div part="indicator" class="indeterminate"></div>`;
  }
};
LinearProgress.styles = [componentStyle, style17];
__decorate([
  property({ type: Number, reflect: true })
], LinearProgress.prototype, "max", void 0);
__decorate([
  property({ type: Number })
], LinearProgress.prototype, "value", void 0);
LinearProgress = __decorate([
  customElement("mdui-linear-progress")
], LinearProgress);

// node_modules/mdui/components/list/list-item-style.js
var listItemStyle = css`:host{--shape-corner:var(--mdui-shape-corner-none);--shape-corner-rounded:var(--mdui-shape-corner-extra-large);position:relative;display:block;border-radius:var(--shape-corner);--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([rounded]:not([rounded=false i])),:host([rounded]:not([rounded=false i])) mdui-ripple{border-radius:var(--shape-corner-rounded)}:host([active]:not([active=false i])){background-color:rgb(var(--mdui-color-secondary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([disabled]:not([disabled=false i])){pointer-events:none}.container{cursor:pointer;-webkit-user-select:none;user-select:none;text-decoration:none;color:inherit;-webkit-tap-highlight-color:transparent}:host([disabled]:not([disabled=false i])) .container{cursor:default;opacity:.38}:host([nonclickable]:not([href],[nonclickable=false i])) .container{cursor:auto;-webkit-user-select:auto;user-select:auto}.preset{display:flex;align-items:center;padding:.5rem 1.5rem .5rem 1rem;min-height:3.5rem}:host([alignment=start]) .preset{align-items:flex-start}:host([alignment=end]) .preset{align-items:flex-end}.body{display:flex;flex:1 1 100%;flex-direction:column;justify-content:center;min-width:0}.headline{display:block;color:rgb(var(--mdui-color-on-surface));font-size:var(--mdui-typescale-body-large-size);font-weight:var(--mdui-typescale-body-large-weight);letter-spacing:var(--mdui-typescale-body-large-tracking);line-height:var(--mdui-typescale-body-large-line-height)}:host([active]:not([active=false i])) .headline{color:rgb(var(--mdui-color-on-secondary-container))}.description{display:none;color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-body-medium-size);font-weight:var(--mdui-typescale-body-medium-weight);letter-spacing:var(--mdui-typescale-body-medium-tracking);line-height:var(--mdui-typescale-body-medium-line-height)}:host([disabled]:not([disabled=false i])) .description,:host([focused]) .description,:host([hover]) .description,:host([pressed]) .description{color:rgb(var(--mdui-color-on-surface))}.has-description .description{display:block}:host([description-line='1']) .description,:host([headline-line='1']) .headline{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}:host([description-line='2']) .description,:host([description-line='3']) .description,:host([headline-line='2']) .headline,:host([headline-line='3']) .headline{display:-webkit-box;overflow:hidden;text-overflow:ellipsis;-webkit-box-orient:vertical}:host([description-line='2']) .description,:host([headline-line='2']) .headline{-webkit-line-clamp:2}:host([description-line='3']) .description,:host([headline-line='3']) .headline{-webkit-line-clamp:3}.end-icon,.icon{display:flex;flex:0 0 auto;font-size:var(--mdui-typescale-label-small-size);font-weight:var(--mdui-typescale-label-small-weight);letter-spacing:var(--mdui-typescale-label-small-tracking);line-height:var(--mdui-typescale-label-small-line-height);color:rgb(var(--mdui-color-on-surface-variant))}:host([disabled]:not([disabled=false i])) .end-icon,:host([disabled]:not([disabled=false i])) .icon,:host([focused]) .end-icon,:host([focused]) .icon,:host([hover]) .end-icon,:host([hover]) .icon,:host([pressed]) .end-icon,:host([pressed]) .icon{color:rgb(var(--mdui-color-on-surface))}:host([active]:not([active=false i])) .end-icon,:host([active]:not([active=false i])) .icon{color:rgb(var(--mdui-color-on-secondary-container))}.end-icon mdui-icon,.icon mdui-icon,.is-end-icon ::slotted([slot=end-icon]),.is-icon ::slotted([slot=icon]){font-size:1.5rem}.has-icon .icon{margin-right:1rem}.has-icon ::slotted(mdui-checkbox[slot=icon]),.has-icon ::slotted(mdui-radio[slot=icon]){margin-left:-.5rem}.has-end-icon .end-icon{margin-left:1rem}.has-end-icon ::slotted(mdui-checkbox[slot=end-icon]),.has-end-icon ::slotted(mdui-radio[slot=end-icon]){margin-right:-.5rem}`;

// node_modules/mdui/components/list/list-item.js
var ListItem = class ListItem2 extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.active = false;
    this.nonclickable = false;
    this.rounded = false;
    this.alignment = "center";
    this.rippleRef = createRef();
    this.itemRef = createRef();
    this.hasSlotController = new HasSlotController(this, "[default]", "description", "icon", "end-icon", "custom");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.focusDisabled;
  }
  get focusElement() {
    return this.href && !this.disabled ? this.itemRef.value : this;
  }
  get focusDisabled() {
    return this.href ? this.disabled : this.disabled || this.nonclickable;
  }
  render() {
    const preset = !this.hasSlotController.test("custom");
    const hasIcon = this.icon || this.hasSlotController.test("icon");
    const hasEndIcon = this.endIcon || this.hasSlotController.test("end-icon");
    const hasDescription = this.description || this.hasSlotController.test("description");
    const isIcon = (element) => isNodeName(element, "mdui-icon") || getNodeName(element).startsWith("mdui-icon-");
    const className2 = cc({
      container: true,
      preset,
      "has-icon": hasIcon,
      "has-end-icon": hasEndIcon,
      "has-description": hasDescription,
      // icon, end-icon slot 中的元素是否为 mdui-icon 或 mdui-icon-* 组件
      "is-icon": isIcon(this.iconElements[0]),
      "is-end-icon": isIcon(this.endIconElements[0])
    });
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.href && !this.disabled ? this.renderAnchor({
      className: className2,
      content: this.renderInner(),
      part: "container",
      refDirective: ref(this.itemRef)
    }) : html`<div part="container" class="${className2}" ${ref(this.itemRef)}>${this.renderInner()}</div>`}`;
  }
  renderInner() {
    const hasDefaultSlot = this.hasSlotController.test("[default]");
    return html`<slot name="custom"><slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot><div part="body" class="body">${hasDefaultSlot ? html`<slot part="headline" class="headline"></slot>` : html`<div part="headline" class="headline">${this.headline}</div>`}<slot name="description" part="description" class="description">${this.description}</slot></div><slot name="end-icon" part="end-icon" class="end-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}"></mdui-icon>` : nothingTemplate}</slot></slot>`;
  }
};
ListItem.styles = [
  componentStyle,
  listItemStyle
];
__decorate([
  property({ reflect: true })
], ListItem.prototype, "headline", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "headline-line" })
], ListItem.prototype, "headlineLine", void 0);
__decorate([
  property({ reflect: true })
], ListItem.prototype, "description", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "description-line" })
], ListItem.prototype, "descriptionLine", void 0);
__decorate([
  property({ reflect: true })
], ListItem.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], ListItem.prototype, "endIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ListItem.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ListItem.prototype, "active", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ListItem.prototype, "nonclickable", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], ListItem.prototype, "rounded", void 0);
__decorate([
  property({ reflect: true })
], ListItem.prototype, "alignment", void 0);
__decorate([
  queryAssignedElements({ slot: "icon", flatten: true })
], ListItem.prototype, "iconElements", void 0);
__decorate([
  queryAssignedElements({ slot: "end-icon", flatten: true })
], ListItem.prototype, "endIconElements", void 0);
ListItem = __decorate([
  customElement("mdui-list-item")
], ListItem);

// node_modules/mdui/components/list/list-subheader-style.js
var listSubheaderStyle = css`:host{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:default;color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-label-small-size);font-weight:var(--mdui-typescale-label-small-weight);letter-spacing:var(--mdui-typescale-label-small-tracking);line-height:var(--mdui-typescale-label-small-line-height);padding-left:1rem;padding-right:1.5rem;height:3.5rem;line-height:3.5rem}`;

// node_modules/mdui/components/list/list-subheader.js
var ListSubheader = class ListSubheader2 extends MduiElement {
  render() {
    return html`<slot></slot>`;
  }
};
ListSubheader.styles = [
  componentStyle,
  listSubheaderStyle
];
ListSubheader = __decorate([
  customElement("mdui-list-subheader")
], ListSubheader);

// node_modules/mdui/components/list/list-style.js
var listStyle = css`:host{display:block;padding:.5rem 0}::slotted(mdui-divider[middle]){margin-left:1rem;margin-right:1.5rem}`;

// node_modules/mdui/components/list/list.js
var List = class List2 extends MduiElement {
  render() {
    return html`<slot></slot>`;
  }
};
List.styles = [componentStyle, listStyle];
List = __decorate([
  customElement("mdui-list")
], List);

// node_modules/@mdui/shared/icons/arrow-right.js
var IconArrowRight = class IconArrowRight2 extends LitElement {
  render() {
    return svgTag('<path d="m10 17 5-5-5-5v10z"/>');
  }
};
IconArrowRight.styles = style10;
IconArrowRight = __decorate([
  customElement("mdui-icon-arrow-right")
], IconArrowRight);

// node_modules/mdui/components/menu/menu-item-style.js
var menuItemStyle = css`:host{position:relative;display:block}:host([selected]){background-color:rgba(var(--mdui-color-primary),12%)}:host([disabled]:not([disabled=false i])){pointer-events:none}.container{cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}:host([disabled]:not([disabled=false i])) .container{cursor:default;opacity:.38}.preset{display:flex;align-items:center;text-decoration:none;height:3rem;padding:0 .75rem}.preset.dense{height:2rem}.label-container{flex:1 1 100%;min-width:0}.label{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:rgb(var(--mdui-color-on-surface));font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking)}.end-icon,.end-text,.icon,.selected-icon{display:none;flex:0 0 auto;color:rgb(var(--mdui-color-on-surface-variant))}.has-end-icon .end-icon,.has-end-text .end-text,.has-icon .icon,.has-icon .selected-icon{display:flex}.end-icon,.icon,.selected-icon{font-size:1.5rem}.end-icon::slotted(mdui-avatar),.icon::slotted(mdui-avatar),.selected-icon::slotted(mdui-avatar){width:1.5rem;height:1.5rem}.dense .end-icon,.dense .icon,.dense .selected-icon{font-size:1.125rem}.dense .end-icon::slotted(mdui-avatar),.dense .icon::slotted(mdui-avatar),.dense .selected-icon::slotted(mdui-avatar){width:1.125rem;height:1.125rem}.end-icon .i,.icon .i,.selected-icon .i,::slotted([slot=end-icon]),::slotted([slot=icon]),::slotted([slot=selected-icon]){font-size:inherit}.end-text{font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height)}.icon,.selected-icon{margin-right:.75rem}.end-icon,.end-text{margin-left:.75rem}.arrow-right{color:rgb(var(--mdui-color-on-surface))}.submenu{--shape-corner:var(--mdui-shape-corner-extra-small);display:block;position:absolute;z-index:1;border-radius:var(--shape-corner);background-color:rgb(var(--mdui-color-surface-container));box-shadow:var(--mdui-elevation-level2);min-width:7rem;max-width:17.5rem;padding-top:.5rem;padding-bottom:.5rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}.submenu::slotted(mdui-divider){margin-top:.5rem;margin-bottom:.5rem}`;

// node_modules/mdui/components/menu/menu-item.js
var MenuItem = class MenuItem2 extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super();
    this.disabled = false;
    this.submenuOpen = false;
    this.selected = false;
    this.dense = false;
    this.focusable = false;
    this.key = uniqueId();
    this.rippleRef = createRef();
    this.containerRef = createRef();
    this.submenuRef = createRef();
    this.hasSlotController = new HasSlotController(this, "[default]", "icon", "end-icon", "end-text", "submenu", "custom");
    this.definedController = new DefinedController(this, {
      relatedElements: [""]
    });
    this.onOuterClick = this.onOuterClick.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }
  get focusDisabled() {
    return this.disabled || !this.focusable;
  }
  get focusElement() {
    return this.href && !this.disabled ? this.containerRef.value : this;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get hasSubmenu() {
    return this.hasSlotController.test("submenu");
  }
  async onOpenChange() {
    const hasUpdated = this.hasUpdated;
    if (!this.submenuOpen && !hasUpdated) {
      return;
    }
    await this.definedController.whenDefined();
    if (!hasUpdated) {
      await this.updateComplete;
    }
    const easingLinear = getEasing(this, "linear");
    const easingEmphasizedDecelerate = getEasing(this, "emphasized-decelerate");
    const easingEmphasizedAccelerate = getEasing(this, "emphasized-accelerate");
    if (this.submenuOpen) {
      if (hasUpdated) {
        const eventProceeded = this.emit("submenu-open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      const duration = getDuration(this, "medium4");
      await stopAnimations(this.submenuRef.value);
      this.submenuRef.value.hidden = false;
      this.updateSubmenuPositioner();
      await Promise.all([
        animateTo(this.submenuRef.value, [{ transform: "scaleY(0.45)" }, { transform: "scaleY(1)" }], {
          duration: hasUpdated ? duration : 0,
          easing: easingEmphasizedDecelerate
        }),
        animateTo(this.submenuRef.value, [{ opacity: 0 }, { opacity: 1, offset: 0.125 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        })
      ]);
      if (hasUpdated) {
        this.emit("submenu-opened");
      }
    } else {
      const eventProceeded = this.emit("submenu-close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      const duration = getDuration(this, "short4");
      await stopAnimations(this.submenuRef.value);
      await Promise.all([
        animateTo(this.submenuRef.value, [{ transform: "scaleY(1)" }, { transform: "scaleY(0.45)" }], { duration, easing: easingEmphasizedAccelerate }),
        animateTo(this.submenuRef.value, [{ opacity: 1 }, { opacity: 1, offset: 0.875 }, { opacity: 0 }], { duration, easing: easingLinear })
      ]);
      if (this.submenuRef.value) {
        this.submenuRef.value.hidden = true;
      }
      this.emit("submenu-closed");
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.definedController.whenDefined().then(() => {
      document.addEventListener("pointerdown", this.onOuterClick);
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this.onOuterClick);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.definedController.whenDefined().then(() => {
      this.addEventListener("focus", this.onFocus);
      this.addEventListener("blur", this.onBlur);
      this.addEventListener("click", this.onClick);
      this.addEventListener("keydown", this.onKeydown);
      this.addEventListener("mouseenter", this.onMouseEnter);
      this.addEventListener("mouseleave", this.onMouseLeave);
    });
  }
  render() {
    const hasSubmenu = this.hasSubmenu;
    const hasCustomSlot = this.hasSlotController.test("custom");
    const hasEndIconSlot = this.hasSlotController.test("end-icon");
    const useDefaultEndIcon = !this.endIcon && hasSubmenu && !hasEndIconSlot;
    const hasEndIcon = this.endIcon || hasSubmenu || hasEndIconSlot;
    const hasIcon = !isUndefined(this.icon) || this.selects === "single" || this.selects === "multiple" || this.hasSlotController.test("icon");
    const hasEndText = !!this.endText || this.hasSlotController.test("end-text");
    const className2 = cc({
      container: true,
      dense: this.dense,
      preset: !hasCustomSlot,
      "has-icon": hasIcon,
      "has-end-text": hasEndText,
      "has-end-icon": hasEndIcon
    });
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.href && !this.disabled ? this.renderAnchor({
      part: "container",
      className: className2,
      content: this.renderInner(useDefaultEndIcon, hasIcon),
      refDirective: ref(this.containerRef),
      tabIndex: this.focusable ? 0 : -1
    }) : html`<div part="container" ${ref(this.containerRef)} class="${className2}">${this.renderInner(useDefaultEndIcon, hasIcon)}</div>`} ${when(hasSubmenu, () => html`<slot name="submenu" ${ref(this.submenuRef)} part="submenu" class="submenu" hidden></slot>`)}`;
  }
  /**
   * 点击子菜单外面的区域，关闭子菜单
   */
  onOuterClick(event) {
    if (!this.disabled && this.submenuOpen && this !== event.target && !$.contains(this, event.target)) {
      this.submenuOpen = false;
    }
  }
  hasTrigger(trigger) {
    return this.submenuTrigger ? this.submenuTrigger.split(" ").includes(trigger) : false;
  }
  onFocus() {
    if (this.disabled || this.submenuOpen || !this.hasTrigger("focus") || !this.hasSubmenu) {
      return;
    }
    this.submenuOpen = true;
  }
  onBlur() {
    if (this.disabled || !this.submenuOpen || !this.hasTrigger("focus") || !this.hasSubmenu) {
      return;
    }
    this.submenuOpen = false;
  }
  onClick(event) {
    if (this.disabled || event.button) {
      return;
    }
    if (!this.hasTrigger("click") || event.target !== this || !this.hasSubmenu) {
      return;
    }
    if (this.submenuOpen && (this.hasTrigger("hover") || this.hasTrigger("focus"))) {
      return;
    }
    this.submenuOpen = !this.submenuOpen;
  }
  onKeydown(event) {
    if (this.disabled || !this.hasSubmenu) {
      return;
    }
    if (!this.submenuOpen && event.key === "Enter") {
      event.stopPropagation();
      this.submenuOpen = true;
    }
    if (this.submenuOpen && event.key === "Escape") {
      event.stopPropagation();
      this.submenuOpen = false;
    }
  }
  onMouseEnter() {
    if (this.disabled || !this.hasTrigger("hover") || !this.hasSubmenu) {
      return;
    }
    window.clearTimeout(this.submenuCloseTimeout);
    if (this.submenuOpenDelay) {
      this.submenuOpenTimeout = window.setTimeout(() => {
        this.submenuOpen = true;
      }, this.submenuOpenDelay);
    } else {
      this.submenuOpen = true;
    }
  }
  onMouseLeave() {
    if (this.disabled || !this.hasTrigger("hover") || !this.hasSubmenu) {
      return;
    }
    window.clearTimeout(this.submenuOpenTimeout);
    this.submenuCloseTimeout = window.setTimeout(() => {
      this.submenuOpen = false;
    }, this.submenuCloseDelay || 50);
  }
  // 更新子菜单的位置
  updateSubmenuPositioner() {
    const $window = $(window);
    const $submenu = $(this.submenuRef.value);
    const itemRect = this.getBoundingClientRect();
    const submenuWidth = $submenu.innerWidth();
    const submenuHeight = $submenu.innerHeight();
    const screenMargin = 8;
    let placementX = "bottom";
    let placementY = "right";
    if ($window.height() - itemRect.top > submenuHeight + screenMargin) {
      placementX = "bottom";
    } else if (itemRect.top + itemRect.height > submenuHeight + screenMargin) {
      placementX = "top";
    }
    if ($window.width() - itemRect.left - itemRect.width > submenuWidth + screenMargin) {
      placementY = "right";
    } else if (itemRect.left > submenuWidth + screenMargin) {
      placementY = "left";
    }
    $(this.submenuRef.value).css({
      top: placementX === "bottom" ? 0 : itemRect.height - submenuHeight,
      left: placementY === "right" ? itemRect.width : -submenuWidth,
      transformOrigin: [
        placementY === "right" ? 0 : "100%",
        placementX === "bottom" ? 0 : "100%"
      ].join(" ")
    });
  }
  renderInner(useDefaultEndIcon, hasIcon) {
    return html`<slot name="custom">${this.selected ? html`<slot name="selected-icon" part="selected-icon" class="selected-icon">${this.selectedIcon ? html`<mdui-icon name="${this.selectedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-check class="i"></mdui-icon-check>`}</slot>` : html`<slot name="icon" part="icon" class="icon">${hasIcon ? html`<mdui-icon name="${this.icon}" class="i"></mdui-icon>` : nothingTemplate}</slot>`}<div class="label-container"><slot part="label" class="label"></slot></div><slot name="end-text" part="end-text" class="end-text">${this.endText}</slot>${useDefaultEndIcon ? html`<mdui-icon-arrow-right part="end-icon" class="end-icon arrow-right"></mdui-icon-arrow-right>` : html`<slot name="end-icon" part="end-icon" class="end-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}"></mdui-icon>` : nothingTemplate}</slot>`}</slot>`;
  }
};
MenuItem.styles = [
  componentStyle,
  menuItemStyle
];
__decorate([
  property({ reflect: true })
], MenuItem.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], MenuItem.prototype, "disabled", void 0);
__decorate([
  property({ reflect: true })
], MenuItem.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], MenuItem.prototype, "endIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-text" })
], MenuItem.prototype, "endText", void 0);
__decorate([
  property({ reflect: true, attribute: "selected-icon" })
], MenuItem.prototype, "selectedIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "submenu-open"
  })
], MenuItem.prototype, "submenuOpen", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], MenuItem.prototype, "selected", void 0);
__decorate([
  state()
], MenuItem.prototype, "dense", void 0);
__decorate([
  state()
], MenuItem.prototype, "selects", void 0);
__decorate([
  state()
], MenuItem.prototype, "submenuTrigger", void 0);
__decorate([
  state()
], MenuItem.prototype, "submenuOpenDelay", void 0);
__decorate([
  state()
], MenuItem.prototype, "submenuCloseDelay", void 0);
__decorate([
  state()
], MenuItem.prototype, "focusable", void 0);
__decorate([
  watch("submenuOpen")
], MenuItem.prototype, "onOpenChange", null);
MenuItem = __decorate([
  customElement("mdui-menu-item")
], MenuItem);

// node_modules/mdui/components/menu/menu-style.js
var menuStyle = css`:host{--shape-corner:var(--mdui-shape-corner-extra-small);position:relative;display:block;border-radius:var(--shape-corner);background-color:rgb(var(--mdui-color-surface-container));box-shadow:var(--mdui-elevation-level2);min-width:7rem;max-width:17.5rem;padding-top:.5rem;padding-bottom:.5rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}::slotted(mdui-divider){margin-top:.5rem;margin-bottom:.5rem}`;

// node_modules/mdui/components/menu/menu.js
var Menu = class Menu2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.dense = false;
    this.submenuTrigger = "click hover";
    this.submenuOpenDelay = 200;
    this.submenuCloseDelay = 200;
    this.selectedKeys = [];
    this.isInitial = true;
    this.lastActiveItems = [];
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-menu-item"]
    });
  }
  // 菜单项元素（包含子菜单中的菜单项）
  get items() {
    return $(this.childrenItems).find("mdui-menu-item").add(this.childrenItems).get();
  }
  // 菜单项元素（不包含已禁用的，包含子菜单中的菜单项）
  get itemsEnabled() {
    return this.items.filter((item) => !item.disabled);
  }
  // 当前菜单是否为单选
  get isSingle() {
    return this.selects === "single";
  }
  // 当前菜单是否为多选
  get isMultiple() {
    return this.selects === "multiple";
  }
  // 当前菜单是否可选择
  get isSelectable() {
    return this.isSingle || this.isMultiple;
  }
  // 当前菜单是否为子菜单
  get isSubmenu() {
    return !$(this).parent().length;
  }
  // 最深层级的子菜单中，最后交互过的 menu-item
  get lastActiveItem() {
    const index = this.lastActiveItems.length ? this.lastActiveItems.length - 1 : 0;
    return this.lastActiveItems[index];
  }
  set lastActiveItem(item) {
    const index = this.lastActiveItems.length ? this.lastActiveItems.length - 1 : 0;
    this.lastActiveItems[index] = item;
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.items.forEach((item) => {
      item.dense = this.dense;
      item.selects = this.selects;
      item.submenuTrigger = this.submenuTrigger;
      item.submenuOpenDelay = this.submenuOpenDelay;
      item.submenuCloseDelay = this.submenuCloseDelay;
    });
  }
  async onSelectsChange() {
    if (!this.isSelectable) {
      this.setSelectedKeys([]);
    } else if (this.isSingle) {
      this.setSelectedKeys(this.selectedKeys.slice(0, 1));
    }
    await this.onSelectedKeysChange();
  }
  async onSelectedKeysChange() {
    await this.definedController.whenDefined();
    const values = this.itemsEnabled.filter((item) => this.selectedKeys.includes(item.key)).map((item) => item.value);
    const value = this.isMultiple ? values : values[0] || void 0;
    this.setValue(value);
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    if (!this.isSelectable) {
      this.updateSelected();
      return;
    }
    const values = (this.isSingle ? [this.value] : (
      // 多选时，传入的值可能是字符串（通过 attribute 属性设置）；或字符串数组（通过 property 属性设置）
      isString(this.value) ? [this.value] : this.value
    )).filter((i) => i);
    if (!values.length) {
      this.setSelectedKeys([]);
    } else if (this.isSingle) {
      const firstItem = this.itemsEnabled.find((item) => item.value === values[0]);
      this.setSelectedKeys(firstItem ? [firstItem.key] : []);
    } else if (this.isMultiple) {
      this.setSelectedKeys(this.itemsEnabled.filter((item) => values.includes(item.value)).map((item) => item.key));
    }
    this.updateSelected();
    this.updateFocusable();
  }
  /**
   * 将焦点设置在当前元素上
   */
  focus(options) {
    if (this.lastActiveItem) {
      this.focusOne(this.lastActiveItem, options);
    }
  }
  /**
   * 从当前元素中移除焦点
   */
  blur() {
    if (this.lastActiveItem) {
      this.lastActiveItem.blur();
    }
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.definedController.whenDefined().then(() => {
      this.updateFocusable();
      this.lastActiveItem = this.items.find((item) => item.focusable);
    });
    this.addEventListener("submenu-open", (e) => {
      const $parentItem = $(e.target);
      const submenuItemsEnabled = $parentItem.children("mdui-menu-item:not([disabled])").get();
      const submenuLevel = $parentItem.parents("mdui-menu-item").length + 1;
      if (submenuItemsEnabled.length) {
        this.lastActiveItems[submenuLevel] = submenuItemsEnabled[0];
        this.updateFocusable();
        this.focusOne(this.lastActiveItems[submenuLevel]);
      }
    });
    this.addEventListener("submenu-close", (e) => {
      const $parentItem = $(e.target);
      const submenuLevel = $parentItem.parents("mdui-menu-item").length + 1;
      if (this.lastActiveItems.length - 1 === submenuLevel) {
        this.lastActiveItems.pop();
        this.updateFocusable();
        if (this.lastActiveItems[submenuLevel - 1]) {
          this.focusOne(this.lastActiveItems[submenuLevel - 1]);
        }
      }
    });
  }
  render() {
    return html`<slot @slotchange="${this.onSlotChange}" @click="${this.onClick}" @keydown="${this.onKeyDown}"></slot>`;
  }
  setSelectedKeys(selectedKeys) {
    if (!arraysEqualIgnoreOrder(this.selectedKeys, selectedKeys)) {
      this.selectedKeys = selectedKeys;
    }
  }
  setValue(value) {
    if (this.isSingle || isUndefined(this.value) || isUndefined(value)) {
      this.value = value;
    } else if (!arraysEqualIgnoreOrder(this.value, value)) {
      this.value = value;
    }
  }
  // 获取和指定菜单项同级的所有菜单项
  getSiblingsItems(item, onlyEnabled = false) {
    return $(item).parent().children(`mdui-menu-item${onlyEnabled ? ":not([disabled])" : ""}`).get();
  }
  // 更新 menu-item 的可聚焦状态
  updateFocusable() {
    if (this.lastActiveItem) {
      this.items.forEach((item) => {
        item.focusable = item.key === this.lastActiveItem.key;
      });
      return;
    }
    if (!this.selectedKeys.length) {
      this.itemsEnabled.forEach((item, index) => {
        item.focusable = !index;
      });
      return;
    }
    if (this.isSingle) {
      this.items.forEach((item) => {
        item.focusable = this.selectedKeys.includes(item.key);
      });
      return;
    }
    if (this.isMultiple) {
      const focusableItem = this.items.find((item) => item.focusable);
      if (!focusableItem?.key || !this.selectedKeys.includes(focusableItem.key)) {
        this.itemsEnabled.filter((item) => this.selectedKeys.includes(item.key)).forEach((item, index) => item.focusable = !index);
      }
    }
  }
  updateSelected() {
    this.items.forEach((item) => {
      item.selected = this.selectedKeys.includes(item.key);
    });
  }
  // 切换一个菜单项的选中状态
  selectOne(item) {
    if (this.isMultiple) {
      const selectedKeys = [...this.selectedKeys];
      if (selectedKeys.includes(item.key)) {
        selectedKeys.splice(selectedKeys.indexOf(item.key), 1);
      } else {
        selectedKeys.push(item.key);
      }
      this.setSelectedKeys(selectedKeys);
    }
    if (this.isSingle) {
      if (this.selectedKeys.includes(item.key)) {
        this.setSelectedKeys([]);
      } else {
        this.setSelectedKeys([item.key]);
      }
    }
    this.isInitial = false;
    this.updateSelected();
  }
  // 使一个 menu-item 可聚焦
  async focusableOne(item) {
    this.items.forEach((_item) => _item.focusable = _item.key === item.key);
    await delay();
  }
  // 聚焦一个 menu-item
  focusOne(item, options) {
    item.focus(options);
  }
  async onClick(event) {
    if (!this.definedController.isDefined()) {
      return;
    }
    if (this.isSubmenu) {
      return;
    }
    if (event.button) {
      return;
    }
    const target = event.target;
    const item = target.closest("mdui-menu-item");
    if (!item || item.disabled) {
      return;
    }
    this.lastActiveItem = item;
    if (this.isSelectable && item.value) {
      this.selectOne(item);
    }
    await this.focusableOne(item);
    this.focusOne(item);
  }
  async onKeyDown(event) {
    if (!this.definedController.isDefined()) {
      return;
    }
    if (this.isSubmenu) {
      return;
    }
    const item = event.target;
    if (event.key === "Enter") {
      event.preventDefault();
      item.click();
    }
    if (event.key === " ") {
      event.preventDefault();
      if (this.isSelectable && item.value) {
        this.selectOne(item);
        await this.focusableOne(item);
        this.focusOne(item);
      }
    }
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      const items = this.getSiblingsItems(item, true);
      const activeItem = items.find((item2) => item2.focusable);
      let index = activeItem ? items.indexOf(activeItem) : 0;
      if (items.length > 0) {
        event.preventDefault();
        if (event.key === "ArrowDown") {
          index++;
        } else if (event.key === "ArrowUp") {
          index--;
        } else if (event.key === "Home") {
          index = 0;
        } else if (event.key === "End") {
          index = items.length - 1;
        }
        if (index < 0) {
          index = items.length - 1;
        }
        if (index > items.length - 1) {
          index = 0;
        }
        this.lastActiveItem = items[index];
        await this.focusableOne(items[index]);
        this.focusOne(items[index]);
        return;
      }
    }
  }
};
Menu.styles = [componentStyle, menuStyle];
__decorate([
  property({ reflect: true })
  // eslint-disable-next-line prettier/prettier
], Menu.prototype, "selects", void 0);
__decorate([
  property()
], Menu.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Menu.prototype, "dense", void 0);
__decorate([
  property({ reflect: true, attribute: "submenu-trigger" })
], Menu.prototype, "submenuTrigger", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "submenu-open-delay" })
], Menu.prototype, "submenuOpenDelay", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "submenu-close-delay" })
], Menu.prototype, "submenuCloseDelay", void 0);
__decorate([
  state()
], Menu.prototype, "selectedKeys", void 0);
__decorate([
  queryAssignedElements({ flatten: true, selector: "mdui-menu-item" })
], Menu.prototype, "childrenItems", void 0);
__decorate([
  watch("dense"),
  watch("selects"),
  watch("submenuTrigger"),
  watch("submenuOpenDelay"),
  watch("submenuCloseDelay")
], Menu.prototype, "onSlotChange", null);
__decorate([
  watch("selects", true)
], Menu.prototype, "onSelectsChange", null);
__decorate([
  watch("selectedKeys", true)
], Menu.prototype, "onSelectedKeysChange", null);
__decorate([
  watch("value")
], Menu.prototype, "onValueChange", null);
Menu = __decorate([
  customElement("mdui-menu")
], Menu);

// node_modules/mdui/components/navigation-bar/navigation-bar-item-style.js
var navigationBarItemStyle = css`:host{--shape-corner-indicator:var(--mdui-shape-corner-full);position:relative;z-index:0;flex:1;overflow:hidden;min-width:3rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}.container{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-decoration:none;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;padding-top:.75rem;padding-bottom:.75rem}.container:not(.initial){transition:padding var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}mdui-ripple{z-index:1;left:50%;transform:translateX(-50%);width:4rem;height:2rem;margin-top:.75rem;border-radius:var(--mdui-shape-corner-full)}mdui-ripple:not(.initial){transition:margin-top var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}.indicator{position:relative;display:flex;align-items:center;justify-content:center;background-color:transparent;border-radius:var(--shape-corner-indicator);height:2rem;width:2rem}:not(.initial) .indicator{transition:background-color var(--mdui-motion-duration-short1) var(--mdui-motion-easing-standard),width var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}::slotted([slot=badge]){position:absolute;transform:translate(50%,-50%)}::slotted([slot=badge][variant=small]){transform:translate(.5625rem,-.5625rem)}.active-icon,.icon{color:rgb(var(--mdui-color-on-surface-variant));font-size:1.5rem}.active-icon mdui-icon,.icon mdui-icon,::slotted([slot=active]),::slotted([slot=icon]){font-size:inherit}.icon{display:flex}.active-icon{display:none}.label{display:flex;align-items:center;height:1rem;color:rgb(var(--mdui-color-on-surface-variant));margin-top:.25rem;margin-bottom:.25rem;font-size:var(--mdui-typescale-label-medium-size);font-weight:var(--mdui-typescale-label-medium-weight);letter-spacing:var(--mdui-typescale-label-medium-tracking);line-height:var(--mdui-typescale-label-medium-line-height)}:not(.initial) .label{transition:opacity var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear)}:host(:not([active])) mdui-ripple.label-visibility-selected,mdui-ripple.label-visibility-unlabeled{margin-top:1.5rem}.container.label-visibility-unlabeled,:host(:not([active])) .container.label-visibility-selected{padding-top:1.5rem;padding-bottom:0}.container.label-visibility-unlabeled .label,:host(:not([active])) .container.label-visibility-selected .label{opacity:0}:host([active]){--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([active]) .indicator{width:4rem;background-color:rgb(var(--mdui-color-secondary-container))}:host([active]) .active-icon,:host([active]) .icon{color:rgb(var(--mdui-color-on-secondary-container))}:host([active]) .has-active-icon .active-icon{display:flex}:host([active]) .has-active-icon .icon{display:none}:host([active]) .label{color:rgb(var(--mdui-color-on-surface))}`;

// node_modules/mdui/components/navigation-bar/navigation-bar-item.js
var NavigationBarItem = class NavigationBarItem2 extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super(...arguments);
    this.isInitial = true;
    this.active = false;
    this.disabled = false;
    this.key = uniqueId();
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "active-icon");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get focusElement() {
    return this.href ? this.renderRoot?.querySelector("._a") : this;
  }
  get focusDisabled() {
    return this.disabled;
  }
  render() {
    const labelVisibilityClassName = cc({
      "label-visibility-selected": this.labelVisibility === "selected",
      "label-visibility-labeled": this.labelVisibility === "labeled",
      "label-visibility-unlabeled": this.labelVisibility === "unlabeled",
      initial: this.isInitial
    });
    const className2 = cc([
      {
        container: true,
        "has-active-icon": this.activeIcon || this.hasSlotController.test("active-icon")
      },
      labelVisibilityClassName
    ]);
    return html`<mdui-ripple .noRipple="${!this.active || this.noRipple}" class="${labelVisibilityClassName}" ${ref(this.rippleRef)}></mdui-ripple>${this.href ? this.renderAnchor({
      part: "container",
      className: className2,
      content: this.renderInner()
    }) : html`<div part="container" class="${className2}">${this.renderInner()}</div>`}`;
  }
  renderInner() {
    return html`<div part="indicator" class="indicator"><slot name="badge" part="badge" class="badge"></slot><slot name="active-icon" part="active-icon" class="active-icon">${this.activeIcon ? html`<mdui-icon name="${this.activeIcon}"></mdui-icon>` : nothingTemplate}</slot><slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot></div><slot part="label" class="label"></slot>`;
  }
};
NavigationBarItem.styles = [
  componentStyle,
  navigationBarItemStyle
];
__decorate([
  property({ reflect: true })
], NavigationBarItem.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "active-icon" })
], NavigationBarItem.prototype, "activeIcon", void 0);
__decorate([
  property({ reflect: true })
], NavigationBarItem.prototype, "value", void 0);
__decorate([
  state()
], NavigationBarItem.prototype, "labelVisibility", void 0);
__decorate([
  state()
], NavigationBarItem.prototype, "isInitial", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationBarItem.prototype, "active", void 0);
__decorate([
  state()
], NavigationBarItem.prototype, "disabled", void 0);
NavigationBarItem = __decorate([
  customElement("mdui-navigation-bar-item")
], NavigationBarItem);

// node_modules/mdui/components/navigation-bar/navigation-bar-style.js
var navigationBarStyle = css`:host{--shape-corner:var(--mdui-shape-corner-none);--z-index:2000;position:fixed;right:0;bottom:0;left:0;display:flex;flex:0 0 auto;overflow:hidden;border-radius:var(--shape-corner) var(--shape-corner) 0 0;z-index:var(--z-index);transition-property:transform;transition-duration:var(--mdui-motion-duration-long2);transition-timing-function:var(--mdui-motion-easing-emphasized);height:5rem;background-color:rgb(var(--mdui-color-surface));box-shadow:var(--mdui-elevation-level2)}:host([scroll-target]:not([scroll-target=''])){position:absolute}:host([hide]:not([hide=false i])){transform:translateY(5.625rem);transition-duration:var(--mdui-motion-duration-short4)}`;

// node_modules/mdui/components/navigation-bar/navigation-bar.js
var NavigationBar = class NavigationBar2 extends ScrollBehaviorMixin(LayoutItemBase) {
  constructor() {
    super(...arguments);
    this.hide = false;
    this.labelVisibility = "auto";
    this.activeKey = 0;
    this.isInitial = true;
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-navigation-bar-item"]
    });
  }
  get scrollPaddingPosition() {
    return "bottom";
  }
  get layoutPlacement() {
    return "bottom";
  }
  async onActiveKeyChange() {
    await this.definedController.whenDefined();
    const item = this.items.find((item2) => item2.key === this.activeKey);
    this.value = item?.value;
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    const item = this.items.find((item2) => item2.value === this.value);
    this.activeKey = item?.key ?? 0;
    this.updateItems();
  }
  async onLabelVisibilityChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("transitionend", (event) => {
      if (event.target === this) {
        this.emit(this.hide ? "hidden" : "shown");
      }
    });
  }
  render() {
    return html`<slot @slotchange="${this.onSlotChange}" @click="${this.onClick}"></slot>`;
  }
  /**
   * 滚动行为
   * 当前仅支持 hide 这一个行为，所以不做行为类型判断
   */
  runScrollThreshold(isScrollingUp) {
    if (!isScrollingUp && !this.hide) {
      const eventProceeded = this.emit("hide", { cancelable: true });
      if (eventProceeded) {
        this.hide = true;
      }
    }
    if (isScrollingUp && this.hide) {
      const eventProceeded = this.emit("show", { cancelable: true });
      if (eventProceeded) {
        this.hide = false;
      }
    }
  }
  onClick(event) {
    if (event.button) {
      return;
    }
    const target = event.target;
    const item = target.closest("mdui-navigation-bar-item");
    if (!item) {
      return;
    }
    this.activeKey = item.key;
    this.isInitial = false;
    this.updateItems();
  }
  // 更新 <mdui-navigation-bar-item> 的状态
  updateItems() {
    const items = this.items;
    const labelVisibility = this.labelVisibility === "auto" ? items.length <= 3 ? "labeled" : "selected" : this.labelVisibility;
    items.forEach((item) => {
      item.active = this.activeKey === item.key;
      item.labelVisibility = labelVisibility;
      item.isInitial = this.isInitial;
    });
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
};
NavigationBar.styles = [
  componentStyle,
  navigationBarStyle
];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationBar.prototype, "hide", void 0);
__decorate([
  property({ reflect: true, attribute: "label-visibility" })
], NavigationBar.prototype, "labelVisibility", void 0);
__decorate([
  property({ reflect: true })
], NavigationBar.prototype, "value", void 0);
__decorate([
  property({ reflect: true, attribute: "scroll-behavior" })
], NavigationBar.prototype, "scrollBehavior", void 0);
__decorate([
  state()
], NavigationBar.prototype, "activeKey", void 0);
__decorate([
  queryAssignedElements({
    selector: "mdui-navigation-bar-item",
    flatten: true
  })
], NavigationBar.prototype, "items", void 0);
__decorate([
  watch("activeKey", true)
], NavigationBar.prototype, "onActiveKeyChange", null);
__decorate([
  watch("value")
], NavigationBar.prototype, "onValueChange", null);
__decorate([
  watch("labelVisibility", true)
], NavigationBar.prototype, "onLabelVisibilityChange", null);
NavigationBar = __decorate([
  customElement("mdui-navigation-bar")
], NavigationBar);

// node_modules/@mdui/shared/helpers/breakpoint.js
var breakpoint = (width) => {
  const window2 = getWindow();
  const document3 = getDocument();
  const computedStyle = window2.getComputedStyle(document3.documentElement);
  const containerWidth = isElement(width) ? $(width).innerWidth() : isNumber(width) ? width : $(window2).innerWidth();
  const getBreakpointValue = (breakpoint2) => {
    const width2 = computedStyle.getPropertyValue(`--mdui-breakpoint-${breakpoint2}`).toLowerCase();
    return parseFloat(width2);
  };
  const getNextBreakpoint = (breakpoint2) => {
    switch (breakpoint2) {
      case "xs":
        return "sm";
      case "sm":
        return "md";
      case "md":
        return "lg";
      case "lg":
        return "xl";
      case "xl":
        return "xxl";
    }
  };
  return {
    /**
     * 当前宽度是否大于指定断点值
     * @param breakpoint
     */
    up(breakpoint2) {
      return containerWidth >= getBreakpointValue(breakpoint2);
    },
    /**
     * 当前宽度是否小于指定断点值
     * @param breakpoint
     */
    down(breakpoint2) {
      return containerWidth < getBreakpointValue(breakpoint2);
    },
    /**
     * 当前宽度是否在指定断点值内
     * @param breakpoint
     */
    only(breakpoint2) {
      if (breakpoint2 === "xxl") {
        return this.up(breakpoint2);
      } else {
        return this.up(breakpoint2) && this.down(getNextBreakpoint(breakpoint2));
      }
    },
    /**
     * 当前宽度是否不在指定断点值内
     * @param breakpoint
     */
    not(breakpoint2) {
      return !this.only(breakpoint2);
    },
    /**
     * 当前宽度是否在指定断点值之间
     * @param startBreakpoint
     * @param endBreakpoint
     * @returns
     */
    between(startBreakpoint, endBreakpoint) {
      return this.up(startBreakpoint) && this.down(endBreakpoint);
    }
  };
};

// node_modules/mdui/components/navigation-drawer/style.js
var style18 = css`:host{--shape-corner:var(--mdui-shape-corner-large);--z-index:2200;display:none;position:fixed;top:0;bottom:0;left:0;z-index:1;width:22.5rem}:host([placement=right]){left:initial;right:0}:host([mobile]),:host([modal]:not([modal=false i])){top:0!important;right:0;bottom:0!important;width:initial;z-index:var(--z-index)}:host([placement=right][mobile]),:host([placement=right][modal]:not([modal=false i])){left:0}:host([contained]:not([contained=false i])){position:absolute}.overlay{position:absolute;inset:0;z-index:inherit;background-color:rgba(var(--mdui-color-scrim),.4)}.panel{display:block;position:absolute;top:0;bottom:0;left:0;width:100%;overflow:auto;z-index:inherit;background-color:rgb(var(--mdui-color-surface));box-shadow:var(--mdui-elevation-level0)}:host([placement=right]) .panel{left:initial;right:0}:host([mobile]) .panel,:host([modal]:not([modal=false i])) .panel{border-radius:0 var(--shape-corner) var(--shape-corner) 0;max-width:80%;width:22.5rem;background-color:rgb(var(--mdui-color-surface-container-low));box-shadow:var(--mdui-elevation-level1)}:host([placement=right][mobile]) .panel,:host([placement=right][modal]:not([modal=false i])) .panel{border-radius:var(--shape-corner) 0 0 var(--shape-corner)}`;

// node_modules/mdui/components/navigation-drawer/index.js
var NavigationDrawer = class NavigationDrawer2 extends LayoutItemBase {
  constructor() {
    super(...arguments);
    this.open = false;
    this.modal = false;
    this.closeOnEsc = false;
    this.closeOnOverlayClick = false;
    this.placement = "left";
    this.contained = false;
    this.mobile = false;
    this.overlayRef = createRef();
    this.panelRef = createRef();
    this.definedController = new DefinedController(this, {
      needDomReady: true
    });
  }
  get layoutPlacement() {
    return this.placement;
  }
  get lockTarget() {
    return this.contained || this.isParentLayout ? this.parentElement : document.documentElement;
  }
  get isModal() {
    return this.mobile || this.modal;
  }
  // contained 变更后，修改监听尺寸变化的元素。为 true 时，监听父元素；为 false 时，监听 body
  async onContainedChange() {
    await this.definedController.whenDefined();
    this.observeResize?.unobserve();
    this.setObserveResize();
  }
  onPlacementChange() {
    if (this.isParentLayout) {
      this.layoutManager.updateLayout(this);
    }
  }
  async onMobileChange() {
    if (!this.open || this.isParentLayout || this.contained) {
      return;
    }
    await this.definedController.whenDefined();
    if (this.isModal) {
      lockScreen(this, this.lockTarget);
      await this.getLockTargetAnimate(false, 0);
    } else {
      unlockScreen(this, this.lockTarget);
      await this.getLockTargetAnimate(true, 0);
    }
  }
  async onOpenChange() {
    let panel = this.panelRef.value;
    let overlay = this.overlayRef.value;
    const isRight = this.placement === "right";
    const easingLinear = getEasing(this, "linear");
    const easingEmphasized = getEasing(this, "emphasized");
    const setLayoutTransition = (duration, easing) => {
      $(this.layoutManager.getItemsAndMain()).css("transition", isNull(duration) ? null : `all ${duration}ms ${easing}`);
    };
    const stopOldAnimations = async () => {
      const elements = [];
      if (this.isModal) {
        elements.push(overlay, panel);
      } else if (!this.isParentLayout) {
        elements.push(this.lockTarget);
      }
      if (this.isParentLayout) {
        const layoutItems = this.layoutManager.getItemsAndMain();
        const layoutIndex = layoutItems.indexOf(this);
        elements.push(...layoutItems.slice(layoutIndex));
      }
      if (!this.isModal && !elements.includes(this)) {
        elements.push(this);
      }
      await Promise.all(elements.map((element) => stopAnimations(element)));
    };
    if (this.open) {
      const hasUpdated = this.hasUpdated;
      if (!hasUpdated) {
        await this.updateComplete;
        panel = this.panelRef.value;
        overlay = this.overlayRef.value;
      }
      if (hasUpdated) {
        const eventProceeded = this.emit("open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      await this.definedController.whenDefined();
      this.style.display = "block";
      this.originalTrigger = document.activeElement;
      if (this.isModal) {
        this.modalHelper.activate();
        if (!this.contained) {
          lockScreen(this, this.lockTarget);
        }
      }
      await stopOldAnimations();
      requestAnimationFrame(() => {
        const autoFocusTarget = this.querySelector("[autofocus]");
        if (autoFocusTarget) {
          autoFocusTarget.focus({ preventScroll: true });
        } else {
          panel.focus({ preventScroll: true });
        }
      });
      const duration = getDuration(this, "long2");
      const animations = [];
      if (this.isModal) {
        animations.push(animateTo(overlay, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        }));
      } else if (!this.isParentLayout) {
        animations.push(this.getLockTargetAnimate(true, hasUpdated ? duration : 0));
      }
      if (this.isParentLayout && hasUpdated) {
        setLayoutTransition(duration, easingEmphasized);
        this.layoutManager.updateLayout(this);
      }
      animations.push(animateTo(this.isModal ? panel : this, [
        { transform: `translateX(${isRight ? "" : "-"}100%)` },
        { transform: "translateX(0)" }
      ], {
        duration: hasUpdated ? duration : 0,
        easing: easingEmphasized
      }));
      await Promise.all(animations);
      if (!this.open) {
        return;
      }
      if (this.isParentLayout && hasUpdated) {
        setLayoutTransition(null);
      }
      if (hasUpdated) {
        this.emit("opened");
      }
    } else if (this.hasUpdated) {
      const eventProceeded = this.emit("close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      await this.definedController.whenDefined();
      if (this.isModal) {
        this.modalHelper.deactivate();
      }
      await stopOldAnimations();
      const duration = getDuration(this, "short4");
      const animations = [];
      if (this.isModal) {
        animations.push(animateTo(overlay, [{ opacity: 1 }, { opacity: 0 }], {
          duration,
          easing: easingLinear
        }));
      } else if (!this.isParentLayout) {
        animations.push(this.getLockTargetAnimate(false, duration));
      }
      if (this.isParentLayout) {
        setLayoutTransition(duration, easingEmphasized);
        this.layoutManager.updateLayout(this, { width: 0 });
      }
      animations.push(animateTo(this.isModal ? panel : this, [
        { transform: "translateX(0)" },
        { transform: `translateX(${isRight ? "" : "-"}100%)` }
      ], { duration, easing: easingEmphasized }));
      await Promise.all(animations);
      if (this.open) {
        return;
      }
      if (this.isParentLayout) {
        setLayoutTransition(null);
      }
      this.style.display = "none";
      if (this.isModal && !this.contained) {
        unlockScreen(this, this.lockTarget);
      }
      const trigger = this.originalTrigger;
      if (isFunction(trigger?.focus)) {
        setTimeout(() => trigger.focus());
      }
      this.emit("closed");
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.modalHelper = new Modal(this);
    this.definedController.whenDefined().then(() => {
      this.setObserveResize();
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unlockScreen(this, this.lockTarget);
    this.observeResize?.unobserve();
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("keydown", (event) => {
      if (this.open && this.closeOnEsc && event.key === "Escape" && this.isModal) {
        event.stopPropagation();
        this.open = false;
      }
    });
  }
  render() {
    return html`${when(this.isModal, () => html`<div ${ref(this.overlayRef)} part="overlay" class="overlay" @click="${this.onOverlayClick}"></div>`)}<slot ${ref(this.panelRef)} part="panel" class="panel" tabindex="0"></slot>`;
  }
  setObserveResize() {
    this.observeResize = observeResize(this.contained ? this.parentElement : document.documentElement, () => {
      const target = this.contained ? this.parentElement : void 0;
      this.mobile = breakpoint(target).down("md");
      if (this.isParentLayout) {
        this.layoutManager.updateLayout(this, {
          width: this.isModal ? 0 : void 0
        });
      }
    });
  }
  onOverlayClick() {
    this.emit("overlay-click");
    if (this.closeOnOverlayClick) {
      this.open = false;
    }
  }
  getLockTargetAnimate(open, duration) {
    const paddingName = this.placement === "right" ? "paddingRight" : "paddingLeft";
    const panelWidth = $(this.panelRef.value).innerWidth() + "px";
    return animateTo(this.lockTarget, [
      { [paddingName]: open ? 0 : panelWidth },
      { [paddingName]: open ? panelWidth : 0 }
    ], {
      duration,
      easing: getEasing(this, "emphasized"),
      fill: "forwards"
    });
  }
};
NavigationDrawer.styles = [componentStyle, style18];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationDrawer.prototype, "open", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationDrawer.prototype, "modal", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "close-on-esc"
  })
], NavigationDrawer.prototype, "closeOnEsc", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "close-on-overlay-click"
  })
], NavigationDrawer.prototype, "closeOnOverlayClick", void 0);
__decorate([
  property({ reflect: true })
  // eslint-disable-next-line prettier/prettier
], NavigationDrawer.prototype, "placement", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationDrawer.prototype, "contained", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationDrawer.prototype, "mobile", void 0);
__decorate([
  watch("contained", true)
], NavigationDrawer.prototype, "onContainedChange", null);
__decorate([
  watch("placement", true)
], NavigationDrawer.prototype, "onPlacementChange", null);
__decorate([
  watch("mobile", true),
  watch("modal", true)
], NavigationDrawer.prototype, "onMobileChange", null);
__decorate([
  watch("open")
], NavigationDrawer.prototype, "onOpenChange", null);
NavigationDrawer = __decorate([
  customElement("mdui-navigation-drawer")
], NavigationDrawer);

// node_modules/mdui/components/navigation-rail/navigation-rail-style.js
var navigationRailStyle = css`:host{--shape-corner:var(--mdui-shape-corner-none);--z-index:2000;position:fixed;top:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;border-radius:0 var(--shape-corner) var(--shape-corner) 0;z-index:var(--z-index);width:5rem;background-color:rgb(var(--mdui-color-surface));padding:.375rem .75rem}:host([contained]:not([contained=false i])){position:absolute}:host([divider]:not([divider=false i])){border-right:.0625rem solid rgb(var(--mdui-color-surface-variant));width:5.0625rem}:host([placement=right]){left:initial;right:0;border-radius:var(--shape-corner) 0 0 var(--shape-corner)}:host([placement=right][divider]:not([divider=false i])){border-right:none;border-left:.0625rem solid rgb(var(--mdui-color-surface-variant))}.bottom,.items,.top{display:flex;flex-direction:column;align-items:center;width:100%}.top{margin-bottom:1.75rem}.bottom{margin-top:1.75rem}::slotted([slot=bottom]),::slotted([slot=top]),::slotted(mdui-navigation-rail-item){margin-top:.375rem;margin-bottom:.375rem}:host([alignment=start]) .top-spacer{flex-grow:0}:host([alignment=start]) .bottom-spacer{flex-grow:1}:host([alignment=end]) .top-spacer{flex-grow:1}:host([alignment=end]) .bottom-spacer{flex-grow:0}:host([alignment=center]){justify-content:center}:host([alignment=center]) .bottom,:host([alignment=center]) .top{position:absolute}:host([alignment=center]) .top{top:.375rem}:host([alignment=center]) .bottom{bottom:.375rem}`;

// node_modules/mdui/components/navigation-rail/navigation-rail.js
var NavigationRail = class NavigationRail2 extends LayoutItemBase {
  constructor() {
    super(...arguments);
    this.placement = "left";
    this.alignment = "start";
    this.contained = false;
    this.divider = false;
    this.activeKey = 0;
    this.hasSlotController = new HasSlotController(this, "top", "bottom");
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-navigation-rail-item"]
    });
    this.isInitial = true;
  }
  get layoutPlacement() {
    return this.placement;
  }
  get parentTarget() {
    return this.contained || this.isParentLayout ? this.parentElement : document.body;
  }
  get isRight() {
    return this.placement === "right";
  }
  get paddingValue() {
    return ["fixed", "absolute"].includes($(this).css("position")) ? this.offsetWidth : void 0;
  }
  async onActiveKeyChange() {
    await this.definedController.whenDefined();
    const item = this.items.find((item2) => item2.key === this.activeKey);
    this.value = item?.value;
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    const item = this.items.find((item2) => item2.value === this.value);
    this.activeKey = item?.key ?? 0;
    this.updateItems();
  }
  async onContainedChange() {
    if (this.isParentLayout) {
      return;
    }
    await this.definedController.whenDefined();
    $(document.body).css({
      paddingLeft: this.contained || this.isRight ? null : this.paddingValue,
      paddingRight: this.contained || !this.isRight ? null : this.paddingValue
    });
    $(this.parentElement).css({
      paddingLeft: this.contained && !this.isRight ? this.paddingValue : null,
      paddingRight: this.contained && this.isRight ? this.paddingValue : null
    });
  }
  async onPlacementChange() {
    await this.definedController.whenDefined();
    this.layoutManager?.updateLayout(this);
    this.items.forEach((item) => {
      item.placement = this.placement;
    });
    if (!this.isParentLayout) {
      $(this.parentTarget).css({
        paddingLeft: this.isRight ? null : this.paddingValue,
        paddingRight: this.isRight ? this.paddingValue : null
      });
    }
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.isParentLayout) {
      this.definedController.whenDefined().then(() => {
        $(this.parentTarget).css({
          paddingLeft: this.isRight ? null : this.paddingValue,
          paddingRight: this.isRight ? this.paddingValue : null
        });
      });
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.isParentLayout && this.definedController.isDefined()) {
      $(this.parentTarget).css({
        paddingLeft: this.isRight ? void 0 : null,
        paddingRight: this.isRight ? null : void 0
      });
    }
  }
  render() {
    const hasTopSlot = this.hasSlotController.test("top");
    const hasBottomSlot = this.hasSlotController.test("bottom");
    return html`${when(hasTopSlot, () => html`<slot name="top" part="top" class="top"></slot>`)} <span class="top-spacer"></span><slot part="items" class="items" @slotchange="${this.onSlotChange}" @click="${this.onClick}"></slot><span class="bottom-spacer"></span> ${when(hasBottomSlot, () => html`<slot name="bottom" part="bottom" class="bottom"></slot>`)}`;
  }
  onClick(event) {
    if (event.button) {
      return;
    }
    const target = event.target;
    const item = target.closest("mdui-navigation-rail-item");
    if (!item) {
      return;
    }
    this.activeKey = item.key;
    this.isInitial = false;
    this.updateItems();
  }
  updateItems() {
    this.items.forEach((item) => {
      item.active = this.activeKey === item.key;
      item.placement = this.placement;
      item.isInitial = this.isInitial;
    });
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
};
NavigationRail.styles = [
  componentStyle,
  navigationRailStyle
];
__decorate([
  property({ reflect: true })
], NavigationRail.prototype, "value", void 0);
__decorate([
  property({ reflect: true })
  // eslint-disable-next-line prettier/prettier
], NavigationRail.prototype, "placement", void 0);
__decorate([
  property({ reflect: true })
], NavigationRail.prototype, "alignment", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationRail.prototype, "contained", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationRail.prototype, "divider", void 0);
__decorate([
  state()
], NavigationRail.prototype, "activeKey", void 0);
__decorate([
  queryAssignedElements({
    selector: "mdui-navigation-rail-item",
    flatten: true
  })
], NavigationRail.prototype, "items", void 0);
__decorate([
  watch("activeKey", true)
], NavigationRail.prototype, "onActiveKeyChange", null);
__decorate([
  watch("value")
], NavigationRail.prototype, "onValueChange", null);
__decorate([
  watch("contained", true)
], NavigationRail.prototype, "onContainedChange", null);
__decorate([
  watch("placement", true)
], NavigationRail.prototype, "onPlacementChange", null);
NavigationRail = __decorate([
  customElement("mdui-navigation-rail")
], NavigationRail);

// node_modules/mdui/components/navigation-rail/navigation-rail-item-style.js
var navigationRailItemStyle = css`:host{--shape-corner-indicator:var(--mdui-shape-corner-full);position:relative;z-index:0;width:100%;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface-variant)}.container{display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;height:3.5rem}.container:not(.initial){transition:padding var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}mdui-ripple{z-index:1;width:3.5rem;height:2rem;border-radius:var(--mdui-shape-corner-full)}.container:not(.has-label)+mdui-ripple{height:3.5rem}.indicator{position:relative;display:flex;align-items:center;justify-content:center;background-color:transparent;border-radius:var(--shape-corner-indicator);height:2rem;width:2rem}:not(.initial) .indicator{transition:background-color var(--mdui-motion-duration-short1) var(--mdui-motion-easing-standard),width var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard),height var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}::slotted([slot=badge]){position:absolute;transform:translate(50%,-50%)}.placement-right::slotted([slot=badge]){transform:translate(-50%,-50%)}::slotted([slot=badge][variant=small]){transform:translate(.5625rem,-.5625rem)}.placement-right::slotted([slot=badge][variant=small]){transform:translate(-.5625rem,-.5625rem)}.active-icon,.icon{color:rgb(var(--mdui-color-on-surface-variant));font-size:1.5rem}.active-icon mdui-icon,.icon mdui-icon,::slotted([slot=active-icon]),::slotted([slot=icon]){font-size:inherit}.icon{display:flex}.active-icon{display:none}.label{display:flex;align-items:center;height:1rem;color:rgb(var(--mdui-color-on-surface-variant));margin-top:.25rem;margin-bottom:.25rem;font-size:var(--mdui-typescale-label-medium-size);font-weight:var(--mdui-typescale-label-medium-weight);letter-spacing:var(--mdui-typescale-label-medium-tracking);line-height:var(--mdui-typescale-label-medium-line-height)}:not(.initial) .label{transition:opacity var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear)}:host([active]){--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([active]) .indicator{width:3.5rem;background-color:rgb(var(--mdui-color-secondary-container))}:host([active]) :not(.has-label) .indicator{height:3.5rem}:host([active]) .active-icon,:host([active]) .icon{color:rgb(var(--mdui-color-on-secondary-container))}:host([active]) .has-active-icon .active-icon{display:flex}:host([active]) .has-active-icon .icon{display:none}:host([active]) .label{color:rgb(var(--mdui-color-on-surface))}`;

// node_modules/mdui/components/navigation-rail/navigation-rail-item.js
var NavigationRailItem = class NavigationRailItem2 extends AnchorMixin(RippleMixin(FocusableMixin(MduiElement))) {
  constructor() {
    super(...arguments);
    this.active = false;
    this.isInitial = true;
    this.placement = "left";
    this.disabled = false;
    this.key = uniqueId();
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "[default]", "active-icon");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get focusElement() {
    return this.href ? this.renderRoot?.querySelector("._a") : this;
  }
  get focusDisabled() {
    return this.disabled;
  }
  render() {
    const hasDefaultSlot = this.hasSlotController.test("[default]");
    const className2 = cc({
      container: true,
      "has-label": hasDefaultSlot,
      "has-active-icon": this.activeIcon || this.hasSlotController.test("active-icon"),
      initial: this.isInitial
    });
    return html`${this.href ? this.renderAnchor({
      part: "container",
      className: className2,
      content: this.renderInner(hasDefaultSlot)
    }) : html`<div part="container" class="${className2}">${this.renderInner(hasDefaultSlot)}</div>`}<mdui-ripple .noRipple="${!this.active || this.noRipple}" ${ref(this.rippleRef)}></mdui-ripple>`;
  }
  renderInner(hasDefaultSlot) {
    return html`<div part="indicator" class="indicator"><slot name="badge" part="badge" class="${classMap({
      badge: true,
      "placement-right": this.placement === "right"
    })}"></slot><slot name="active-icon" part="active-icon" class="active-icon">${this.activeIcon ? html`<mdui-icon name="${this.activeIcon}"></mdui-icon>` : nothingTemplate}</slot><slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot></div>${hasDefaultSlot ? html`<slot part="label" class="label"></slot>` : nothing}`;
  }
};
NavigationRailItem.styles = [
  componentStyle,
  navigationRailItemStyle
];
__decorate([
  property({ reflect: true })
], NavigationRailItem.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "active-icon" })
], NavigationRailItem.prototype, "activeIcon", void 0);
__decorate([
  property({ reflect: true })
], NavigationRailItem.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], NavigationRailItem.prototype, "active", void 0);
__decorate([
  state()
], NavigationRailItem.prototype, "isInitial", void 0);
__decorate([
  state()
], NavigationRailItem.prototype, "placement", void 0);
__decorate([
  state()
], NavigationRailItem.prototype, "disabled", void 0);
NavigationRailItem = __decorate([
  customElement("mdui-navigation-rail-item")
], NavigationRailItem);

// node_modules/@mdui/shared/icons/circle.js
var IconCircle = class IconCircle2 extends LitElement {
  render() {
    return svgTag('<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"/>');
  }
};
IconCircle.styles = style10;
IconCircle = __decorate([
  customElement("mdui-icon-circle")
], IconCircle);

// node_modules/@mdui/shared/icons/radio-button-unchecked.js
var IconRadioButtonUnchecked = class IconRadioButtonUnchecked2 extends LitElement {
  render() {
    return svgTag('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>');
  }
};
IconRadioButtonUnchecked.styles = style10;
IconRadioButtonUnchecked = __decorate([
  customElement("mdui-icon-radio-button-unchecked")
], IconRadioButtonUnchecked);

// node_modules/mdui/components/radio/radio-style.js
var radioStyle = css`:host{position:relative;display:inline-flex;align-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;touch-action:manipulation;zoom:1;-webkit-user-drag:none;border-radius:.125rem;font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height)}.icon{display:flex;position:absolute;font-size:1.5rem}:not(.initial) .icon{transition-duration:var(--mdui-motion-duration-short4);transition-timing-function:var(--mdui-motion-easing-standard)}.unchecked-icon{transition-property:color;color:rgb(var(--mdui-color-on-surface-variant))}:host([focused]) .unchecked-icon,:host([hover]) .unchecked-icon,:host([pressed]) .unchecked-icon{color:rgb(var(--mdui-color-on-surface))}.checked-icon{opacity:0;transform:scale(.2);transition-property:color,opacity,transform;color:rgb(var(--mdui-color-primary))}.icon .i,::slotted([slot=checked-icon]),::slotted([slot=unchecked-icon]){color:inherit;font-size:inherit}i{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border-radius:50%;width:2.5rem;height:2.5rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}.label{display:flex;width:100%;padding-top:.625rem;padding-bottom:.625rem;color:rgb(var(--mdui-color-on-surface))}.label:not(.initial){transition:color var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}:host([checked]:not([checked=false i])) i{--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([checked]:not([checked=false i])) .icon{color:rgb(var(--mdui-color-primary))}:host([checked]:not([checked=false i])) .checked-icon{opacity:1;transform:scale(.5)}i.invalid{--mdui-comp-ripple-state-layer-color:var(--mdui-color-error)}i.invalid .icon{color:rgb(var(--mdui-color-error))}.label.invalid{color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])),:host([group-disabled]){cursor:default;pointer-events:none}:host([disabled]:not([disabled=false i])) .icon,:host([group-disabled]) .icon{color:rgba(var(--mdui-color-on-surface),38%)}:host([disabled]:not([disabled=false i])) .label,:host([group-disabled]) .label{color:rgba(var(--mdui-color-on-surface),38%)}`;

// node_modules/mdui/components/radio/radio.js
var Radio = class Radio2 extends RippleMixin(FocusableMixin(MduiElement)) {
  constructor() {
    super(...arguments);
    this.value = "";
    this.disabled = false;
    this.checked = false;
    this.invalid = false;
    this.groupDisabled = false;
    this.focusable = true;
    this.isInitial = true;
    this.rippleRef = createRef();
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.isDisabled();
  }
  get focusElement() {
    return this;
  }
  get focusDisabled() {
    return this.isDisabled() || !this.focusable;
  }
  onCheckedChange() {
    this.emit("change");
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("click", () => {
      if (!this.isDisabled()) {
        this.checked = true;
      }
    });
  }
  render() {
    const className2 = classMap({
      invalid: this.invalid,
      initial: this.isInitial
    });
    return html`<i part="control" class="${className2}"><mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple><slot name="unchecked-icon" part="unchecked-icon" class="icon unchecked-icon">${this.uncheckedIcon ? html`<mdui-icon name="${this.uncheckedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-radio-button-unchecked class="i"></mdui-icon-radio-button-unchecked>`}</slot><slot name="checked-icon" part="checked-icon" class="icon checked-icon">${this.checkedIcon ? html`<mdui-icon name="${this.checkedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-circle class="i"></mdui-icon-circle>`}</slot></i><slot part="label" class="label ${className2}"></slot>`;
  }
  isDisabled() {
    return this.disabled || this.groupDisabled;
  }
};
Radio.styles = [componentStyle, radioStyle];
__decorate([
  property({ reflect: true })
], Radio.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Radio.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Radio.prototype, "checked", void 0);
__decorate([
  property({ reflect: true, attribute: "unchecked-icon" })
], Radio.prototype, "uncheckedIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "checked-icon" })
], Radio.prototype, "checkedIcon", void 0);
__decorate([
  state()
], Radio.prototype, "invalid", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "group-disabled"
  })
], Radio.prototype, "groupDisabled", void 0);
__decorate([
  state()
], Radio.prototype, "focusable", void 0);
__decorate([
  state()
], Radio.prototype, "isInitial", void 0);
__decorate([
  watch("checked", true)
], Radio.prototype, "onCheckedChange", null);
Radio = __decorate([
  customElement("mdui-radio")
], Radio);

// node_modules/mdui/components/radio/radio-group-style.js
var radioGroupStyle = css`:host{display:inline-block}fieldset{border:none;padding:0;margin:0;min-width:0}input{position:absolute;padding:0;opacity:0;pointer-events:none;width:1.25rem;height:1.25rem;margin:0 0 0 .625rem}`;

// node_modules/mdui/components/radio/radio-group.js
var RadioGroup = class RadioGroup2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.name = "";
    this.value = "";
    this.defaultValue = "";
    this.required = false;
    this.invalid = false;
    this.isInitial = true;
    this.inputRef = createRef();
    this.formController = new FormController(this);
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-radio"]
    });
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  // 为了使 <mdui-radio> 可以不是该组件的直接子元素，这里不用 @queryAssignedElements()
  get items() {
    return $(this).find("mdui-radio").get();
  }
  get itemsEnabled() {
    return $(this).find("mdui-radio:not([disabled])").get();
  }
  async onValueChange() {
    this.isInitial = false;
    await this.definedController.whenDefined();
    this.emit("input");
    this.emit("change");
    this.updateItems();
    this.updateRadioFocusable();
    await this.updateComplete;
    const form = this.formController.getForm();
    if (form && formResets.get(form)?.has(this)) {
      this.invalid = false;
      formResets.get(form).delete(this);
    } else {
      this.invalid = !this.inputRef.value.checkValidity();
    }
  }
  async onInvalidChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      const eventProceeded = this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      if (!eventProceeded) {
        this.inputRef.value.blur();
        this.inputRef.value.focus();
      }
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
  }
  render() {
    return html`<fieldset><input ${ref(this.inputRef)} type="radio" class="input" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .checked="${!!this.value}" .required="${this.required}" tabindex="-1" @keydown="${this.onKeyDown}"><slot @click="${this.onClick}" @keydown="${this.onKeyDown}" @slotchange="${this.onSlotChange}" @change="${this.onCheckedChange}"></slot></fieldset>`;
  }
  // 更新 mdui-radio 的 checked 后，需要更新可聚焦状态
  // 同一个 mdui-radio-group 中的多个 mdui-radio，仅有一个可聚焦
  // 若有已选中的，则已选中的可聚焦；若没有已选中的，则第一个可聚焦
  updateRadioFocusable() {
    const items = this.items;
    const itemChecked = items.find((item) => item.checked);
    if (itemChecked) {
      items.forEach((item) => {
        item.focusable = item === itemChecked;
      });
    } else {
      this.itemsEnabled.forEach((item, index) => {
        item.focusable = !index;
      });
    }
  }
  async onClick(event) {
    await this.definedController.whenDefined();
    const target = event.target;
    const item = target.closest("mdui-radio");
    if (!item || item.disabled) {
      return;
    }
    this.value = item.value;
    await this.updateComplete;
    item.focus();
  }
  /**
   * 在内部的 `<mdui-radio>` 上按下按键时，在 `<mdui-radio>` 之间切换焦点
   */
  async onKeyDown(event) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      return;
    }
    event.preventDefault();
    await this.definedController.whenDefined();
    const items = this.itemsEnabled;
    const itemChecked = items.find((item) => item.checked) ?? items[0];
    const incr = event.key === " " ? 0 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1;
    let index = items.indexOf(itemChecked) + incr;
    if (index < 0) {
      index = items.length - 1;
    }
    if (index > items.length - 1) {
      index = 0;
    }
    this.value = items[index].value;
    await this.updateComplete;
    items[index].focus();
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateItems();
    this.updateRadioFocusable();
  }
  /**
   * slot 中的 mdui-radio 的 checked 变更时触发的事件
   */
  onCheckedChange(event) {
    event.stopPropagation();
  }
  // 更新 <mdui-radio> 的状态
  updateItems() {
    this.items.forEach((item) => {
      item.checked = item.value === this.value;
      item.invalid = this.invalid;
      item.groupDisabled = this.disabled;
      item.isInitial = this.isInitial;
    });
  }
};
RadioGroup.styles = [
  componentStyle,
  radioGroupStyle
];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], RadioGroup.prototype, "disabled", void 0);
__decorate([
  property({ reflect: true })
], RadioGroup.prototype, "form", void 0);
__decorate([
  property({ reflect: true })
], RadioGroup.prototype, "name", void 0);
__decorate([
  property({ reflect: true })
], RadioGroup.prototype, "value", void 0);
__decorate([
  defaultValue()
], RadioGroup.prototype, "defaultValue", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], RadioGroup.prototype, "required", void 0);
__decorate([
  state()
], RadioGroup.prototype, "invalid", void 0);
__decorate([
  watch("value", true)
], RadioGroup.prototype, "onValueChange", null);
__decorate([
  watch("invalid", true),
  watch("disabled")
], RadioGroup.prototype, "onInvalidChange", null);
RadioGroup = __decorate([
  customElement("mdui-radio-group")
], RadioGroup);

// node_modules/lit-html/development/directives/map.js
function* map2(items, f) {
  if (items !== void 0) {
    let i = 0;
    for (const value of items) {
      yield f(value, i++);
    }
  }
}

// node_modules/mdui/components/slider/slider-base-style.js
var sliderBaseStyle = css`:host{position:relative;display:block;width:100%;-webkit-tap-highlight-color:transparent;height:2.5rem;padding:0 1.25rem}label{position:relative;display:block;width:100%;height:100%}input[type=range]{position:absolute;inset:0;z-index:4;height:100%;cursor:pointer;opacity:0;appearance:none;width:calc(100% + 20rem * 2 / 16);margin:0 -1.25rem;padding:0 .75rem}:host([disabled]:not([disabled=false i])) input[type=range]{cursor:not-allowed}.track-active,.track-inactive{position:absolute;top:50%;height:.25rem;margin-top:-.125rem}.track-inactive{left:-.125rem;right:-.125rem;border-radius:var(--mdui-shape-corner-full);background-color:rgb(var(--mdui-color-surface-container-highest))}.invalid .track-inactive{background-color:rgba(var(--mdui-color-error),.12)}:host([disabled]:not([disabled=false i])) .track-inactive{background-color:rgba(var(--mdui-color-on-surface),.12)}.track-active{background-color:rgb(var(--mdui-color-primary))}.invalid .track-active{background-color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])) .track-active{background-color:rgba(var(--mdui-color-on-surface),.38)}.handle{position:absolute;top:50%;transform:translate(-50%);cursor:pointer;z-index:2;width:2.5rem;height:2.5rem;margin-top:-1.25rem;--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}.invalid .handle{--mdui-comp-ripple-state-layer-color:var(--mdui-color-error)}.handle .elevation,.handle::before{position:absolute;display:block;content:' ';left:.625rem;top:.625rem;width:1.25rem;height:1.25rem;border-radius:var(--mdui-shape-corner-full)}.handle .elevation{background-color:rgb(var(--mdui-color-primary));box-shadow:var(--mdui-elevation-level1)}.invalid .handle .elevation{background-color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])) .handle .elevation{background-color:rgba(var(--mdui-color-on-surface),.38);box-shadow:var(--mdui-elevation-level0)}.handle::before{background-color:rgb(var(--mdui-color-background))}.handle mdui-ripple{border-radius:var(--mdui-shape-corner-full)}.label{position:absolute;left:50%;transform:translateX(-50%) scale(0);transform-origin:center bottom;display:flex;align-items:center;justify-content:center;cursor:default;white-space:nowrap;-webkit-user-select:none;user-select:none;pointer-events:none;transition:transform var(--mdui-motion-duration-short2) var(--mdui-motion-easing-standard);bottom:2.5rem;min-width:1.75rem;height:1.75rem;padding:.375rem .5rem;border-radius:var(--mdui-shape-corner-full);color:rgb(var(--mdui-color-on-primary));font-size:var(--mdui-typescale-label-medium-size);font-weight:var(--mdui-typescale-label-medium-weight);letter-spacing:var(--mdui-typescale-label-medium-tracking);line-height:var(--mdui-typescale-label-medium-line-height);background-color:rgb(var(--mdui-color-primary))}.invalid .label{color:rgb(var(--mdui-color-on-error));background-color:rgb(var(--mdui-color-error))}.label::after{content:' ';position:absolute;z-index:-1;transform:rotate(45deg);width:.875rem;height:.875rem;bottom:-.125rem;background-color:rgb(var(--mdui-color-primary))}.invalid .label::after{background-color:rgb(var(--mdui-color-error))}.label-visible{transform:translateX(-50%) scale(1);transition:transform var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}.tickmark{position:absolute;top:50%;transform:translate(-50%);width:.125rem;height:.125rem;margin-top:-.0625rem;border-radius:var(--mdui-shape-corner-full);background-color:rgba(var(--mdui-color-on-surface-variant),.38)}.invalid .tickmark{background-color:rgba(var(--mdui-color-error),.38)}.tickmark.active{background-color:rgba(var(--mdui-color-on-primary),.38)}.invalid .tickmark.active{background-color:rgba(var(--mdui-color-on-error),.38)}:host([disabled]:not([disabled=false i])) .tickmark{background-color:rgba(var(--mdui-color-on-surface),.38)}`;

// node_modules/mdui/components/slider/slider-base.js
var SliderBase = class extends RippleMixin(FocusableMixin(MduiElement)) {
  constructor() {
    super(...arguments);
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.tickmarks = false;
    this.nolabel = false;
    this.disabled = false;
    this.name = "";
    this.invalid = false;
    this.labelVisible = false;
    this.inputRef = createRef();
    this.trackActiveRef = createRef();
    this.labelFormatter = (value) => value.toString();
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get focusElement() {
    return this.inputRef.value;
  }
  get focusDisabled() {
    return this.disabled;
  }
  onDisabledChange() {
    this.invalid = !this.inputRef.value.checkValidity();
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      const eventProceeded = this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      if (!eventProceeded) {
        this.blur();
        this.focus();
      }
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
  }
  /**
   * value 不在 min、max 或 step 的限制范围内时，修正 value 的值
   */
  fixValue(value) {
    const { min, max, step } = this;
    value = Math.min(Math.max(value, min), max);
    const steps = Math.round((value - min) / step);
    let fixedValue = min + steps * step;
    if (fixedValue > max) {
      fixedValue -= step;
    }
    return fixedValue;
  }
  /**
   * 获取候选值组成的数组
   */
  getCandidateValues() {
    return Array.from({ length: this.max - this.min + 1 }, (_, index) => index + this.min).filter((value) => !((value - this.min) % this.step));
  }
  /**
   * 渲染浮动标签
   */
  renderLabel(value) {
    return when(!this.nolabel, () => html`<div part="label" class="label ${classMap({ "label-visible": this.labelVisible })}">${this.labelFormatter(value)}</div>`);
  }
  onChange() {
    this.emit("change");
  }
};
SliderBase.styles = [
  componentStyle,
  sliderBaseStyle
];
__decorate([
  property({ type: Number, reflect: true })
], SliderBase.prototype, "min", void 0);
__decorate([
  property({ type: Number, reflect: true })
], SliderBase.prototype, "max", void 0);
__decorate([
  property({ type: Number, reflect: true })
], SliderBase.prototype, "step", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SliderBase.prototype, "tickmarks", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SliderBase.prototype, "nolabel", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SliderBase.prototype, "disabled", void 0);
__decorate([
  property({ reflect: true })
], SliderBase.prototype, "form", void 0);
__decorate([
  property({ reflect: true })
], SliderBase.prototype, "name", void 0);
__decorate([
  state()
], SliderBase.prototype, "invalid", void 0);
__decorate([
  state()
], SliderBase.prototype, "labelVisible", void 0);
__decorate([
  property({ attribute: false })
], SliderBase.prototype, "labelFormatter", void 0);
__decorate([
  watch("disabled", true)
], SliderBase.prototype, "onDisabledChange", null);

// node_modules/mdui/components/range-slider/index.js
var RangeSlider = class RangeSlider2 extends SliderBase {
  constructor() {
    super(...arguments);
    this.defaultValue = [];
    this.currentHandle = "start";
    this.rippleStartRef = createRef();
    this.rippleEndRef = createRef();
    this.handleStartRef = createRef();
    this.handleEndRef = createRef();
    this.formController = new FormController(this);
    this._value = [];
    this.getRippleIndex = () => {
      if (this.hoverHandle) {
        return this.hoverHandle === "start" ? 0 : 1;
      }
      return this.currentHandle === "start" ? 0 : 1;
    };
  }
  /**
   * 滑块的值，为数组格式，将于表单数据一起提交。
   *
   * **NOTE**：该属性无法通过 HTML 属性设置初始值，如果要修改该值，只能通过修改 JavaScript 属性值实现。
   */
  get value() {
    return this._value;
  }
  set value(_value) {
    const oldValue = [...this._value];
    this._value = [this.fixValue(_value[0]), this.fixValue(_value[1])];
    this.requestUpdate("value", oldValue);
    this.updateComplete.then(() => {
      this.updateStyle();
      const form = this.formController.getForm();
      if (form && formResets.get(form)?.has(this)) {
        this.invalid = false;
        formResets.get(form).delete(this);
      } else {
        this.invalid = !this.inputRef.value.checkValidity();
      }
    });
  }
  get rippleElement() {
    return [this.rippleStartRef.value, this.rippleEndRef.value];
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.value.length) {
      this.value = [this.min, this.max];
    }
    this.value[0] = this.fixValue(this.value[0]);
    this.value[1] = this.fixValue(this.value[1]);
    if (!this.defaultValue.length) {
      this.defaultValue = [...this.value];
    }
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    const getCurrentHandle = (event) => {
      const $this = $(this);
      const paddingLeft = parseFloat($this.css("padding-left"));
      const paddingRight = parseFloat($this.css("padding-right"));
      const percent = (event.offsetX - paddingLeft) / (this.clientWidth - paddingLeft - paddingRight);
      const pointerValue = (this.max - this.min) * percent + this.min;
      const middleValue = (this.value[1] - this.value[0]) / 2 + this.value[0];
      return pointerValue > middleValue ? "end" : "start";
    };
    const onTouchStart = () => {
      if (!this.disabled) {
        this.labelVisible = true;
      }
    };
    const onTouchEnd = () => {
      if (!this.disabled) {
        this.labelVisible = false;
      }
    };
    this.addEventListener("touchstart", onTouchStart);
    this.addEventListener("mousedown", onTouchStart);
    this.addEventListener("touchend", onTouchEnd);
    this.addEventListener("mouseup", onTouchEnd);
    this.addEventListener("pointerdown", (event) => {
      this.currentHandle = getCurrentHandle(event);
    });
    this.addEventListener("pointermove", (event) => {
      const currentHandle = getCurrentHandle(event);
      if (this.hoverHandle !== currentHandle) {
        this.endHover(event);
        this.hoverHandle = currentHandle;
        this.startHover(event);
      }
    });
    this.updateStyle();
  }
  /**
   * <input /> 用于提供拖拽操作
   * <input class="invalid" /> 用于提供 html5 自带的表单错误提示
   */
  render() {
    return html`<label class="${classMap({ invalid: this.invalid })}"><input ${ref(this.inputRef)} type="range" step="${this.step}" min="${this.min}" max="${this.max}" ?disabled="${this.disabled}" @input="${this.onInput}" @change="${this.onChange}"><div part="track-inactive" class="track-inactive"></div><div ${ref(this.trackActiveRef)} part="track-active" class="track-active"></div><div ${ref(this.handleStartRef)} part="handle" class="handle start" style="${styleMap({
      "z-index": this.currentHandle === "start" ? "2" : "1"
    })}"><div class="elevation"></div><mdui-ripple ${ref(this.rippleStartRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.renderLabel(this.value[0])}</div><div ${ref(this.handleEndRef)} part="handle" class="handle end" style="${styleMap({
      "z-index": this.currentHandle === "end" ? "2" : "1"
    })}"><div class="elevation"></div><mdui-ripple ${ref(this.rippleEndRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.renderLabel(this.value[1])}</div>${when(this.tickmarks, () => map2(this.getCandidateValues(), (value) => html`<div part="tickmark" class="tickmark ${classMap({
      active: value > this.value[0] && value < this.value[1]
    })}" style="${styleMap({
      left: `${(value - this.min) / this.max * 100}%`,
      display: value === this.value[0] || value === this.value[1] ? "none" : "block"
    })}"></div>`))}</label>`;
  }
  updateStyle() {
    const getPercent = (value) => (value - this.min) / (this.max - this.min) * 100;
    const startPercent = getPercent(this.value[0]);
    const endPercent = getPercent(this.value[1]);
    this.trackActiveRef.value.style.width = `${endPercent - startPercent}%`;
    this.trackActiveRef.value.style.left = `${startPercent}%`;
    this.handleStartRef.value.style.left = `${startPercent}%`;
    this.handleEndRef.value.style.left = `${endPercent}%`;
  }
  onInput() {
    const isStart = this.currentHandle === "start";
    const value = parseFloat(this.inputRef.value.value);
    const startValue = this.value[0];
    const endValue = this.value[1];
    const doInput = () => {
      this.updateStyle();
    };
    if (isStart) {
      if (value <= endValue) {
        this.value = [value, endValue];
        doInput();
      } else if (startValue !== endValue) {
        this.value = [endValue, endValue];
        doInput();
      }
    } else {
      if (value >= startValue) {
        this.value = [startValue, value];
        doInput();
      } else if (startValue !== endValue) {
        this.value = [startValue, startValue];
        doInput();
      }
    }
  }
};
RangeSlider.styles = [SliderBase.styles];
__decorate([
  defaultValue()
], RangeSlider.prototype, "defaultValue", void 0);
__decorate([
  state()
], RangeSlider.prototype, "currentHandle", void 0);
__decorate([
  property({ type: Array, attribute: false })
], RangeSlider.prototype, "value", null);
RangeSlider = __decorate([
  customElement("mdui-range-slider")
], RangeSlider);

// node_modules/mdui/components/segmented-button/segmented-button-style.js
var segmentedButtonStyle = css`:host{position:relative;display:inline-flex;flex-grow:1;flex-shrink:0;float:left;height:100%;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;border:.0625rem solid rgb(var(--mdui-color-outline))}.button{width:100%;padding:0 .75rem}:host([invalid]){color:rgb(var(--mdui-color-error));border-color:rgb(var(--mdui-color-error))}:host([invalid]) .button{background-color:rgb(var(--mdui-color-error-container))}:host([selected]){color:rgb(var(--mdui-color-on-secondary-container));background-color:rgb(var(--mdui-color-secondary-container));--mdui-comp-ripple-state-layer-color:var(
      --mdui-color-on-secondary-container
    )}:host([disabled]:not([disabled=false i])),:host([group-disabled]){cursor:default;pointer-events:none;color:rgba(var(--mdui-color-on-surface),38%);border-color:rgba(var(--mdui-color-on-surface),12%)}:host([loading]:not([loading=false i])){cursor:default;pointer-events:none}:host(:not(.mdui-segmented-button-first)){margin-left:-.0625rem}:host(.mdui-segmented-button-first){border-radius:var(--shape-corner) 0 0 var(--shape-corner)}:host(.mdui-segmented-button-last){border-radius:0 var(--shape-corner) var(--shape-corner) 0}.end-icon,.icon,.selected-icon{display:inline-flex;font-size:1.28571429em}.end-icon .i,.icon .i,.selected-icon .i,::slotted([slot=end-icon]),::slotted([slot=icon]),::slotted([slot=selected-icon]){font-size:inherit}mdui-circular-progress{width:1.125rem;height:1.125rem}:host([disabled]:not([disabled=false i])) mdui-circular-progress{opacity:.38}.label{display:inline-flex}.has-icon .label{padding-left:.5rem}.has-end-icon .label{padding-right:.5rem}`;

// node_modules/mdui/components/segmented-button/segmented-button.js
var SegmentedButton = class SegmentedButton2 extends ButtonBase {
  constructor() {
    super(...arguments);
    this.selected = false;
    this.invalid = false;
    this.groupDisabled = false;
    this.key = uniqueId();
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "[default]", "icon", "end-icon");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.isDisabled() || this.loading;
  }
  get focusDisabled() {
    return this.isDisabled() || this.loading;
  }
  render() {
    const className2 = cc({
      button: true,
      "has-icon": this.icon || this.selected || this.loading || this.hasSlotController.test("icon"),
      "has-end-icon": this.endIcon || this.hasSlotController.test("end-icon")
    });
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.isButton() ? this.renderButton({
      className: className2,
      part: "button",
      content: this.renderInner()
    }) : this.isDisabled() || this.loading ? html`<span part="button" class="_a ${className2}">${this.renderInner()}</span>` : this.renderAnchor({
      className: className2,
      part: "button",
      content: this.renderInner()
    })}`;
  }
  isDisabled() {
    return this.disabled || this.groupDisabled;
  }
  renderIcon() {
    if (this.loading) {
      return this.renderLoading();
    }
    if (this.selected) {
      return html`<slot name="selected-icon" part="selected-icon" class="selected-icon">${this.selectedIcon ? html`<mdui-icon name="${this.selectedIcon}" class="i"></mdui-icon>` : html`<mdui-icon-check class="i"></mdui-icon-check>`}</slot>`;
    }
    return html`<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}" class="i"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderLabel() {
    const hasLabel = this.hasSlotController.test("[default]");
    if (!hasLabel) {
      return nothingTemplate;
    }
    return html`<slot part="label" class="label"></slot>`;
  }
  renderEndIcon() {
    return html`<slot name="end-icon" part="end-icon" class="end-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}" class="i"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderInner() {
    return [this.renderIcon(), this.renderLabel(), this.renderEndIcon()];
  }
};
SegmentedButton.styles = [
  ButtonBase.styles,
  segmentedButtonStyle
];
__decorate([
  property({ reflect: true })
], SegmentedButton.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], SegmentedButton.prototype, "endIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "selected-icon" })
], SegmentedButton.prototype, "selectedIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SegmentedButton.prototype, "selected", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SegmentedButton.prototype, "invalid", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "group-disabled"
  })
], SegmentedButton.prototype, "groupDisabled", void 0);
SegmentedButton = __decorate([
  customElement("mdui-segmented-button")
], SegmentedButton);

// node_modules/mdui/components/segmented-button/segmented-button-group-style.js
var segmentedButtonGroupStyle = css`:host{--shape-corner:var(--mdui-shape-corner-full);position:relative;display:inline-flex;vertical-align:middle;height:2.5rem;font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking);line-height:var(--mdui-typescale-label-large-line-height);color:rgb(var(--mdui-color-on-surface));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([full-width]:not([full-width=false i])){display:flex;flex-wrap:nowrap}input,select{position:absolute;width:100%;height:100%;padding:0;opacity:0;pointer-events:none}`;

// node_modules/mdui/components/segmented-button/segmented-button-group.js
var SegmentedButtonGroup = class SegmentedButtonGroup2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.fullWidth = false;
    this.disabled = false;
    this.required = false;
    this.name = "";
    this.value = "";
    this.defaultValue = "";
    this.selectedKeys = [];
    this.invalid = false;
    this.isInitial = true;
    this.inputRef = createRef();
    this.formController = new FormController(this);
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-segmented-button"]
    });
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  // 为了使 <mdui-segmented-button> 可以不是该组件的直接子元素，这里不用 @queryAssignedElements()
  get items() {
    return $(this).find("mdui-segmented-button").get();
  }
  // 所有的子项元素（不包含已禁用的）
  get itemsEnabled() {
    return $(this).find("mdui-segmented-button:not([disabled])").get();
  }
  // 是否为单选
  get isSingle() {
    return this.selects === "single";
  }
  // 是否为多选
  get isMultiple() {
    return this.selects === "multiple";
  }
  // 是否可选择
  get isSelectable() {
    return this.isSingle || this.isMultiple;
  }
  async onSelectsChange() {
    if (!this.isSelectable) {
      this.setSelectedKeys([]);
    } else if (this.isSingle) {
      this.setSelectedKeys(this.selectedKeys.slice(0, 1));
    }
    await this.onSelectedKeysChange();
  }
  async onSelectedKeysChange() {
    await this.definedController.whenDefined();
    const values = this.itemsEnabled.filter((item) => this.selectedKeys.includes(item.key)).map((item) => item.value);
    const value = this.isMultiple ? values : values[0] || "";
    this.setValue(value);
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    if (!this.isSelectable) {
      this.updateItems();
      return;
    }
    const values = (this.isSingle ? [this.value] : (
      // 多选时，传入的值可能是字符串（通过 attribute 属性设置）；或字符串数组（通过 property 属性设置）
      isString(this.value) ? [this.value] : this.value
    )).filter((i) => i);
    if (!values.length) {
      this.setSelectedKeys([]);
    } else if (this.isSingle) {
      const firstItem = this.itemsEnabled.find((item) => item.value === values[0]);
      this.setSelectedKeys(firstItem ? [firstItem.key] : []);
    } else if (this.isMultiple) {
      this.setSelectedKeys(this.itemsEnabled.filter((item) => values.includes(item.value)).map((item) => item.key));
    }
    this.updateItems();
    if (!this.isInitial) {
      const form = this.formController.getForm();
      if (form && formResets.get(form)?.has(this)) {
        this.invalid = false;
        formResets.get(form).delete(this);
      } else {
        this.invalid = !this.inputRef.value.checkValidity();
      }
    }
  }
  async onInvalidChange() {
    await this.definedController.whenDefined();
    this.updateItems();
  }
  connectedCallback() {
    super.connectedCallback();
    this.value = this.isMultiple && isString(this.value) ? this.value ? [this.value] : [] : this.value;
    this.defaultValue = this.selects === "multiple" ? [] : "";
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      const eventProceeded = this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      if (!eventProceeded) {
        this.inputRef.value.blur();
        this.inputRef.value.focus();
      }
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
  }
  render() {
    return html`${when(this.isSelectable && this.isSingle, () => html`<input ${ref(this.inputRef)} type="radio" name="${ifDefined(this.name)}" value="1" .disabled="${this.disabled}" .required="${this.required}" .checked="${!!this.value}" tabindex="-1" @keydown="${this.onInputKeyDown}">`)}${when(this.isSelectable && this.isMultiple, () => html`<select ${ref(this.inputRef)} name="${ifDefined(this.name)}" .disabled="${this.disabled}" .required="${this.required}" multiple="multiple" tabindex="-1" @keydown="${this.onInputKeyDown}">${map2(this.value, (value) => html`<option selected="selected" value="${value}"></option>`)}</select>`)}<slot @slotchange="${this.onSlotChange}" @click="${this.onClick}"></slot>`;
  }
  // 切换一个元素的选中状态
  selectOne(item) {
    if (this.isMultiple) {
      const selectedKeys = [...this.selectedKeys];
      if (selectedKeys.includes(item.key)) {
        selectedKeys.splice(selectedKeys.indexOf(item.key), 1);
      } else {
        selectedKeys.push(item.key);
      }
      this.setSelectedKeys(selectedKeys);
    }
    if (this.isSingle) {
      if (this.selectedKeys.includes(item.key)) {
        this.setSelectedKeys([]);
      } else {
        this.setSelectedKeys([item.key]);
      }
    }
    this.isInitial = false;
    this.updateItems();
  }
  async onClick(event) {
    if (event.button) {
      return;
    }
    await this.definedController.whenDefined();
    const target = event.target;
    const item = target.closest("mdui-segmented-button");
    if (!item || item.disabled) {
      return;
    }
    if (this.isSelectable && item.value) {
      this.selectOne(item);
    }
  }
  /**
   * 在隐藏的 `<input>` 或 `<select>` 上按下按键时，切换选中状态
   * 通常为验证不通过时，默认聚焦到 `<input>` 或 `<select>` 上，此时按下按键，切换第一个元素的选中状态
   */
  async onInputKeyDown(event) {
    if (!["Enter", " "].includes(event.key)) {
      return;
    }
    event.preventDefault();
    await this.definedController.whenDefined();
    if (this.isSingle) {
      const input = event.target;
      input.checked = !input.checked;
      this.selectOne(this.itemsEnabled[0]);
      this.itemsEnabled[0].focus();
    }
    if (this.isMultiple) {
      this.selectOne(this.itemsEnabled[0]);
      this.itemsEnabled[0].focus();
    }
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateItems(true);
  }
  setSelectedKeys(selectedKeys) {
    if (!arraysEqualIgnoreOrder(this.selectedKeys, selectedKeys)) {
      this.selectedKeys = selectedKeys;
    }
  }
  setValue(value) {
    if (this.isSingle) {
      this.value = value;
    } else if (!arraysEqualIgnoreOrder(this.value, value)) {
      this.value = value;
    }
  }
  updateItems(slotChange = false) {
    const items = this.items;
    items.forEach((item, index) => {
      item.invalid = this.invalid;
      item.groupDisabled = this.disabled;
      item.selected = this.selectedKeys.includes(item.key);
      if (slotChange) {
        item.classList.toggle("mdui-segmented-button-first", index === 0);
        item.classList.toggle("mdui-segmented-button-last", index === items.length - 1);
      }
    });
  }
};
SegmentedButtonGroup.styles = [
  componentStyle,
  segmentedButtonGroupStyle
];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "full-width"
  })
], SegmentedButtonGroup.prototype, "fullWidth", void 0);
__decorate([
  property({ reflect: true })
  // eslint-disable-next-line prettier/prettier
], SegmentedButtonGroup.prototype, "selects", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SegmentedButtonGroup.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], SegmentedButtonGroup.prototype, "required", void 0);
__decorate([
  property({ reflect: true })
], SegmentedButtonGroup.prototype, "form", void 0);
__decorate([
  property({ reflect: true })
], SegmentedButtonGroup.prototype, "name", void 0);
__decorate([
  property()
], SegmentedButtonGroup.prototype, "value", void 0);
__decorate([
  defaultValue()
], SegmentedButtonGroup.prototype, "defaultValue", void 0);
__decorate([
  state()
], SegmentedButtonGroup.prototype, "selectedKeys", void 0);
__decorate([
  state()
], SegmentedButtonGroup.prototype, "invalid", void 0);
__decorate([
  watch("selects", true)
], SegmentedButtonGroup.prototype, "onSelectsChange", null);
__decorate([
  watch("selectedKeys", true)
], SegmentedButtonGroup.prototype, "onSelectedKeysChange", null);
__decorate([
  watch("value")
], SegmentedButtonGroup.prototype, "onValueChange", null);
__decorate([
  watch("invalid", true),
  watch("disabled")
], SegmentedButtonGroup.prototype, "onInvalidChange", null);
SegmentedButtonGroup = __decorate([
  customElement("mdui-segmented-button-group")
], SegmentedButtonGroup);

// node_modules/@mdui/shared/icons/cancel--outlined.js
var IconCancel_Outlined = class IconCancel_Outlined2 extends LitElement {
  render() {
    return svgTag('<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>');
  }
};
IconCancel_Outlined.styles = style10;
IconCancel_Outlined = __decorate([
  customElement("mdui-icon-cancel--outlined")
], IconCancel_Outlined);

// node_modules/@mdui/shared/icons/error.js
var IconError = class IconError2 extends LitElement {
  render() {
    return svgTag('<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>');
  }
};
IconError.styles = style10;
IconError = __decorate([
  customElement("mdui-icon-error")
], IconError);

// node_modules/@mdui/shared/icons/visibility-off.js
var IconVisibilityOff = class IconVisibilityOff2 extends LitElement {
  render() {
    return svgTag('<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>');
  }
};
IconVisibilityOff.styles = style10;
IconVisibilityOff = __decorate([
  customElement("mdui-icon-visibility-off")
], IconVisibilityOff);

// node_modules/@mdui/shared/icons/visibility.js
var IconVisibility = class IconVisibility2 extends LitElement {
  render() {
    return svgTag('<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>');
  }
};
IconVisibility.styles = style10;
IconVisibility = __decorate([
  customElement("mdui-icon-visibility")
], IconVisibility);

// node_modules/mdui/components/text-field/style.js
var style19 = css`:host{display:inline-block;width:100%}:host([disabled]:not([disabled=false i])){pointer-events:none}:host([type=hidden]){display:none}.container{position:relative;display:flex;align-items:center;height:100%;padding:.125rem .125rem .125rem 1rem;transition:box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard)}.container.has-icon{padding-left:.75rem}.container.has-action,.container.has-right-icon,.container.has-suffix{padding-right:.75rem}:host([variant=filled]) .container{box-shadow:inset 0 -.0625rem 0 0 rgb(var(--mdui-color-on-surface-variant));background-color:rgb(var(--mdui-color-surface-container-highest));border-radius:var(--mdui-shape-corner-extra-small) var(--mdui-shape-corner-extra-small) 0 0}:host([variant=outlined]) .container{box-shadow:inset 0 0 0 .0625rem rgb(var(--mdui-color-outline));border-radius:var(--mdui-shape-corner-extra-small)}:host([variant=filled]) .container.invalid,:host([variant=filled]) .container.invalid-style{box-shadow:inset 0 -.0625rem 0 0 rgb(var(--mdui-color-error))}:host([variant=outlined]) .container.invalid,:host([variant=outlined]) .container.invalid-style{box-shadow:inset 0 0 0 .0625rem rgb(var(--mdui-color-error))}:host([variant=filled]:hover) .container{box-shadow:inset 0 -.0625rem 0 0 rgb(var(--mdui-color-on-surface))}:host([variant=outlined]:hover) .container{box-shadow:inset 0 0 0 .0625rem rgb(var(--mdui-color-on-surface))}:host([variant=filled]:hover) .container.invalid,:host([variant=filled]:hover) .container.invalid-style{box-shadow:inset 0 -.0625rem 0 0 rgb(var(--mdui-color-on-error-container))}:host([variant=outlined]:hover) .container.invalid,:host([variant=outlined]:hover) .container.invalid-style{box-shadow:inset 0 0 0 .0625rem rgb(var(--mdui-color-on-error-container))}:host([variant=filled][focused-style]) .container,:host([variant=filled][focused]) .container{box-shadow:inset 0 -.125rem 0 0 rgb(var(--mdui-color-primary))}:host([variant=outlined][focused-style]) .container,:host([variant=outlined][focused]) .container{box-shadow:inset 0 0 0 .125rem rgb(var(--mdui-color-primary))}:host([variant=filled][focused-style]) .container.invalid,:host([variant=filled][focused-style]) .container.invalid-style,:host([variant=filled][focused]) .container.invalid,:host([variant=filled][focused]) .container.invalid-style{box-shadow:inset 0 -.125rem 0 0 rgb(var(--mdui-color-error))}:host([variant=outlined][focused-style]) .container.invalid,:host([variant=outlined][focused-style]) .container.invalid-style,:host([variant=outlined][focused]) .container.invalid,:host([variant=outlined][focused]) .container.invalid-style{box-shadow:inset 0 0 0 .125rem rgb(var(--mdui-color-error))}:host([variant=filled][disabled]:not([disabled=false i])) .container{box-shadow:inset 0 -.0625rem 0 0 rgba(var(--mdui-color-on-surface),38%);background-color:rgba(var(--mdui-color-on-surface),4%)}:host([variant=outlined][disabled]:not([disabled=false i])) .container{box-shadow:inset 0 0 0 .125rem rgba(var(--mdui-color-on-surface),12%)}.action,.icon,.prefix,.right-icon,.suffix{display:flex;-webkit-user-select:none;user-select:none;color:rgb(var(--mdui-color-on-surface-variant))}:host([disabled]:not([disabled=false i])) .action,:host([disabled]:not([disabled=false i])) .icon,:host([disabled]:not([disabled=false i])) .prefix,:host([disabled]:not([disabled=false i])) .right-icon,:host([disabled]:not([disabled=false i])) .suffix{color:rgba(var(--mdui-color-on-surface),38%)}.invalid .right-icon,.invalid-style .right-icon{color:rgb(var(--mdui-color-error))}:host(:hover) .invalid .right-icon,:host(:hover) .invalid-style .right-icon{color:rgb(var(--mdui-color-on-error-container))}:host([focused-style]) .invalid .right-icon,:host([focused-style]) .invalid-style .right-icon,:host([focused]) .invalid .right-icon,:host([focused]) .invalid-style .right-icon{color:rgb(var(--mdui-color-error))}.action,.icon,.right-icon{font-size:1.5rem}.action mdui-button-icon,.icon mdui-button-icon,.right-icon mdui-button-icon,::slotted(mdui-button-icon[slot]){margin-left:-.5rem;margin-right:-.5rem}.action .i,.icon .i,.right-icon .i,::slotted([slot$=icon]){font-size:inherit}.has-icon .icon{margin-right:1rem}.has-prefix .prefix{padding-right:.125rem}.has-action .action{margin-left:.75rem}.has-suffix .suffix{padding-right:.25rem;padding-left:.125rem}.has-right-icon .right-icon{margin-left:.75rem}.prefix,.suffix{display:none;font-size:var(--mdui-typescale-body-large-size);font-weight:var(--mdui-typescale-body-large-weight);letter-spacing:var(--mdui-typescale-body-large-tracking);line-height:var(--mdui-typescale-body-large-line-height)}:host([variant=filled][label]) .prefix,:host([variant=filled][label]) .suffix{padding-top:1rem}.has-value .prefix,.has-value .suffix,:host([focused-style]) .prefix,:host([focused-style]) .suffix,:host([focused]) .prefix,:host([focused]) .suffix{display:flex}.input-container{display:flex;width:100%;height:100%}.label{position:absolute;pointer-events:none;max-width:calc(100% - 1rem);display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:1;transition:all var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard);top:1rem;color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-body-large-size);font-weight:var(--mdui-typescale-body-large-weight);letter-spacing:var(--mdui-typescale-body-large-tracking);line-height:var(--mdui-typescale-body-large-line-height)}.invalid .label,.invalid-style .label{color:rgb(var(--mdui-color-error))}:host([variant=outlined]) .label{padding:0 .25rem;margin:0 -.25rem}:host([variant=outlined]:hover) .label{color:rgb(var(--mdui-color-on-surface))}:host([variant=filled]:hover) .invalid .label,:host([variant=filled]:hover) .invalid-style .label,:host([variant=outlined]:hover) .invalid .label,:host([variant=outlined]:hover) .invalid-style .label{color:rgb(var(--mdui-color-on-error-container))}:host([variant=filled][focused-style]) .label,:host([variant=filled][focused]) .label,:host([variant=outlined][focused-style]) .label,:host([variant=outlined][focused]) .label{color:rgb(var(--mdui-color-primary))}:host([variant=filled]) .has-value .label,:host([variant=filled][focused-style]) .label,:host([variant=filled][focused]) .label,:host([variant=filled][type=date]) .label,:host([variant=filled][type=datetime-local]) .label,:host([variant=filled][type=month]) .label,:host([variant=filled][type=time]) .label,:host([variant=filled][type=week]) .label{font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height);top:.25rem}:host([variant=outlined]) .has-value .label,:host([variant=outlined][focused-style]) .label,:host([variant=outlined][focused]) .label,:host([variant=outlined][type=date]) .label,:host([variant=outlined][type=datetime-local]) .label,:host([variant=outlined][type=month]) .label,:host([variant=outlined][type=time]) .label,:host([variant=outlined][type=week]) .label{font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height);top:-.5rem;left:.75rem;background-color:rgb(var(--mdui-color-background))}:host([variant=filled][focused-style]) .invalid .label,:host([variant=filled][focused-style]) .invalid-style .label,:host([variant=filled][focused]) .invalid .label,:host([variant=filled][focused]) .invalid-style .label,:host([variant=outlined][focused-style]) .invalid .label,:host([variant=outlined][focused-style]) .invalid-style .label,:host([variant=outlined][focused]) .invalid .label,:host([variant=outlined][focused]) .invalid-style .label{color:rgb(var(--mdui-color-error))}:host([variant=filled][disabled]:not([disabled=false i])) .label,:host([variant=outlined][disabled]:not([disabled=false i])) .label{color:rgba(var(--mdui-color-on-surface),38%)}.input{display:block;width:100%;border:none;outline:0;background:0 0;appearance:none;resize:none;cursor:inherit;font-family:inherit;padding:.875rem .875rem .875rem 0;font-size:var(--mdui-typescale-body-large-size);font-weight:var(--mdui-typescale-body-large-weight);letter-spacing:var(--mdui-typescale-body-large-tracking);line-height:var(--mdui-typescale-body-large-line-height);color:rgb(var(--mdui-color-on-surface));caret-color:rgb(var(--mdui-color-primary))}.has-action .input,.has-right-icon .input{padding-right:.25rem}.has-suffix .input{padding-right:0}.input.hide-input{opacity:0;height:0;min-height:0;width:0;padding:0!important;overflow:hidden}.input::placeholder{color:rgb(var(--mdui-color-on-surface-variant))}.invalid .input,.invalid-style .input{caret-color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])) .input{color:rgba(var(--mdui-color-on-surface),38%)}:host([end-aligned]:not([end-aligned=false i])) .input{text-align:right}textarea.input{padding-top:0;margin-top:.875rem}:host([variant=filled]) .label+.input{padding-top:1.375rem;padding-bottom:.375rem}:host([variant=filled]) .label+textarea.input{padding-top:0;margin-top:1.375rem}.supporting{display:flex;justify-content:space-between;padding:.25rem 1rem;color:rgb(var(--mdui-color-on-surface-variant))}.supporting.invalid,.supporting.invalid-style{color:rgb(var(--mdui-color-error))}.helper{display:block;opacity:1;transition:opacity var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height)}:host([disabled]:not([disabled=false i])) .helper{color:rgba(var(--mdui-color-on-surface),38%)}:host([helper-on-focus]:not([helper-on-focus=false i])) .helper{opacity:0}:host([helper-on-focus][focused-style]:not([helper-on-focus=false i])) .helper,:host([helper-on-focus][focused]:not([helper-on-focus=false i])) .helper{opacity:1}.error{font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height)}.counter{flex-wrap:nowrap;padding-left:1rem;font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height)}::-ms-reveal{display:none}.input[type=number]::-webkit-inner-spin-button,.input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;display:none}.input[type=number]{-moz-appearance:textfield}.input[type=search]::-webkit-search-cancel-button{-webkit-appearance:none}`;

// node_modules/mdui/components/text-field/index.js
var TextField = class TextField2 extends FocusableMixin(MduiElement) {
  constructor() {
    super(...arguments);
    this.variant = "filled";
    this.type = "text";
    this.name = "";
    this.value = "";
    this.defaultValue = "";
    this.helperOnFocus = false;
    this.clearable = false;
    this.endAligned = false;
    this.readonly = false;
    this.disabled = false;
    this.required = false;
    this.autosize = false;
    this.counter = false;
    this.togglePassword = false;
    this.spellcheck = false;
    this.invalid = false;
    this.invalidStyle = false;
    this.focusedStyle = false;
    this.isPasswordVisible = false;
    this.hasValue = false;
    this.error = "";
    this.inputRef = createRef();
    this.formController = new FormController(this);
    this.hasSlotController = new HasSlotController(this, "icon", "end-icon", "helper", "input");
    this.readonlyButClearable = false;
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  /**
   * 获取当前值，并转换为 `number` 类型；或设置一个 `number` 类型的值。
   * 如果值无法被转换为 `number` 类型，则会返回 `NaN`。
   */
  get valueAsNumber() {
    return this.inputRef.value?.valueAsNumber ?? parseFloat(this.value);
  }
  set valueAsNumber(newValue) {
    const input = document.createElement("input");
    input.type = "number";
    input.valueAsNumber = newValue;
    this.value = input.value;
  }
  get focusElement() {
    return this.inputRef.value;
  }
  get focusDisabled() {
    return this.disabled;
  }
  /**
   * 是否显示聚焦状态样式
   */
  get isFocusedStyle() {
    return this.focused || this.focusedStyle;
  }
  /**
   * 是否渲染为 textarea。为 false 时渲染为 input
   */
  get isTextarea() {
    return this.rows && this.rows > 1 || this.autosize;
  }
  onDisabledChange() {
    this.inputRef.value.disabled = this.disabled;
    this.invalid = !this.inputRef.value.checkValidity();
  }
  async onValueChange() {
    this.hasValue = !["", null].includes(this.value);
    if (this.hasUpdated) {
      await this.updateComplete;
      this.setTextareaHeight();
      const form = this.formController.getForm();
      if (form && formResets.get(form)?.has(this)) {
        this.invalid = false;
        formResets.get(form).delete(this);
      } else {
        this.invalid = !this.inputRef.value.checkValidity();
      }
    }
  }
  onRowsChange() {
    this.setTextareaHeight();
  }
  async onMaxRowsChange() {
    if (!this.autosize) {
      return;
    }
    if (!this.hasUpdated) {
      await this.updateComplete;
    }
    const $input = $(this.inputRef.value);
    $input.css("max-height", parseFloat($input.css("line-height")) * (this.maxRows ?? 1) + parseFloat($input.css("padding-top")) + parseFloat($input.css("padding-bottom")));
  }
  async onMinRowsChange() {
    if (!this.autosize) {
      return;
    }
    if (!this.hasUpdated) {
      await this.updateComplete;
    }
    const $input = $(this.inputRef.value);
    $input.css("min-height", parseFloat($input.css("line-height")) * (this.minRows ?? 1) + parseFloat($input.css("padding-top")) + parseFloat($input.css("padding-bottom")));
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.setTextareaHeight();
      this.observeResize = observeResize(this.inputRef.value, () => this.setTextareaHeight());
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observeResize?.unobserve();
    offLocaleReady(this);
  }
  /**
   * 选中文本框中的文本
   */
  select() {
    this.inputRef.value.select();
  }
  /**
   * 选中文本框中特定范围的内容
   *
   * @param start 被选中的第一个字符的位置索引，从 `0` 开始。如果这个值比元素的 `value` 长度还大，则会被看作 `value` 最后一个位置的索引
   * @param end 被选中的最后一个字符的*下一个*位置索引。如果这个值比元素的 `value` 长度还大，则会被看作 `value` 最后一个位置的索引
   * @param direction 一个表示选择方向的字符串，可能的值有：`forward`、`backward`、`none`
   */
  setSelectionRange(start, end, direction = "none") {
    this.inputRef.value.setSelectionRange(start, end, direction);
  }
  /**
   * 将文本框中特定范围的文本替换为新的文本
   * @param replacement 要插入的字符串
   * @param start 要替换的字符的起止位置的索引。默认为当前用户选中的字符的起始位置的索引
   * @param end 要替换的字符的结束位置的索引。默认为当前用户选中的字符的结束位置的索引
   * @param selectMode 文本被替换后，选取的状态。可选值为：
   * * `select`：选择新插入的文本
   * * `start`：将光标移动到新插入的文本的起始位置
   * * `end`：将光标移动到新插入的文本的结束位置
   * * `preserve`：默认值。尝试保留选取
   */
  setRangeText(replacement, start, end, selectMode = "preserve") {
    this.inputRef.value.setRangeText(replacement, start, end, selectMode);
    if (this.value !== this.inputRef.value.value) {
      this.value = this.inputRef.value.value;
      this.setTextareaHeight();
      this.emit("input");
      this.emit("change");
    }
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      this.focus();
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.setCustomValidityInternal(message);
    offLocaleReady(this);
  }
  render() {
    const hasIcon = !!this.icon || this.hasSlotController.test("icon");
    const hasEndIcon = !!this.endIcon || this.hasSlotController.test("end-icon");
    const hasErrorIcon = this.invalid || this.invalidStyle;
    const hasTogglePasswordButton = this.type === "password" && this.togglePassword && !this.disabled;
    const hasClearButton = this.clearable && !this.disabled && (!this.readonly || this.readonlyButClearable) && (typeof this.value === "number" || this.value.length > 0);
    const hasPrefix = !!this.prefix || this.hasSlotController.test("prefix");
    const hasSuffix = !!this.suffix || this.hasSlotController.test("suffix");
    const hasHelper = !!this.helper || this.hasSlotController.test("helper");
    const hasError = hasErrorIcon && !!(this.error || this.inputRef.value.validationMessage);
    const hasCounter = this.counter && !!this.maxlength;
    const hasInputSlot = this.hasSlotController.test("input");
    const invalidClassNameObj = {
      invalid: this.invalid,
      "invalid-style": this.invalidStyle
    };
    const className2 = classMap({
      container: true,
      "has-value": this.hasValue,
      "has-icon": hasIcon,
      "has-right-icon": hasEndIcon || hasErrorIcon,
      "has-action": hasClearButton || hasTogglePasswordButton,
      "has-prefix": hasPrefix,
      "has-suffix": hasSuffix,
      "is-firefox": navigator.userAgent.includes("Firefox"),
      ...invalidClassNameObj
    });
    return html`<div part="container" class="${className2}">${this.renderPrefix()}<div class="input-container">${this.renderLabel()} ${this.isTextarea ? this.renderTextArea(hasInputSlot) : this.renderInput(hasInputSlot)} ${when(hasInputSlot, () => html`<slot name="input" class="input"></slot>`)}</div>${this.renderSuffix()}${this.renderClearButton(hasClearButton)} ${this.renderTogglePasswordButton(hasTogglePasswordButton)} ${this.renderRightIcon(hasErrorIcon)}</div>${when(hasError || hasHelper || hasCounter, () => html`<div part="supporting" class="${classMap({ supporting: true, ...invalidClassNameObj })}">${this.renderHelper(hasError, hasHelper)} ${this.renderCounter(hasCounter)}</div>`)}`;
  }
  setCustomValidityInternal(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
    this.requestUpdate();
  }
  onChange() {
    this.value = this.inputRef.value.value;
    if (this.isTextarea) {
      this.setTextareaHeight();
    }
    this.emit("change");
  }
  onClear(event) {
    this.value = "";
    this.emit("clear");
    this.emit("input");
    this.emit("change");
    this.focus();
    event.stopPropagation();
  }
  onInput(event) {
    event.stopPropagation();
    this.value = this.inputRef.value.value;
    if (this.isTextarea) {
      this.setTextareaHeight();
    }
    this.emit("input");
  }
  onInvalid(event) {
    event.preventDefault();
  }
  onKeyDown(event) {
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.key === "Enter" && !hasModifier) {
      setTimeout(() => {
        if (!event.defaultPrevented) {
          this.formController.submit();
        }
      });
    }
  }
  /**
   * textarea 不支持 pattern 属性，所以在 keyup 时执行验证
   */
  onTextAreaKeyUp() {
    if (this.pattern) {
      const patternRegex = new RegExp(this.pattern);
      const hasError = this.value && !this.value.match(patternRegex);
      if (hasError) {
        this.setCustomValidityInternal(this.getPatternErrorMsg());
        onLocaleReady(this, () => {
          this.setCustomValidityInternal(this.getPatternErrorMsg());
        });
      } else {
        this.setCustomValidityInternal("");
        offLocaleReady(this);
      }
    }
  }
  onTogglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  getPatternErrorMsg() {
    return msg("Please match the requested format.", {
      id: "components.textField.patternError"
    });
  }
  setTextareaHeight() {
    if (this.autosize) {
      this.inputRef.value.style.height = "auto";
      this.inputRef.value.style.height = `${this.inputRef.value.scrollHeight}px`;
    } else {
      this.inputRef.value.style.height = void 0;
    }
  }
  renderLabel() {
    return this.label ? html`<label part="label" class="label">${this.label}</label>` : nothingTemplate;
  }
  renderPrefix() {
    return html`<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}" class="i"></mdui-icon>` : nothingTemplate}</slot><slot name="prefix" part="prefix" class="prefix">${this.prefix}</slot>`;
  }
  renderSuffix() {
    return html`<slot name="suffix" part="suffix" class="suffix">${this.suffix}</slot>`;
  }
  renderRightIcon(hasErrorIcon) {
    return hasErrorIcon ? html`<slot name="error-icon" part="error-icon" class="right-icon">${this.errorIcon ? html`<mdui-icon name="${this.errorIcon}" class="i"></mdui-icon>` : html`<mdui-icon-error class="i"></mdui-icon-error>`}</slot>` : html`<slot name="end-icon" part="end-icon" class="end-icon right-icon">${this.endIcon ? html`<mdui-icon name="${this.endIcon}" class="i"></mdui-icon>` : nothingTemplate}</slot>`;
  }
  renderClearButton(hasClearButton) {
    return when(hasClearButton, () => html`<slot name="clear-button" part="clear-button" class="action" @click="${this.onClear}"><mdui-button-icon tabindex="-1"><slot name="clear-icon" part="clear-icon">${this.clearIcon ? html`<mdui-icon name="${this.clearIcon}" class="i"></mdui-icon>` : html`<mdui-icon-cancel--outlined class="i"></mdui-icon-cancel--outlined>`}</slot></mdui-button-icon></slot>`);
  }
  renderTogglePasswordButton(hasTogglePasswordButton) {
    return when(hasTogglePasswordButton, () => html`<slot name="toggle-password-button" part="toggle-password-button" class="action" @click="${this.onTogglePassword}"><mdui-button-icon tabindex="-1">${this.isPasswordVisible ? html`<slot name="show-password-icon" part="show-password-icon">${this.showPasswordIcon ? html`<mdui-icon name="${this.showPasswordIcon}" class="i"></mdui-icon>` : html`<mdui-icon-visibility-off class="i"></mdui-icon-visibility-off>`}</slot>` : html`<slot name="hide-password-icon" part="hide-password-icon">${this.hidePasswordIcon ? html`<mdui-icon name="${this.hidePasswordIcon}" class="i"></mdui-icon>` : html`<mdui-icon-visibility class="i"></mdui-icon-visibility>`}</slot>`}</mdui-button-icon></slot>`);
  }
  renderInput(hasInputSlot) {
    return html`<input ${ref(this.inputRef)} part="input" class="input ${classMap({ "hide-input": hasInputSlot })}" type="${this.type === "password" && this.isPasswordVisible ? "text" : this.type}" name="${ifDefined(this.name)}" .value="${live(this.value)}" placeholder="${ifDefined(!this.label || this.isFocusedStyle || this.hasValue ? this.placeholder : void 0)}" ?readonly="${this.readonly}" ?disabled="${this.disabled}" ?required="${this.required}" minlength="${ifDefined(this.minlength)}" maxlength="${ifDefined(this.maxlength)}" min="${ifDefined(this.min)}" max="${ifDefined(this.max)}" step="${ifDefined(this.step)}" autocapitalize="${ifDefined(this.type === "password" ? "off" : this.autocapitalize)}" autocomplete="${this.autocomplete}" autocorrect="${ifDefined(this.type === "password" ? "off" : this.autocorrect)}" spellcheck="${ifDefined(this.spellcheck)}" pattern="${ifDefined(this.pattern)}" enterkeyhint="${ifDefined(this.enterkeyhint)}" inputmode="${ifDefined(this.inputmode)}" @change="${this.onChange}" @input="${this.onInput}" @invalid="${this.onInvalid}" @keydown="${this.onKeyDown}">`;
  }
  renderTextArea(hasInputSlot) {
    return html`<textarea ${ref(this.inputRef)} part="input" class="input ${classMap({ "hide-input": hasInputSlot })}" name="${ifDefined(this.name)}" .value="${live(this.value)}" placeholder="${ifDefined(!this.label || this.isFocusedStyle || this.hasValue ? this.placeholder : void 0)}" ?readonly="${this.readonly}" ?disabled="${this.disabled}" ?required="${this.required}" minlength="${ifDefined(this.minlength)}" maxlength="${ifDefined(this.maxlength)}" rows="${this.rows ?? 1}" autocapitalize="${ifDefined(this.autocapitalize)}" autocorrect="${ifDefined(this.autocorrect)}" spellcheck="${ifDefined(this.spellcheck)}" enterkeyhint="${ifDefined(this.enterkeyhint)}" inputmode="${ifDefined(this.inputmode)}" @change="${this.onChange}" @input="${this.onInput}" @invalid="${this.onInvalid}" @keydown="${this.onKeyDown}" @keyup="${this.onTextAreaKeyUp}"></textarea>`;
  }
  /**
   * @param hasError 是否包含错误提示
   * @param hasHelper 是否含 helper 属性或 helper slot
   */
  renderHelper(hasError, hasHelper) {
    return hasError ? html`<div part="error" class="error">${this.error || this.inputRef.value.validationMessage}</div>` : hasHelper ? html`<slot name="helper" part="helper" class="helper">${this.helper}</slot>` : (
      // 右边有 counter，需要占位
      html`<span></span>`
    );
  }
  renderCounter(hasCounter) {
    return hasCounter ? html`<div part="counter" class="counter">${this.value.length}/${this.maxlength}</div>` : nothingTemplate;
  }
};
TextField.styles = [componentStyle, style19];
__decorate([
  property({ reflect: true })
], TextField.prototype, "variant", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "type", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "name", void 0);
__decorate([
  property()
], TextField.prototype, "value", void 0);
__decorate([
  defaultValue()
], TextField.prototype, "defaultValue", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "label", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "placeholder", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "helper", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "helper-on-focus"
  })
], TextField.prototype, "helperOnFocus", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "clearable", void 0);
__decorate([
  property({ reflect: true, attribute: "clear-icon" })
], TextField.prototype, "clearIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "end-aligned"
  })
], TextField.prototype, "endAligned", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "prefix", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "suffix", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], TextField.prototype, "endIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "error-icon" })
], TextField.prototype, "errorIcon", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "form", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "readonly", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "required", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "rows", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "autosize", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "min-rows" })
], TextField.prototype, "minRows", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "max-rows" })
], TextField.prototype, "maxRows", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "minlength", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "maxlength", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TextField.prototype, "counter", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "min", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "max", void 0);
__decorate([
  property({ type: Number, reflect: true })
], TextField.prototype, "step", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "pattern", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "toggle-password"
  })
], TextField.prototype, "togglePassword", void 0);
__decorate([
  property({ reflect: true, attribute: "show-password-icon" })
], TextField.prototype, "showPasswordIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "hide-password-icon" })
], TextField.prototype, "hidePasswordIcon", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "autocapitalize", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "autocorrect", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "autocomplete", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "enterkeyhint", void 0);
__decorate([
  property({ type: Boolean, reflect: true, converter: booleanConverter })
], TextField.prototype, "spellcheck", void 0);
__decorate([
  property({ reflect: true })
], TextField.prototype, "inputmode", void 0);
__decorate([
  state()
], TextField.prototype, "invalid", void 0);
__decorate([
  state()
], TextField.prototype, "invalidStyle", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "focused-style"
  })
], TextField.prototype, "focusedStyle", void 0);
__decorate([
  state()
], TextField.prototype, "isPasswordVisible", void 0);
__decorate([
  state()
], TextField.prototype, "hasValue", void 0);
__decorate([
  state()
], TextField.prototype, "error", void 0);
__decorate([
  watch("disabled", true)
], TextField.prototype, "onDisabledChange", null);
__decorate([
  watch("value")
], TextField.prototype, "onValueChange", null);
__decorate([
  watch("rows", true)
], TextField.prototype, "onRowsChange", null);
__decorate([
  watch("maxRows")
], TextField.prototype, "onMaxRowsChange", null);
__decorate([
  watch("minRows")
], TextField.prototype, "onMinRowsChange", null);
TextField = __decorate([
  customElement("mdui-text-field")
], TextField);

// node_modules/mdui/components/select/style.js
var style20 = css`:host{display:inline-block;width:100%}.hidden-input{display:none}.text-field{cursor:pointer}.chips{display:flex;flex-wrap:wrap;margin:-.5rem -.25rem;min-height:2.5rem}:host([variant=filled][label]) .chips{margin:0 -.25rem -1rem -.25rem}.chip{margin:.25rem}mdui-menu{max-width:none}`;

// node_modules/mdui/components/select/index.js
var Select = class Select2 extends FocusableMixin(MduiElement) {
  constructor() {
    super(...arguments);
    this.variant = "filled";
    this.multiple = false;
    this.name = "";
    this.value = "";
    this.defaultValue = "";
    this.clearable = false;
    this.placement = "auto";
    this.endAligned = false;
    this.readonly = false;
    this.disabled = false;
    this.required = false;
    this.invalid = false;
    this.menuRef = createRef();
    this.textFieldRef = createRef();
    this.hiddenInputRef = createRef();
    this.formController = new FormController(this);
    this.hasSlotController = new HasSlotController(this, "icon", "end-icon", "error-icon", "prefix", "suffix", "clear-button", "clear-icon", "helper");
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-menu-item"]
    });
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.hiddenInputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.hiddenInputRef.value.validationMessage;
  }
  get focusElement() {
    return this.textFieldRef.value;
  }
  get focusDisabled() {
    return this.disabled;
  }
  connectedCallback() {
    super.connectedCallback();
    this.value = this.multiple && isString(this.value) ? this.value ? [this.value] : [] : this.value;
    this.defaultValue = this.multiple ? [] : "";
    this.definedController.whenDefined().then(() => {
      this.requestUpdate();
    });
    this.updateComplete.then(() => {
      this.observeResize = observeResize(this.textFieldRef.value, () => this.resizeMenu());
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observeResize?.unobserve();
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.hiddenInputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.hiddenInputRef.value.reportValidity();
    if (this.invalid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      this.focus();
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.hiddenInputRef.value.setCustomValidity(message);
    this.invalid = !this.hiddenInputRef.value.checkValidity();
  }
  render() {
    const hasSelection = this.multiple ? !!this.value.length : !!this.value;
    return html`${this.multiple ? html`<select ${ref(this.hiddenInputRef)} class="hidden-input" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .required="${this.required}" .disabled="${this.disabled}" multiple="multiple" tabindex="-1">${map2(this.value, (value) => html`<option selected="selected" value="${value}"></option>`)}</select>` : html`<input ${ref(this.hiddenInputRef)} type="radio" class="hidden-input" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .required="${this.required}" .disabled="${this.disabled}" .checked="${hasSelection}" tabindex="-1">`}<mdui-dropdown .stayOpenOnClick="${this.multiple}" .disabled="${this.readonly || this.disabled}" .placement="${this.placement === "top" ? "top-start" : this.placement === "bottom" ? "bottom-start" : "auto"}" @open="${this.onDropdownOpen}" @close="${this.onDropdownClose}"><mdui-text-field ${ref(this.textFieldRef)} slot="trigger" part="text-field" class="text-field" exportparts="${[
      "container",
      "icon",
      "end-icon",
      "error-icon",
      "prefix",
      "suffix",
      "label",
      "input",
      "clear-button",
      "clear-icon",
      "supporting",
      "helper",
      "error"
    ].map((v) => `${v}:text-field__${v}`).join(",")}" readonly="readonly" .readonlyButClearable="${true}" .variant="${this.variant}" .name="${this.name}" .value="${this.multiple ? this.value.length ? " " : "" : this.getMenuItemLabelByValue(this.value)}" .label="${this.label}" .placeholder="${this.placeholder}" .helper="${this.helper}" .error="${this.hiddenInputRef.value?.validationMessage}" .clearable="${this.clearable}" .clearIcon="${this.clearIcon}" .endAligned="${this.endAligned}" .prefix="${this.prefix}" .suffix="${this.suffix}" .icon="${this.icon}" .endIcon="${this.endIcon}" .errorIcon="${this.errorIcon}" .form="${this.form}" .disabled="${this.disabled}" .required="${this.required}" .invalidStyle="${this.invalid}" @clear="${this.onClear}" @change="${(e) => e.stopPropagation()}" @keydown="${this.onTextFieldKeyDown}">${map2([
      "icon",
      "end-icon",
      "error-icon",
      "prefix",
      "suffix",
      "clear-button",
      "clear-icon",
      "helper"
    ], (slotName) => this.hasSlotController.test(slotName) ? html`<slot name="${slotName}" slot="${slotName}"></slot>` : nothing)} ${when(this.multiple && this.value.length, () => html`<div slot="input" class="chips" part="chips">${map2(this.value, (valueItem) => html`<mdui-chip class="chip" part="chip" exportparts="${["button", "label", "delete-icon"].map((v) => `${v}:chip__${v}`).join(",")}" variant="input" deletable tabindex="-1" @delete="${() => this.onDeleteOneValue(valueItem)}">${this.getMenuItemLabelByValue(valueItem)}</mdui-chip>`)}</div>`)}</mdui-text-field><mdui-menu ${ref(this.menuRef)} part="menu" .selects="${this.multiple ? "multiple" : "single"}" .value="${this.value}" @change="${this.onValueChange}"><slot></slot></mdui-menu></mdui-dropdown>`;
  }
  getMenuItemLabelByValue(valueItem) {
    if (!this.menuItems.length) {
      return valueItem;
    }
    return this.menuItems.find((item) => item.value === valueItem)?.textContent?.trim() || valueItem;
  }
  resizeMenu() {
    this.menuRef.value.style.width = `${this.textFieldRef.value.clientWidth}px`;
  }
  async onDropdownOpen() {
    this.textFieldRef.value.focusedStyle = true;
  }
  onDropdownClose() {
    this.textFieldRef.value.focusedStyle = false;
    if (this.contains(document.activeElement) || this.contains(document.activeElement?.assignedSlot ?? null)) {
      setTimeout(() => {
        this.focus();
      });
    }
  }
  async onValueChange(e) {
    const menu = e.target;
    this.value = this.multiple ? menu.value.map((v) => v ?? "") : menu.value ?? "";
    await this.updateComplete;
    const form = this.formController.getForm();
    if (form && formResets.get(form)?.has(this)) {
      this.invalid = false;
      formResets.get(form).delete(this);
    } else {
      this.invalid = !this.hiddenInputRef.value.checkValidity();
    }
  }
  /**
   * multiple 为 true 时，点 chip 的删除按钮，删除其中一个值
   */
  onDeleteOneValue(valueItem) {
    const value = [...this.value];
    if (value.includes(valueItem)) {
      value.splice(value.indexOf(valueItem), 1);
    }
    this.value = value;
  }
  onClear() {
    this.value = this.multiple ? [] : "";
  }
  /**
   * 焦点在 text-field 上时，按下回车键，打开下拉选项
   */
  onTextFieldKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.textFieldRef.value.click();
    }
  }
};
Select.styles = [componentStyle, style20];
__decorate([
  property({ reflect: true })
], Select.prototype, "variant", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Select.prototype, "multiple", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "name", void 0);
__decorate([
  property()
], Select.prototype, "value", void 0);
__decorate([
  defaultValue()
], Select.prototype, "defaultValue", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "label", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "placeholder", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "helper", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Select.prototype, "clearable", void 0);
__decorate([
  property({ reflect: true, attribute: "clear-icon" })
], Select.prototype, "clearIcon", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "placement", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "end-aligned"
  })
], Select.prototype, "endAligned", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "prefix", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "suffix", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "icon", void 0);
__decorate([
  property({ reflect: true, attribute: "end-icon" })
], Select.prototype, "endIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "error-icon" })
], Select.prototype, "errorIcon", void 0);
__decorate([
  property({ reflect: true })
], Select.prototype, "form", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Select.prototype, "readonly", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Select.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Select.prototype, "required", void 0);
__decorate([
  state()
], Select.prototype, "invalid", void 0);
__decorate([
  queryAssignedElements({ flatten: true, selector: "mdui-menu-item" })
], Select.prototype, "menuItems", void 0);
Select = __decorate([
  customElement("mdui-select")
], Select);

// node_modules/mdui/components/slider/style.js
var style21 = css`.track-active{left:-.125rem;border-radius:var(--mdui-shape-corner-full) 0 0 var(--mdui-shape-corner-full)}`;

// node_modules/mdui/components/slider/index.js
var Slider = class Slider2 extends SliderBase {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.defaultValue = 0;
    this.rippleRef = createRef();
    this.handleRef = createRef();
    this.formController = new FormController(this);
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  async onValueChange() {
    this.value = this.fixValue(this.value);
    const form = this.formController.getForm();
    if (form && formResets.get(form)?.has(this)) {
      this.invalid = false;
      formResets.get(form).delete(this);
    } else {
      await this.updateComplete;
      this.invalid = !this.inputRef.value.checkValidity();
    }
    this.updateStyle();
  }
  connectedCallback() {
    super.connectedCallback();
    this.value = this.fixValue(this.value);
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    const onTouchStart = () => {
      if (!this.disabled) {
        this.labelVisible = true;
      }
    };
    const onTouchEnd = () => {
      if (!this.disabled) {
        this.labelVisible = false;
      }
    };
    this.addEventListener("touchstart", onTouchStart);
    this.addEventListener("mousedown", onTouchStart);
    this.addEventListener("touchend", onTouchEnd);
    this.addEventListener("mouseup", onTouchEnd);
    this.updateStyle();
  }
  /**
   * <input /> 用于提供拖拽操作
   * <input class="invalid" /> 用于提供 html5 自带的表单错误提示
   */
  render() {
    return html`<label class="${classMap({ invalid: this.invalid })}"><input ${ref(this.inputRef)} type="range" step="${this.step}" min="${this.min}" max="${this.max}" ?disabled="${this.disabled}" .value="${live(this.value.toString())}" @input="${this.onInput}" @change="${this.onChange}"><div part="track-inactive" class="track-inactive"></div><div ${ref(this.trackActiveRef)} part="track-active" class="track-active"></div><div ${ref(this.handleRef)} part="handle" class="handle"><div class="elevation"></div><mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple>${this.renderLabel(this.value)}</div>${when(this.tickmarks, () => map2(this.getCandidateValues(), (value) => html`<div part="tickmark" class="tickmark ${classMap({ active: value < this.value })}" style="${styleMap({
      left: `${(value - this.min) / this.max * 100}%`,
      display: value === this.value ? "none" : "block"
    })}"></div>`))}</label>`;
  }
  updateStyle() {
    const percent = (this.value - this.min) / (this.max - this.min) * 100;
    this.trackActiveRef.value.style.width = `${percent}%`;
    this.handleRef.value.style.left = `${percent}%`;
  }
  onInput() {
    this.value = parseFloat(this.inputRef.value.value);
    this.updateStyle();
  }
};
Slider.styles = [SliderBase.styles, style21];
__decorate([
  property({ type: Number })
], Slider.prototype, "value", void 0);
__decorate([
  defaultValue()
], Slider.prototype, "defaultValue", void 0);
__decorate([
  watch("value", true)
], Slider.prototype, "onValueChange", null);
Slider = __decorate([
  customElement("mdui-slider")
], Slider);

// node_modules/mdui/components/snackbar/style.js
var style22 = css`:host{--shape-corner:var(--mdui-shape-corner-extra-small);--z-index:2400;position:fixed;z-index:var(--z-index);display:none;align-items:center;flex-wrap:wrap;border-radius:var(--shape-corner);transform:scaleY(0);transition:transform 0s var(--mdui-motion-easing-linear) var(--mdui-motion-duration-short4);min-width:20rem;max-width:36rem;padding:.25rem 0;box-shadow:var(--mdui-elevation-level3);background-color:rgb(var(--mdui-color-inverse-surface));color:rgb(var(--mdui-color-inverse-on-surface));font-size:var(--mdui-typescale-body-medium-size);font-weight:var(--mdui-typescale-body-medium-weight);letter-spacing:var(--mdui-typescale-body-medium-tracking);line-height:var(--mdui-typescale-body-medium-line-height)}:host([placement^=top]){transform-origin:top}:host([placement^=bottom]){transform-origin:bottom}:host([placement=bottom-start]:not([mobile])),:host([placement=top-start]:not([mobile])){left:1rem}:host([placement=bottom-end]:not([mobile])),:host([placement=top-end]:not([mobile])){right:1rem}:host([placement=bottom]:not([mobile])),:host([placement=top]:not([mobile])){left:50%;transform:scaleY(0) translateX(-50%)}:host([mobile]){min-width:0;left:1rem;right:1rem}:host([open]){transform:scaleY(1);transition:top var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard),bottom var(--mdui-motion-duration-short4) var(--mdui-motion-easing-standard),transform var(--mdui-motion-duration-medium4) var(--mdui-motion-easing-emphasized-decelerate)}:host([placement=bottom][open]:not([mobile])),:host([placement=top][open]:not([mobile])){transform:scaleY(1) translateX(-50%)}.message{display:block;margin:.625rem 1rem}:host([message-line='1']) .message{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}:host([message-line='2']) .message{display:-webkit-box;overflow:hidden;text-overflow:ellipsis;-webkit-box-orient:vertical;-webkit-line-clamp:2}.action-group{display:flex;align-items:center;margin-left:auto;padding-right:.5rem}.action,.close-button{display:inline-flex;align-items:center;justify-content:center}.action{color:rgb(var(--mdui-color-inverse-primary));font-size:var(--mdui-typescale-label-large-size);font-weight:var(--mdui-typescale-label-large-weight);letter-spacing:var(--mdui-typescale-label-large-tracking)}.action mdui-button,::slotted(mdui-button[slot=action][variant=outlined]),::slotted(mdui-button[slot=action][variant=text]){color:inherit;font-size:inherit;font-weight:inherit;letter-spacing:inherit;--mdui-comp-ripple-state-layer-color:var(--mdui-color-inverse-primary)}.action mdui-button::part(button){padding:0 .5rem}.close-button{margin:0 -.25rem 0 .25rem;font-size:1.5rem;color:rgb(var(--mdui-color-inverse-on-surface))}.close-button mdui-button-icon,::slotted(mdui-button-icon[slot=close-button][variant=outlined]),::slotted(mdui-button-icon[slot=close-button][variant=standard]){font-size:inherit;color:inherit;--mdui-comp-ripple-state-layer-color:var(--mdui-color-inverse-on-surface)}.close-button .i,::slotted([slot=close-icon]){font-size:inherit}`;

// node_modules/mdui/components/snackbar/index.js
var stacks = [];
var reordering = false;
var Snackbar = class Snackbar2 extends MduiElement {
  constructor() {
    super();
    this.open = false;
    this.placement = "bottom";
    this.actionLoading = false;
    this.closeable = false;
    this.autoCloseDelay = 5e3;
    this.closeOnOutsideClick = false;
    this.mobile = false;
    this.onDocumentClick = this.onDocumentClick.bind(this);
  }
  async onOpenChange() {
    const easingLinear = getEasing(this, "linear");
    const children = Array.from(this.renderRoot.querySelectorAll(".message, .action-group"));
    if (this.open) {
      const hasUpdated = this.hasUpdated;
      if (!hasUpdated) {
        await this.updateComplete;
      }
      if (hasUpdated) {
        const eventProceeded = this.emit("open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      window.clearTimeout(this.closeTimeout);
      if (this.autoCloseDelay) {
        this.closeTimeout = window.setTimeout(() => {
          this.open = false;
        }, this.autoCloseDelay);
      }
      this.style.display = "flex";
      await Promise.all([
        stopAnimations(this),
        ...children.map((child) => stopAnimations(child))
      ]);
      stacks.push({
        height: this.clientHeight,
        snackbar: this
      });
      await this.reorderStack(this);
      const duration = getDuration(this, "medium4");
      await Promise.all([
        animateTo(this, [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear,
          fill: "forwards"
        }),
        ...children.map((child) => animateTo(child, [
          { opacity: 0 },
          { opacity: 0, offset: 0.2 },
          { opacity: 1, offset: 0.8 },
          { opacity: 1 }
        ], {
          duration: hasUpdated ? duration : 0,
          easing: easingLinear
        }))
      ]);
      if (hasUpdated) {
        this.emit("opened");
      }
      return;
    }
    if (!this.open && this.hasUpdated) {
      const eventProceeded = this.emit("close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      window.clearTimeout(this.closeTimeout);
      await Promise.all([
        stopAnimations(this),
        ...children.map((child) => stopAnimations(child))
      ]);
      const duration = getDuration(this, "short4");
      await Promise.all([
        animateTo(this, [{ opacity: 1 }, { opacity: 0 }], {
          duration,
          easing: easingLinear,
          fill: "forwards"
        }),
        ...children.map((child) => animateTo(child, [{ opacity: 1 }, { opacity: 0, offset: 0.75 }, { opacity: 0 }], {
          duration,
          easing: easingLinear
        }))
      ]);
      this.style.display = "none";
      this.emit("closed");
      const stackIndex = stacks.findIndex((stack) => stack.snackbar === this);
      stacks.splice(stackIndex, 1);
      if (stacks[stackIndex]) {
        await this.reorderStack(stacks[stackIndex].snackbar);
      }
      return;
    }
  }
  /**
   * 这两个属性变更时，需要重新排序该组件后面的 snackbar
   */
  async onStackChange() {
    await this.reorderStack(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.onDocumentClick);
    this.mobile = breakpoint().down("sm");
    this.observeResize = observeResize(document.documentElement, async () => {
      const mobile = breakpoint().down("sm");
      if (this.mobile !== mobile) {
        this.mobile = mobile;
        if (!reordering) {
          reordering = true;
          await this.reorderStack();
          reordering = false;
        }
      }
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this.onDocumentClick);
    window.clearTimeout(this.closeTimeout);
    if (this.open) {
      this.open = false;
    }
    this.observeResize?.unobserve();
  }
  render() {
    return html`<slot part="message" class="message"></slot><div class="action-group"><slot name="action" part="action" class="action" @click="${this.onActionClick}">${this.action ? html`<mdui-button variant="text" loading="${this.actionLoading}">${this.action}</mdui-button>` : nothingTemplate}</slot>${when(this.closeable, () => html`<slot name="close-button" part="close-button" class="close-button" @click="${this.onCloseClick}"><mdui-button-icon><slot name="close-icon" part="close-icon">${this.closeIcon ? html`<mdui-icon name="${this.closeIcon}" class="i"></mdui-icon>` : html`<mdui-icon-clear class="i"></mdui-icon-clear>`}</slot></mdui-button-icon></slot>`)}</div>`;
  }
  /**
   * 重新排序 snackbar 堆叠
   * @param startSnackbar 从哪个 snackbar 开始重新排列，默认从第一个开始
   * @private
   */
  async reorderStack(startSnackbar) {
    const stackIndex = startSnackbar ? stacks.findIndex((stack) => stack.snackbar === startSnackbar) : 0;
    for (let i = stackIndex; i < stacks.length; i++) {
      const stack = stacks[i];
      const snackbar = stack.snackbar;
      if (this.mobile) {
        ["top", "bottom"].forEach((placement) => {
          if (snackbar.placement.startsWith(placement)) {
            const prevStacks = stacks.filter((stack2, index) => {
              return index < i && stack2.snackbar.placement.startsWith(placement);
            });
            const prevHeight = prevStacks.reduce((prev, current) => prev + current.height, 0);
            snackbar.style[placement] = `calc(${prevHeight}px + ${prevStacks.length + 1}rem)`;
            snackbar.style[placement === "top" ? "bottom" : "top"] = "auto";
          }
        });
      } else {
        [
          "top",
          "top-start",
          "top-end",
          "bottom",
          "bottom-start",
          "bottom-end"
        ].forEach((placement) => {
          if (snackbar.placement === placement) {
            const prevStacks = stacks.filter((stack2, index) => {
              return index < i && stack2.snackbar.placement === placement;
            });
            const prevHeight = prevStacks.reduce((prev, current) => prev + current.height, 0);
            snackbar.style[placement.startsWith("top") ? "top" : "bottom"] = `calc(${prevHeight}px + ${prevStacks.length + 1}rem)`;
            snackbar.style[placement.startsWith("top") ? "bottom" : "top"] = "auto";
          }
        });
      }
    }
  }
  /**
   * 在 document 上点击时，根据条件判断是否要关闭 snackbar
   */
  onDocumentClick(e) {
    if (!this.open || !this.closeOnOutsideClick) {
      return;
    }
    const target = e.target;
    if (!this.contains(target) && this !== target) {
      this.open = false;
    }
  }
  onActionClick(event) {
    event.stopPropagation();
    this.emit("action-click");
  }
  onCloseClick() {
    this.open = false;
  }
};
Snackbar.styles = [componentStyle, style22];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Snackbar.prototype, "open", void 0);
__decorate([
  property({ reflect: true })
], Snackbar.prototype, "placement", void 0);
__decorate([
  property({ reflect: true, attribute: "action" })
], Snackbar.prototype, "action", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "action-loading"
  })
], Snackbar.prototype, "actionLoading", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Snackbar.prototype, "closeable", void 0);
__decorate([
  property({ reflect: true, attribute: "close-icon" })
], Snackbar.prototype, "closeIcon", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "message-line" })
  // eslint-disable-next-line prettier/prettier
], Snackbar.prototype, "messageLine", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "auto-close-delay" })
], Snackbar.prototype, "autoCloseDelay", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    attribute: "close-on-outside-click",
    converter: booleanConverter
  })
], Snackbar.prototype, "closeOnOutsideClick", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Snackbar.prototype, "mobile", void 0);
__decorate([
  watch("open")
], Snackbar.prototype, "onOpenChange", null);
__decorate([
  watch("placement", true),
  watch("messageLine", true)
], Snackbar.prototype, "onStackChange", null);
Snackbar = __decorate([
  customElement("mdui-snackbar")
], Snackbar);

// node_modules/mdui/components/switch/style.js
var style23 = css`:host{--shape-corner:var(--mdui-shape-corner-full);--shape-corner-thumb:var(--mdui-shape-corner-full);position:relative;display:inline-block;cursor:pointer;-webkit-tap-highlight-color:transparent;height:2.5rem}:host([disabled]:not([disabled=false i])){cursor:default;pointer-events:none}label{display:inline-flex;align-items:center;width:100%;height:100%;white-space:nowrap;cursor:inherit;-webkit-user-select:none;user-select:none;touch-action:manipulation;zoom:1;-webkit-user-drag:none}.track{position:relative;display:flex;align-items:center;border-radius:var(--shape-corner);transition-property:background-color,border-width;transition-duration:var(--mdui-motion-duration-short4);transition-timing-function:var(--mdui-motion-easing-standard);height:2rem;width:3.25rem;border:.125rem solid rgb(var(--mdui-color-outline));background-color:rgb(var(--mdui-color-surface-container-highest))}:host([checked]:not([checked=false i])) .track{background-color:rgb(var(--mdui-color-primary));border-width:0}.invalid .track{background-color:rgb(var(--mdui-color-error-container));border-color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])) .track{background-color:rgba(var(--mdui-color-surface-container-highest),.12);border-color:rgba(var(--mdui-color-on-surface),.12)}:host([disabled][checked]:not([disabled=false i],[checked=false i])) .track{background-color:rgba(var(--mdui-color-on-surface),.12)}input{position:absolute;padding:0;opacity:0;pointer-events:none;width:1.25rem;height:1.25rem;margin:0 0 0 .625rem}mdui-ripple{border-radius:50%;transition-property:left,top;transition-duration:var(--mdui-motion-duration-short4);transition-timing-function:var(--mdui-motion-easing-standard);width:2.5rem;height:2.5rem}.thumb{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:var(--shape-corner-thumb);transition-property:width,height,left,background-color;transition-duration:var(--mdui-motion-duration-short4);transition-timing-function:var(--mdui-motion-easing-standard);height:1rem;width:1rem;left:.375rem;background-color:rgb(var(--mdui-color-outline));--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}.thumb mdui-ripple{left:-.75rem;top:-.75rem}.has-unchecked-icon .thumb{height:1.5rem;width:1.5rem;left:.125rem}.has-unchecked-icon .thumb mdui-ripple{left:-.5rem;top:-.5rem}:host([focus-visible]) .thumb,:host([hover]) .thumb,:host([pressed]) .thumb{background-color:rgb(var(--mdui-color-on-surface-variant))}:host([checked]:not([checked=false i])) .thumb{height:1.5rem;width:1.5rem;left:1.5rem;background-color:rgb(var(--mdui-color-on-primary));--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}:host([checked]:not([checked=false i])) .thumb mdui-ripple{left:-.5rem;top:-.5rem}:host([pressed]) .thumb{height:1.75rem;width:1.75rem;left:0}:host([pressed]) .thumb mdui-ripple{left:-.375rem;top:-.375rem}:host([pressed][checked]:not([checked=false i])) .thumb{left:1.375rem}:host([focus-visible][checked]:not([checked=false i])) .thumb,:host([hover][checked]:not([checked=false i])) .thumb,:host([pressed][checked]:not([checked=false i])) .thumb{background-color:rgb(var(--mdui-color-primary-container))}.invalid .thumb{background-color:rgb(var(--mdui-color-error));--mdui-comp-ripple-state-layer-color:var(--mdui-color-error)}:host([focus-visible]) .invalid .thumb,:host([hover]) .invalid .thumb,:host([pressed]) .invalid .thumb{background-color:rgb(var(--mdui-color-error))}:host([disabled]:not([disabled=false i])) .thumb{background-color:rgba(var(--mdui-color-on-surface),.38)}:host([disabled][checked]:not([disabled=false i],[checked=false i])) .thumb{background-color:rgb(var(--mdui-color-surface))}.checked-icon,.unchecked-icon{display:flex;position:absolute;transition-property:opacity,transform;font-size:1rem}.unchecked-icon{opacity:1;transform:scale(1);transition-delay:var(--mdui-motion-duration-short1);transition-duration:var(--mdui-motion-duration-short3);transition-timing-function:var(--mdui-motion-easing-linear);color:rgb(var(--mdui-color-surface-container-highest))}:host([checked]:not([checked=false i])) .unchecked-icon{opacity:0;transform:scale(.92);transition-delay:0s;transition-duration:var(--mdui-motion-duration-short1)}:host([disabled]:not([disabled=false i])) .unchecked-icon{color:rgba(var(--mdui-color-surface-container-highest),.38)}.checked-icon{opacity:0;transform:scale(.92);transition-delay:0s;transition-duration:var(--mdui-motion-duration-short1);transition-timing-function:var(--mdui-motion-easing-linear);color:rgb(var(--mdui-color-on-primary-container))}:host([checked]:not([checked=false i])) .checked-icon{opacity:1;transform:scale(1);transition-delay:var(--mdui-motion-duration-short1);transition-duration:var(--mdui-motion-duration-short3)}.invalid .checked-icon{color:rgb(var(--mdui-color-error-container))}:host([disabled]:not([disabled=false i])) .checked-icon{color:rgba(var(--mdui-color-on-surface),.38)}.checked-icon .i,.unchecked-icon .i,::slotted([slot=checked-icon]),::slotted([slot=unchecked-icon]){font-size:inherit;color:inherit}`;

// node_modules/mdui/components/switch/index.js
var Switch = class Switch2 extends RippleMixin(FocusableMixin(MduiElement)) {
  constructor() {
    super(...arguments);
    this.disabled = false;
    this.checked = false;
    this.defaultChecked = false;
    this.required = false;
    this.name = "";
    this.value = "on";
    this.invalid = false;
    this.rippleRef = createRef();
    this.inputRef = createRef();
    this.formController = new FormController(this, {
      value: (control) => control.checked ? control.value : void 0,
      defaultValue: (control) => control.defaultChecked,
      setValue: (control, checked) => control.checked = checked
    });
    this.hasSlotController = new HasSlotController(this, "unchecked-icon");
  }
  /**
   * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
   */
  get validity() {
    return this.inputRef.value.validity;
  }
  /**
   * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
   */
  get validationMessage() {
    return this.inputRef.value.validationMessage;
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return this.disabled;
  }
  get focusElement() {
    return this.inputRef.value;
  }
  get focusDisabled() {
    return this.disabled;
  }
  async onDisabledChange() {
    await this.updateComplete;
    this.invalid = !this.inputRef.value.checkValidity();
  }
  async onCheckedChange() {
    await this.updateComplete;
    const form = this.formController.getForm();
    if (form && formResets.get(form)?.has(this)) {
      this.invalid = false;
      formResets.get(form).delete(this);
    } else {
      this.invalid = !this.inputRef.value.checkValidity();
    }
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
   */
  checkValidity() {
    const valid = this.inputRef.value.checkValidity();
    if (!valid) {
      this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
    }
    return valid;
  }
  /**
   * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
   *
   * 如果验证未通过，还会在组件上显示验证失败的提示。
   */
  reportValidity() {
    this.invalid = !this.inputRef.value.reportValidity();
    if (this.invalid) {
      const eventProceeded = this.emit("invalid", {
        bubbles: false,
        cancelable: true,
        composed: false
      });
      if (!eventProceeded) {
        this.blur();
        this.focus();
      }
    }
    return !this.invalid;
  }
  /**
   * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
   *
   * @param message 自定义的错误提示文本
   */
  setCustomValidity(message) {
    this.inputRef.value.setCustomValidity(message);
    this.invalid = !this.inputRef.value.checkValidity();
  }
  render() {
    return html`<label class="${classMap({
      invalid: this.invalid,
      "has-unchecked-icon": this.uncheckedIcon || this.hasSlotController.test("unchecked-icon")
    })}"><input ${ref(this.inputRef)} type="checkbox" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .disabled="${this.disabled}" .checked="${live(this.checked)}" .required="${this.required}" @change="${this.onChange}"><div part="track" class="track"><div part="thumb" class="thumb"><mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple><slot name="checked-icon" part="checked-icon" class="checked-icon">${this.checkedIcon ? html`<mdui-icon name="${this.checkedIcon}" class="i"></mdui-icon>` : this.checkedIcon === "" ? nothingTemplate : html`<mdui-icon-check class="i"></mdui-icon-check>`}</slot><slot name="unchecked-icon" part="unchecked-icon" class="unchecked-icon">${this.uncheckedIcon ? html`<mdui-icon name="${this.uncheckedIcon}" class="i"></mdui-icon>` : nothingTemplate}</slot></div></div></label>`;
  }
  /**
   * input[type="checkbox"] 的 change 事件无法冒泡越过 shadow dom
   */
  onChange() {
    this.checked = this.inputRef.value.checked;
    this.emit("change");
  }
};
Switch.styles = [componentStyle, style23];
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Switch.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Switch.prototype, "checked", void 0);
__decorate([
  defaultValue("checked")
], Switch.prototype, "defaultChecked", void 0);
__decorate([
  property({ reflect: true, attribute: "unchecked-icon" })
], Switch.prototype, "uncheckedIcon", void 0);
__decorate([
  property({ reflect: true, attribute: "checked-icon" })
], Switch.prototype, "checkedIcon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Switch.prototype, "required", void 0);
__decorate([
  property({ reflect: true })
], Switch.prototype, "form", void 0);
__decorate([
  property({ reflect: true })
], Switch.prototype, "name", void 0);
__decorate([
  property({ reflect: true })
], Switch.prototype, "value", void 0);
__decorate([
  state()
], Switch.prototype, "invalid", void 0);
__decorate([
  watch("disabled", true),
  watch("required", true)
], Switch.prototype, "onDisabledChange", null);
__decorate([
  watch("checked", true)
], Switch.prototype, "onCheckedChange", null);
Switch = __decorate([
  customElement("mdui-switch")
], Switch);

// node_modules/mdui/components/tabs/tab-style.js
var tabStyle = css`:host{position:relative;--mdui-comp-ripple-state-layer-color:var(--mdui-color-on-surface)}:host([active]){--mdui-comp-ripple-state-layer-color:var(--mdui-color-primary)}.container{display:flex;justify-content:center;align-items:center;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;height:100%}.preset{flex-direction:column;min-height:3rem;padding:.625rem 1rem}:host([inline]:not([inline=false i])) .preset{flex-direction:row}.icon-container,.label-container{position:relative;display:flex;align-items:center;justify-content:center}.icon-container ::slotted([slot=badge]){position:absolute;transform:translate(50%,-50%)}.icon-container ::slotted([slot=badge][variant=small]){transform:translate(.5625rem,-.5625rem)}.label-container ::slotted([slot=badge]){position:absolute;left:100%;bottom:100%;transform:translate(-.75rem,.625rem)}.label-container ::slotted([slot=badge][variant=small]){transform:translate(-.375rem,.375rem)}.icon,.label{display:flex;color:rgb(var(--mdui-color-on-surface-variant))}:host([focused]) .icon,:host([focused]) .label,:host([hover]) .icon,:host([hover]) .label,:host([pressed]) .icon,:host([pressed]) .label{color:rgb(var(--mdui-color-on-surface))}:host([active]) .icon,:host([active]) .label{color:rgb(var(--mdui-color-primary))}:host([active]) .variant-secondary .icon,:host([active]) .variant-secondary .label{color:rgb(var(--mdui-color-on-surface))}.icon{font-size:1.5rem}.label{font-size:var(--mdui-typescale-title-small-size);font-weight:var(--mdui-typescale-title-small-weight);letter-spacing:var(--mdui-typescale-title-small-tracking);line-height:var(--mdui-typescale-title-small-line-height)}.icon mdui-icon,::slotted([slot=icon]){font-size:inherit;color:inherit}`;

// node_modules/mdui/components/tabs/tab.js
var Tab = class Tab2 extends RippleMixin(FocusableMixin(MduiElement)) {
  constructor() {
    super(...arguments);
    this.inline = false;
    this.active = false;
    this.variant = "primary";
    this.key = uniqueId();
    this.rippleRef = createRef();
    this.hasSlotController = new HasSlotController(this, "icon", "custom");
  }
  get rippleElement() {
    return this.rippleRef.value;
  }
  get rippleDisabled() {
    return false;
  }
  get focusElement() {
    return this;
  }
  get focusDisabled() {
    return false;
  }
  render() {
    const hasIcon = this.icon || this.hasSlotController.test("icon");
    const hasCustomSlot = this.hasSlotController.test("custom");
    const renderBadge = () => html`<slot name="badge"></slot>`;
    return html`<mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple><div part="container" class="${classMap({
      container: true,
      preset: !hasCustomSlot,
      "variant-secondary": this.variant === "secondary"
    })}"><slot name="custom"><div class="icon-container">${when(hasIcon || this.icon, renderBadge)}<slot name="icon" part="icon" class="icon">${this.icon ? html`<mdui-icon name="${this.icon}"></mdui-icon>` : nothingTemplate}</slot></div><div class="label-container">${when(!hasIcon, renderBadge)}<slot part="label" class="label"></slot></div></slot></div>`;
  }
};
Tab.styles = [componentStyle, tabStyle];
__decorate([
  property({ reflect: true })
], Tab.prototype, "value", void 0);
__decorate([
  property({ reflect: true })
], Tab.prototype, "icon", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Tab.prototype, "inline", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Tab.prototype, "active", void 0);
__decorate([
  state()
], Tab.prototype, "variant", void 0);
Tab = __decorate([
  customElement("mdui-tab")
], Tab);

// node_modules/mdui/components/tabs/tab-panel-style.js
var tabPanelStyle = css`:host{display:block;overflow-y:auto;flex:1 1 auto}:host(:not([active])){display:none}`;

// node_modules/mdui/components/tabs/tab-panel.js
var TabPanel = class TabPanel2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.active = false;
  }
  render() {
    return html`<slot></slot>`;
  }
};
TabPanel.styles = [
  componentStyle,
  tabPanelStyle
];
__decorate([
  property({ reflect: true })
], TabPanel.prototype, "value", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TabPanel.prototype, "active", void 0);
TabPanel = __decorate([
  customElement("mdui-tab-panel")
], TabPanel);

// node_modules/mdui/components/tabs/tabs-style.js
var tabsStyle = css`:host{position:relative;display:flex}:host([placement^=top]){flex-direction:column}:host([placement^=bottom]){flex-direction:column-reverse}:host([placement^=left]){flex-direction:row}:host([placement^=right]){flex-direction:row-reverse}.container{position:relative;display:flex;flex:0 0 auto;overflow-x:auto;background-color:rgb(var(--mdui-color-surface))}:host([placement^=bottom]) .container,:host([placement^=top]) .container{flex-direction:row}:host([placement^=left]) .container,:host([placement^=right]) .container{flex-direction:column}:host([placement$='-start']) .container{justify-content:flex-start}:host([placement=bottom]) .container,:host([placement=left]) .container,:host([placement=right]) .container,:host([placement=top]) .container{justify-content:center}:host([placement$='-end']) .container{justify-content:flex-end}.container::after{content:' ';position:absolute;background-color:rgb(var(--mdui-color-surface-variant))}:host([placement^=bottom]) .container::after,:host([placement^=top]) .container::after{left:0;width:100%;height:.0625rem}:host([placement^=top]) .container::after{bottom:0}:host([placement^=bottom]) .container::after{top:0}:host([placement^=left]) .container::after,:host([placement^=right]) .container::after{top:0;height:100%;width:.0625rem}:host([placement^=left]) .container::after{right:0}:host([placement^=right]) .container::after{left:0}.indicator{position:absolute;z-index:1;background-color:rgb(var(--mdui-color-primary))}.container:not(.initial) .indicator{transition-duration:var(--mdui-motion-duration-medium2);transition-timing-function:var(--mdui-motion-easing-standard-decelerate)}:host([placement^=bottom]) .indicator,:host([placement^=top]) .indicator{transition-property:transform,left,width}:host([placement^=left]) .indicator,:host([placement^=right]) .indicator{transition-property:transform,top,height}:host([placement^=top]) .indicator{bottom:0}:host([placement^=bottom]) .indicator{top:0}:host([placement^=left]) .indicator{right:0}:host([placement^=right]) .indicator{left:0}:host([placement^=bottom][variant=primary]) .indicator,:host([placement^=top][variant=primary]) .indicator{height:.1875rem}:host([placement^=bottom][variant=secondary]) .indicator,:host([placement^=top][variant=secondary]) .indicator{height:.125rem}:host([placement^=left][variant=primary]) .indicator,:host([placement^=right][variant=primary]) .indicator{width:.1875rem}:host([placement^=left][variant=secondary]) .indicator,:host([placement^=right][variant=secondary]) .indicator{width:.125rem}:host([placement^=top][variant=primary]) .indicator{border-top-left-radius:.1875rem;border-top-right-radius:.1875rem}:host([placement^=bottom][variant=primary]) .indicator{border-bottom-right-radius:.1875rem;border-bottom-left-radius:.1875rem}:host([placement^=left][variant=primary]) .indicator{border-top-left-radius:.1875rem;border-bottom-left-radius:.1875rem}:host([placement^=right][variant=primary]) .indicator{border-top-right-radius:.1875rem;border-bottom-right-radius:.1875rem}:host([full-width]:not([full-width=false i])) ::slotted(mdui-tab){flex:1}`;

// node_modules/mdui/components/tabs/tabs.js
var Tabs = class Tabs2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.variant = "primary";
    this.placement = "top-start";
    this.fullWidth = false;
    this.activeKey = 0;
    this.isInitial = true;
    this.containerRef = createRef();
    this.indicatorRef = createRef();
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-tab", "mdui-tab-panel"]
    });
  }
  async onActiveKeyChange() {
    await this.definedController.whenDefined();
    this.value = this.tabs.find((tab) => tab.key === this.activeKey)?.value;
    this.updateActive();
    if (!this.isInitial) {
      this.emit("change");
    }
  }
  async onValueChange() {
    this.isInitial = !this.hasUpdated;
    await this.definedController.whenDefined();
    const tab = this.tabs.find((tab2) => tab2.value === this.value);
    this.activeKey = tab?.key ?? 0;
  }
  async onIndicatorChange() {
    await this.updateComplete;
    this.updateIndicator();
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.observeResize = observeResize(this.containerRef.value, () => this.updateIndicator());
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.observeResize?.unobserve();
  }
  render() {
    return html`<div ${ref(this.containerRef)} part="container" class="container ${classMap({ initial: this.isInitial })}"><slot @slotchange="${this.onSlotChange}" @click="${this.onClick}"></slot><div ${ref(this.indicatorRef)} part="indicator" class="indicator"></div></div><slot name="panel" @slotchange="${this.onSlotChange}"></slot>`;
  }
  async onSlotChange() {
    await this.definedController.whenDefined();
    this.updateActive();
  }
  async onClick(event) {
    if (event.button) {
      return;
    }
    await this.definedController.whenDefined();
    const target = event.target;
    const tab = target.closest("mdui-tab");
    if (!tab) {
      return;
    }
    this.activeKey = tab.key;
    this.isInitial = false;
    this.updateActive();
  }
  updateActive() {
    this.activeTab = this.tabs.map((tab) => {
      tab.active = this.activeKey === tab.key;
      return tab;
    }).find((tab) => tab.active);
    this.panels.forEach((panel) => panel.active = panel.value === this.activeTab?.value);
    this.updateIndicator();
  }
  updateIndicator() {
    const activeTab = this.activeTab;
    const $indicator = $(this.indicatorRef.value);
    const isVertical = this.placement.startsWith("left") || this.placement.startsWith("right");
    if (!activeTab) {
      $indicator.css({
        transform: isVertical ? "scaleY(0)" : "scaleX(0)"
      });
      return;
    }
    const $activeTab = $(activeTab);
    const offsetTop = activeTab.offsetTop;
    const offsetLeft = activeTab.offsetLeft;
    const commonStyle = isVertical ? { transform: "scaleY(1)", width: "", left: "" } : { transform: "scaleX(1)", height: "", top: "" };
    let shownStyle = {};
    if (this.variant === "primary") {
      const $customSlots = $activeTab.find(':scope > [slot="custom"]');
      const children = $customSlots.length ? $customSlots.get() : $(activeTab.renderRoot).find('slot[name="custom"]').children().get();
      if (isVertical) {
        const top = Math.min(...children.map((child) => child.offsetTop)) + offsetTop;
        const bottom = Math.max(...children.map((child) => child.offsetTop + child.offsetHeight)) + offsetTop;
        shownStyle = { top, height: bottom - top };
      } else {
        const left = Math.min(...children.map((child) => child.offsetLeft)) + offsetLeft;
        const right = Math.max(...children.map((child) => child.offsetLeft + child.offsetWidth)) + offsetLeft;
        shownStyle = { left, width: right - left };
      }
    }
    if (this.variant === "secondary") {
      shownStyle = isVertical ? { top: offsetTop, height: activeTab.offsetHeight } : { left: offsetLeft, width: activeTab.offsetWidth };
    }
    $indicator.css({ ...commonStyle, ...shownStyle });
  }
};
Tabs.styles = [componentStyle, tabsStyle];
__decorate([
  property({ reflect: true })
], Tabs.prototype, "variant", void 0);
__decorate([
  property({ reflect: true })
], Tabs.prototype, "value", void 0);
__decorate([
  property({ reflect: true })
], Tabs.prototype, "placement", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter,
    attribute: "full-width"
  })
], Tabs.prototype, "fullWidth", void 0);
__decorate([
  state()
], Tabs.prototype, "activeKey", void 0);
__decorate([
  state()
], Tabs.prototype, "isInitial", void 0);
__decorate([
  queryAssignedElements({ selector: "mdui-tab", flatten: true })
], Tabs.prototype, "tabs", void 0);
__decorate([
  queryAssignedElements({
    selector: "mdui-tab-panel",
    slot: "panel",
    flatten: true
  })
], Tabs.prototype, "panels", void 0);
__decorate([
  watch("activeKey", true)
], Tabs.prototype, "onActiveKeyChange", null);
__decorate([
  watch("value")
], Tabs.prototype, "onValueChange", null);
__decorate([
  watch("variant", true),
  watch("placement", true),
  watch("fullWidth", true)
], Tabs.prototype, "onIndicatorChange", null);
Tabs = __decorate([
  customElement("mdui-tabs")
], Tabs);

// node_modules/@mdui/shared/controllers/hover.js
var HoverController = class {
  /**
   * @param host
   * @param elementRef 检查鼠标是否放在该元素上
   */
  constructor(host, elementRef) {
    this.isHover = false;
    this.uniqueID = uniqueId();
    this.enterEventName = `mouseenter.${this.uniqueID}.hoverController`;
    this.leaveEventName = `mouseleave.${this.uniqueID}.hoverController`;
    this.mouseEnterItems = [];
    this.mouseLeaveItems = [];
    (this.host = host).addController(this);
    this.elementRef = elementRef;
  }
  hostConnected() {
    this.host.updateComplete.then(() => {
      $(this.elementRef.value).on(this.enterEventName, () => {
        this.isHover = true;
        for (let i = this.mouseEnterItems.length - 1; i >= 0; i--) {
          const item = this.mouseEnterItems[i];
          item.callback();
          if (item.one) {
            this.mouseEnterItems.splice(i, 1);
          }
        }
      }).on(this.leaveEventName, () => {
        this.isHover = false;
        for (let i = this.mouseLeaveItems.length - 1; i >= 0; i--) {
          const item = this.mouseLeaveItems[i];
          item.callback();
          if (item.one) {
            this.mouseLeaveItems.splice(i, 1);
          }
        }
      });
    });
  }
  hostDisconnected() {
    $(this.elementRef.value).off(this.enterEventName).off(this.leaveEventName);
  }
  /**
   * 指定鼠标移入时的回调函数
   * @param callback 要执行的回调函数
   * @param one 是否仅执行一次
   */
  onMouseEnter(callback, one = false) {
    this.mouseEnterItems.push({ callback, one });
  }
  /**
   * 指定鼠标移出时的回调函数
   * @param callback 要执行的回调函数
   * @param one 是否仅执行一次
   */
  onMouseLeave(callback, one = false) {
    this.mouseLeaveItems.push({ callback, one });
  }
};

// node_modules/mdui/components/tooltip/style.js
var style24 = css`:host{--shape-corner-plain:var(--mdui-shape-corner-extra-small);--shape-corner-rich:var(--mdui-shape-corner-medium);--z-index:2500;display:contents}.popup{position:fixed;display:flex;flex-direction:column;z-index:var(--z-index);border-radius:var(--shape-corner-plain);background-color:rgb(var(--mdui-color-inverse-surface));padding:0 .5rem;min-width:1.75rem;max-width:20rem}:host([variant=rich]) .popup{border-radius:var(--shape-corner-rich);background-color:rgb(var(--mdui-color-surface-container));box-shadow:var(--mdui-elevation-level2);padding:.75rem 1rem .5rem 1rem}.headline{display:flex;color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-title-small-size);font-weight:var(--mdui-typescale-title-small-weight);letter-spacing:var(--mdui-typescale-title-small-tracking);line-height:var(--mdui-typescale-title-small-line-height)}.content{display:flex;padding:.25rem 0;color:rgb(var(--mdui-color-inverse-on-surface));font-size:var(--mdui-typescale-body-small-size);font-weight:var(--mdui-typescale-body-small-weight);letter-spacing:var(--mdui-typescale-body-small-tracking);line-height:var(--mdui-typescale-body-small-line-height)}:host([variant=rich]) .content{color:rgb(var(--mdui-color-on-surface-variant));font-size:var(--mdui-typescale-body-medium-size);font-weight:var(--mdui-typescale-body-medium-weight);letter-spacing:var(--mdui-typescale-body-medium-tracking);line-height:var(--mdui-typescale-body-medium-line-height)}.action{display:flex;justify-content:flex-start;padding-top:.5rem}.action ::slotted(:not(:last-child)){margin-right:.5rem}`;

// node_modules/mdui/components/tooltip/index.js
var Tooltip = class Tooltip2 extends MduiElement {
  constructor() {
    super();
    this.variant = "plain";
    this.placement = "auto";
    this.openDelay = 150;
    this.closeDelay = 150;
    this.trigger = "hover focus";
    this.disabled = false;
    this.open = false;
    this.popupRef = createRef();
    this.hasSlotController = new HasSlotController(this, "headline", "action");
    this.hoverController = new HoverController(this, this.popupRef);
    this.definedController = new DefinedController(this, {
      needDomReady: true
    });
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onWindowScroll = this.onWindowScroll.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }
  /**
   * 获取第一个非 <style> 和 content slot 的子元素，作为 tooltip 的目标元素
   */
  get target() {
    return [...this.children].find((el) => el.tagName.toLowerCase() !== "style" && el.getAttribute("slot") !== "content");
  }
  async onPositionChange() {
    if (this.open) {
      await this.definedController.whenDefined();
      this.updatePositioner();
    }
  }
  async onOpenChange() {
    const hasUpdated = this.hasUpdated;
    const duration = getDuration(this, "short4");
    const easing = getEasing(this, "standard");
    if (this.open) {
      await this.definedController.whenDefined();
      $(`mdui-tooltip[variant="${this.variant}"]`).filter((_, element) => element !== this).prop("open", false);
      if (!hasUpdated) {
        await this.updateComplete;
      }
      if (hasUpdated) {
        const eventProceeded = this.emit("open", { cancelable: true });
        if (!eventProceeded) {
          return;
        }
      }
      await stopAnimations(this.popupRef.value);
      this.popupRef.value.hidden = false;
      this.updatePositioner();
      await animateTo(this.popupRef.value, [{ transform: "scale(0)" }, { transform: "scale(1)" }], {
        duration: hasUpdated ? duration : 0,
        easing
      });
      if (hasUpdated) {
        this.emit("opened");
      }
      return;
    }
    if (!this.open && hasUpdated) {
      const eventProceeded = this.emit("close", { cancelable: true });
      if (!eventProceeded) {
        return;
      }
      await stopAnimations(this.popupRef.value);
      await animateTo(this.popupRef.value, [{ transform: "scale(1)" }, { transform: "scale(0)" }], { duration, easing });
      this.popupRef.value.hidden = true;
      this.emit("closed");
    }
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.onDocumentClick);
    this.definedController.whenDefined().then(() => {
      this.overflowAncestors = getOverflowAncestors(this.target);
      this.overflowAncestors.forEach((ancestor) => {
        ancestor.addEventListener("scroll", this.onWindowScroll);
      });
      this.observeResize = observeResize(this.target, () => {
        this.updatePositioner();
      });
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("pointerdown", this.onDocumentClick);
    this.overflowAncestors?.forEach((ancestor) => {
      ancestor.removeEventListener("scroll", this.onWindowScroll);
    });
    this.observeResize?.unobserve();
  }
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.definedController.whenDefined().then(() => {
      const target = this.target;
      target.addEventListener("focus", this.onFocus);
      target.addEventListener("blur", this.onBlur);
      target.addEventListener("pointerdown", this.onClick);
      target.addEventListener("keydown", this.onKeydown);
      target.addEventListener("mouseenter", this.onMouseEnter);
      target.addEventListener("mouseleave", this.onMouseLeave);
    });
  }
  render() {
    const hasHeadline = this.isRich() && (this.headline || this.hasSlotController.test("headline"));
    const hasAction = this.isRich() && this.hasSlotController.test("action");
    return html`<slot></slot><div ${ref(this.popupRef)} part="popup" class="popup" hidden>${when(hasHeadline, () => html`<slot name="headline" part="headline" class="headline">${this.headline}</slot>`)}<slot name="content" part="content" class="content">${this.content}</slot>${when(hasAction, () => html`<slot name="action" part="action" class="action"></slot>`)}</div>`;
  }
  isRich() {
    return this.variant === "rich";
  }
  /**
   * 请求关闭 tooltip。鼠标未悬浮在 tooltip 上时，直接关闭；否则等鼠标移走再关闭
   */
  requestClose() {
    if (!this.hoverController.isHover) {
      this.open = false;
      return;
    }
    this.hoverController.onMouseLeave(() => {
      if (this.hasTrigger("hover")) {
        this.hoverTimeout = window.setTimeout(() => {
          this.open = false;
        }, this.closeDelay || 50);
      } else {
        this.open = false;
      }
    }, true);
  }
  hasTrigger(trigger) {
    const triggers = this.trigger.split(" ");
    return triggers.includes(trigger);
  }
  onFocus() {
    if (this.disabled || this.open || !this.hasTrigger("focus")) {
      return;
    }
    this.open = true;
  }
  onBlur() {
    if (this.disabled || !this.open || !this.hasTrigger("focus")) {
      return;
    }
    this.requestClose();
  }
  onClick(e) {
    if (this.disabled || e.button || !this.hasTrigger("click")) {
      return;
    }
    if (this.open && (this.hasTrigger("hover") || this.hasTrigger("focus"))) {
      return;
    }
    this.open = !this.open;
  }
  onKeydown(e) {
    if (this.disabled || !this.open || e.key !== "Escape") {
      return;
    }
    e.stopPropagation();
    this.requestClose();
  }
  onMouseEnter() {
    if (this.disabled || this.open || !this.hasTrigger("hover")) {
      return;
    }
    if (this.openDelay) {
      window.clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => {
        this.open = true;
      }, this.openDelay);
    } else {
      this.open = true;
    }
  }
  onMouseLeave() {
    window.clearTimeout(this.hoverTimeout);
    if (this.disabled || !this.open || !this.hasTrigger("hover")) {
      return;
    }
    this.hoverTimeout = window.setTimeout(() => {
      this.requestClose();
    }, this.closeDelay || 50);
  }
  /**
   * 在 document 上点击时，根据条件判断是否关闭 tooltip
   */
  onDocumentClick(e) {
    if (this.disabled || !this.open) {
      return;
    }
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.requestClose();
    }
  }
  onWindowScroll() {
    window.requestAnimationFrame(() => this.updatePositioner());
  }
  updatePositioner() {
    const $popup = $(this.popupRef.value);
    const targetMargin = this.isRich() ? 0 : 4;
    const popupMargin = 4;
    const targetRect = this.target.getBoundingClientRect();
    const targetTop = targetRect.top;
    const targetLeft = targetRect.left;
    const targetHeight = targetRect.height;
    const targetWidth = targetRect.width;
    const popupHeight = this.popupRef.value.offsetHeight;
    const popupWidth = this.popupRef.value.offsetWidth;
    const popupXSpace = popupWidth + targetMargin + popupMargin;
    const popupYSpace = popupHeight + targetMargin + popupMargin;
    let transformOriginX;
    let transformOriginY;
    let top;
    let left;
    let placement = this.placement;
    if (placement === "auto") {
      const $window = $(window);
      const hasTopSpace = targetTop > popupYSpace;
      const hasBottomSpace = $window.height() - targetTop - targetHeight > popupYSpace;
      const hasLeftSpace = targetLeft > popupXSpace;
      const hasRightSpace = $window.width() - targetLeft - targetWidth > popupXSpace;
      if (this.isRich()) {
        placement = "bottom-right";
        if (hasBottomSpace && hasRightSpace) {
          placement = "bottom-right";
        } else if (hasBottomSpace && hasLeftSpace) {
          placement = "bottom-left";
        } else if (hasTopSpace && hasRightSpace) {
          placement = "top-right";
        } else if (hasTopSpace && hasLeftSpace) {
          placement = "top-left";
        } else if (hasBottomSpace) {
          placement = "bottom";
        } else if (hasTopSpace) {
          placement = "top";
        } else if (hasRightSpace) {
          placement = "right";
        } else if (hasLeftSpace) {
          placement = "left";
        }
      } else {
        placement = "top";
        if (hasTopSpace) {
          placement = "top";
        } else if (hasBottomSpace) {
          placement = "bottom";
        } else if (hasLeftSpace) {
          placement = "left";
        } else if (hasRightSpace) {
          placement = "right";
        }
      }
    }
    const [position, alignment] = placement.split("-");
    switch (position) {
      case "top":
        transformOriginY = "bottom";
        top = targetTop - popupHeight - targetMargin;
        break;
      case "bottom":
        transformOriginY = "top";
        top = targetTop + targetHeight + targetMargin;
        break;
      default:
        transformOriginY = "center";
        switch (alignment) {
          case "start":
            top = targetTop;
            break;
          case "end":
            top = targetTop + targetHeight - popupHeight;
            break;
          default:
            top = targetTop + targetHeight / 2 - popupHeight / 2;
            break;
        }
        break;
    }
    switch (position) {
      case "left":
        transformOriginX = "right";
        left = targetLeft - popupWidth - targetMargin;
        break;
      case "right":
        transformOriginX = "left";
        left = targetLeft + targetWidth + targetMargin;
        break;
      default:
        transformOriginX = "center";
        switch (alignment) {
          case "start":
            left = targetLeft;
            break;
          case "end":
            left = targetLeft + targetWidth - popupWidth;
            break;
          case "left":
            transformOriginX = "right";
            left = targetLeft - popupWidth - targetMargin;
            break;
          case "right":
            transformOriginX = "left";
            left = targetLeft + targetWidth + targetMargin;
            break;
          default:
            left = targetLeft + targetWidth / 2 - popupWidth / 2;
            break;
        }
        break;
    }
    $popup.css({
      top,
      left,
      transformOrigin: [transformOriginX, transformOriginY].join(" ")
    });
  }
};
Tooltip.styles = [componentStyle, style24];
__decorate([
  property({ reflect: true })
], Tooltip.prototype, "variant", void 0);
__decorate([
  property({ reflect: true })
], Tooltip.prototype, "placement", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "open-delay" })
], Tooltip.prototype, "openDelay", void 0);
__decorate([
  property({ type: Number, reflect: true, attribute: "close-delay" })
], Tooltip.prototype, "closeDelay", void 0);
__decorate([
  property({ reflect: true })
], Tooltip.prototype, "headline", void 0);
__decorate([
  property({ reflect: true })
], Tooltip.prototype, "content", void 0);
__decorate([
  property({ reflect: true })
], Tooltip.prototype, "trigger", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Tooltip.prototype, "disabled", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], Tooltip.prototype, "open", void 0);
__decorate([
  watch("placement", true),
  watch("content", true)
], Tooltip.prototype, "onPositionChange", null);
__decorate([
  watch("open")
], Tooltip.prototype, "onOpenChange", null);
Tooltip = __decorate([
  customElement("mdui-tooltip")
], Tooltip);

// node_modules/@mdui/shared/helpers/slot.js
var getInnerHtmlFromSlot = (slot) => {
  const nodes = slot.assignedNodes({ flatten: true });
  let html2 = "";
  [...nodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      html2 += node.outerHTML;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      html2 += node.textContent;
    }
  });
  return html2;
};

// node_modules/mdui/components/top-app-bar/top-app-bar-title-style.js
var topAppBarTitleStyle = css`:host{display:block;width:100%;flex-shrink:initial!important;overflow:hidden;color:rgb(var(--mdui-color-on-surface));font-size:var(--mdui-typescale-title-large-size);font-weight:var(--mdui-typescale-title-large-weight);letter-spacing:var(--mdui-typescale-title-large-tracking);line-height:var(--mdui-typescale-title-large-line-height);line-height:2.5rem}.label{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:1;transition:opacity var(--mdui-motion-duration-short2) var(--mdui-motion-easing-linear)}.label.variant-center-aligned{text-align:center}.label.variant-large:not(.shrink),.label.variant-medium:not(.shrink){opacity:0}.label.variant-large.shrink,.label.variant-medium.shrink{transition-delay:var(--mdui-motion-duration-short2)}.label-large{display:none;position:absolute;width:100%;left:0;margin-right:0;padding:0 1rem;transition:opacity var(--mdui-motion-duration-short2) var(--mdui-motion-easing-linear)}.label-large.variant-large,.label-large.variant-medium{display:block}.label-large.variant-medium{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;bottom:.75rem;font-size:var(--mdui-typescale-headline-small-size);font-weight:var(--mdui-typescale-headline-small-weight);letter-spacing:var(--mdui-typescale-headline-small-tracking);line-height:var(--mdui-typescale-headline-small-line-height)}.label-large.variant-large{display:-webkit-box;overflow:hidden;white-space:normal;-webkit-box-orient:vertical;-webkit-line-clamp:2;bottom:1.25rem;font-size:var(--mdui-typescale-headline-medium-size);font-weight:var(--mdui-typescale-headline-medium-weight);letter-spacing:var(--mdui-typescale-headline-medium-tracking);line-height:var(--mdui-typescale-headline-medium-line-height)}.label-large.variant-large:not(.shrink),.label-large.variant-medium:not(.shrink){opacity:1;transition-delay:var(--mdui-motion-duration-short2)}.label-large.variant-large.shrink,.label-large.variant-medium.shrink{opacity:0;z-index:-1}`;

// node_modules/mdui/components/top-app-bar/top-app-bar-title.js
var TopAppBarTitle = class TopAppBarTitle2 extends MduiElement {
  constructor() {
    super(...arguments);
    this.variant = "small";
    this.shrink = false;
    this.hasSlotController = new HasSlotController(this, "label-large");
    this.labelLargeRef = createRef();
    this.defaultSlotRef = createRef();
  }
  render() {
    const hasLabelLargeSlot = this.hasSlotController.test("label-large");
    const className2 = classMap({
      shrink: this.shrink,
      "variant-center-aligned": this.variant === "center-aligned",
      "variant-small": this.variant === "small",
      "variant-medium": this.variant === "medium",
      "variant-large": this.variant === "large"
    });
    return html`<slot part="label" class="label ${className2}" ${ref(this.defaultSlotRef)} @slotchange="${() => this.onSlotChange(hasLabelLargeSlot)}"></slot>${hasLabelLargeSlot ? html`<slot name="label-large" part="label-large" class="label-large ${className2}"></slot>` : html`<div ${ref(this.labelLargeRef)} part="label-large" class="label-large ${className2}"></div>`}`;
  }
  /**
   * default slot 变化时，同步到 label-large 中
   * @param hasLabelLargeSlot
   * @private
   */
  onSlotChange(hasLabelLargeSlot) {
    if (!hasLabelLargeSlot) {
      this.labelLargeRef.value.innerHTML = getInnerHtmlFromSlot(this.defaultSlotRef.value);
    }
  }
};
TopAppBarTitle.styles = [
  componentStyle,
  topAppBarTitleStyle
];
__decorate([
  state()
], TopAppBarTitle.prototype, "variant", void 0);
__decorate([
  state()
], TopAppBarTitle.prototype, "shrink", void 0);
TopAppBarTitle = __decorate([
  customElement("mdui-top-app-bar-title")
], TopAppBarTitle);

// node_modules/mdui/components/top-app-bar/top-app-bar-style.js
var topAppBarStyle = css`:host{--shape-corner:var(--mdui-shape-corner-none);--z-index:2000;position:fixed;top:0;right:0;left:0;display:flex;flex:0 0 auto;align-items:flex-start;justify-content:flex-start;border-bottom-left-radius:var(--shape-corner);border-bottom-right-radius:var(--shape-corner);z-index:var(--z-index);transition:top var(--mdui-motion-duration-long2) var(--mdui-motion-easing-standard),height var(--mdui-motion-duration-long2) var(--mdui-motion-easing-standard),box-shadow var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear),background-color var(--mdui-motion-duration-short4) var(--mdui-motion-easing-linear);padding:.75rem .5rem;height:4rem;background-color:rgb(var(--mdui-color-surface))}:host([scroll-target]:not([scroll-target=''])){position:absolute}:host([scroll-behavior~=shrink]){transition-duration:var(--mdui-motion-duration-short4)}:host([scrolling]){background-color:rgb(var(--mdui-color-surface-container));box-shadow:var(--mdui-elevation-level2)}::slotted(mdui-button-icon){color:rgb(var(--mdui-color-on-surface-variant));font-size:1.5rem}::slotted(mdui-button-icon:first-child){color:rgb(var(--mdui-color-on-surface))}::slotted(mdui-avatar){width:1.875rem;height:1.875rem;margin-top:.3125rem;margin-bottom:.3125rem}::slotted(*){flex-shrink:0}::slotted(:not(:last-child)){margin-right:.5rem}:host([variant=medium]){height:7rem}:host([variant=large]){height:9.5rem}:host([hide]:not([hide=false i])){transition-duration:var(--mdui-motion-duration-short4);top:-4.625rem}:host([hide][variant=medium]:not([hide=false i])){top:-7.625rem}:host([hide][variant=large]:not([hide=false i])){top:-10.125rem}:host([shrink][variant=large]:not([shrink=false i])),:host([shrink][variant=medium]:not([shrink=false i])){transition-duration:var(--mdui-motion-duration-short4);height:4rem}`;

// node_modules/mdui/components/top-app-bar/top-app-bar.js
var TopAppBar = class TopAppBar2 extends ScrollBehaviorMixin(LayoutItemBase) {
  constructor() {
    super(...arguments);
    this.variant = "small";
    this.hide = false;
    this.shrink = false;
    this.scrolling = false;
    this.definedController = new DefinedController(this, {
      relatedElements: ["mdui-top-app-bar-title"]
    });
  }
  get scrollPaddingPosition() {
    return "top";
  }
  get layoutPlacement() {
    return "top";
  }
  async onVariantChange() {
    if (this.hasUpdated) {
      this.addEventListener("transitionend", async () => {
        await this.scrollBehaviorDefinedController.whenDefined();
        this.setContainerPadding("update", this.scrollTarget);
      }, { once: true });
    } else {
      await this.updateComplete;
    }
    await this.definedController.whenDefined();
    this.titleElements.forEach((titleElement) => {
      titleElement.variant = this.variant;
    });
  }
  async onShrinkChange() {
    if (!this.hasUpdated) {
      await this.updateComplete;
    }
    await this.definedController.whenDefined();
    this.titleElements.forEach((titleElement) => {
      titleElement.shrink = this.shrink;
    });
  }
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);
    this.addEventListener("transitionend", (e) => {
      if (e.target === this) {
        this.emit(this.hide ? "hidden" : "shown");
      }
    });
  }
  render() {
    return html`<slot></slot>`;
  }
  runScrollNoThreshold(isScrollingUp, scrollTop) {
    if (this.hasScrollBehavior("shrink")) {
      if (isScrollingUp && scrollTop < 8) {
        this.shrink = false;
      }
    }
  }
  runScrollThreshold(isScrollingUp, scrollTop) {
    if (this.hasScrollBehavior("elevate")) {
      this.scrolling = !!scrollTop;
    }
    if (this.hasScrollBehavior("shrink")) {
      if (!isScrollingUp) {
        this.shrink = true;
      }
    }
    if (this.hasScrollBehavior("hide")) {
      if (!isScrollingUp && !this.hide) {
        const eventProceeded = this.emit("hide", { cancelable: true });
        if (eventProceeded) {
          this.hide = true;
        }
      }
      if (isScrollingUp && this.hide) {
        const eventProceeded = this.emit("show", { cancelable: true });
        if (eventProceeded) {
          this.hide = false;
        }
      }
    }
  }
};
TopAppBar.styles = [
  componentStyle,
  topAppBarStyle
];
__decorate([
  property({ reflect: true })
], TopAppBar.prototype, "variant", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TopAppBar.prototype, "hide", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TopAppBar.prototype, "shrink", void 0);
__decorate([
  property({ reflect: true, attribute: "scroll-behavior" })
], TopAppBar.prototype, "scrollBehavior", void 0);
__decorate([
  property({
    type: Boolean,
    reflect: true,
    converter: booleanConverter
  })
], TopAppBar.prototype, "scrolling", void 0);
__decorate([
  queryAssignedElements({ selector: "mdui-top-app-bar-title", flatten: true })
], TopAppBar.prototype, "titleElements", void 0);
__decorate([
  watch("variant")
], TopAppBar.prototype, "onVariantChange", null);
__decorate([
  watch("shrink")
], TopAppBar.prototype, "onShrinkChange", null);
TopAppBar = __decorate([
  customElement("mdui-top-app-bar")
], TopAppBar);

// node_modules/mdui/node_modules/@material/material-color-utilities/utils/math_utils.js
function signum(num) {
  if (num < 0) {
    return -1;
  } else if (num === 0) {
    return 0;
  } else {
    return 1;
  }
}
function lerp(start, stop, amount) {
  return (1 - amount) * start + amount * stop;
}
function clampInt(min, max, input) {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }
  return input;
}
function clampDouble(min, max, input) {
  if (input < min) {
    return min;
  } else if (input > max) {
    return max;
  }
  return input;
}
function sanitizeDegreesInt(degrees) {
  degrees = degrees % 360;
  if (degrees < 0) {
    degrees = degrees + 360;
  }
  return degrees;
}
function sanitizeDegreesDouble(degrees) {
  degrees = degrees % 360;
  if (degrees < 0) {
    degrees = degrees + 360;
  }
  return degrees;
}
function rotationDirection(from, to) {
  const increasingDifference = sanitizeDegreesDouble(to - from);
  return increasingDifference <= 180 ? 1 : -1;
}
function differenceDegrees(a, b) {
  return 180 - Math.abs(Math.abs(a - b) - 180);
}
function matrixMultiply(row, matrix) {
  const a = row[0] * matrix[0][0] + row[1] * matrix[0][1] + row[2] * matrix[0][2];
  const b = row[0] * matrix[1][0] + row[1] * matrix[1][1] + row[2] * matrix[1][2];
  const c = row[0] * matrix[2][0] + row[1] * matrix[2][1] + row[2] * matrix[2][2];
  return [a, b, c];
}

// node_modules/mdui/node_modules/@material/material-color-utilities/utils/color_utils.js
var SRGB_TO_XYZ = [
  [0.41233895, 0.35762064, 0.18051042],
  [0.2126, 0.7152, 0.0722],
  [0.01932141, 0.11916382, 0.95034478]
];
var XYZ_TO_SRGB = [
  [
    3.2413774792388685,
    -1.5376652402851851,
    -0.49885366846268053
  ],
  [
    -0.9691452513005321,
    1.8758853451067872,
    0.04156585616912061
  ],
  [
    0.05562093689691305,
    -0.20395524564742123,
    1.0571799111220335
  ]
];
var WHITE_POINT_D65 = [95.047, 100, 108.883];
function argbFromRgb(red, green, blue) {
  return (255 << 24 | (red & 255) << 16 | (green & 255) << 8 | blue & 255) >>> 0;
}
function argbFromLinrgb(linrgb) {
  const r = delinearized(linrgb[0]);
  const g = delinearized(linrgb[1]);
  const b = delinearized(linrgb[2]);
  return argbFromRgb(r, g, b);
}
function redFromArgb(argb) {
  return argb >> 16 & 255;
}
function greenFromArgb(argb) {
  return argb >> 8 & 255;
}
function blueFromArgb(argb) {
  return argb & 255;
}
function argbFromXyz(x, y, z) {
  const matrix = XYZ_TO_SRGB;
  const linearR = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
  const linearG = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
  const linearB = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;
  const r = delinearized(linearR);
  const g = delinearized(linearG);
  const b = delinearized(linearB);
  return argbFromRgb(r, g, b);
}
function xyzFromArgb(argb) {
  const r = linearized(redFromArgb(argb));
  const g = linearized(greenFromArgb(argb));
  const b = linearized(blueFromArgb(argb));
  return matrixMultiply([r, g, b], SRGB_TO_XYZ);
}
function argbFromLstar(lstar) {
  const y = yFromLstar(lstar);
  const component = delinearized(y);
  return argbFromRgb(component, component, component);
}
function lstarFromArgb(argb) {
  const y = xyzFromArgb(argb)[1];
  return 116 * labF(y / 100) - 16;
}
function yFromLstar(lstar) {
  return 100 * labInvf((lstar + 16) / 116);
}
function lstarFromY(y) {
  return labF(y / 100) * 116 - 16;
}
function linearized(rgbComponent) {
  const normalized = rgbComponent / 255;
  if (normalized <= 0.040449936) {
    return normalized / 12.92 * 100;
  } else {
    return Math.pow((normalized + 0.055) / 1.055, 2.4) * 100;
  }
}
function delinearized(rgbComponent) {
  const normalized = rgbComponent / 100;
  let delinearized2 = 0;
  if (normalized <= 31308e-7) {
    delinearized2 = normalized * 12.92;
  } else {
    delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
  }
  return clampInt(0, 255, Math.round(delinearized2 * 255));
}
function whitePointD65() {
  return WHITE_POINT_D65;
}
function labF(t) {
  const e = 216 / 24389;
  const kappa = 24389 / 27;
  if (t > e) {
    return Math.pow(t, 1 / 3);
  } else {
    return (kappa * t + 16) / 116;
  }
}
function labInvf(ft) {
  const e = 216 / 24389;
  const kappa = 24389 / 27;
  const ft3 = ft * ft * ft;
  if (ft3 > e) {
    return ft3;
  } else {
    return (116 * ft - 16) / kappa;
  }
}

// node_modules/mdui/node_modules/@material/material-color-utilities/hct/viewing_conditions.js
var ViewingConditions = class _ViewingConditions {
  /**
   * Create ViewingConditions from a simple, physically relevant, set of
   * parameters.
   *
   * @param whitePoint White point, measured in the XYZ color space.
   *     default = D65, or sunny day afternoon
   * @param adaptingLuminance The luminance of the adapting field. Informally,
   *     how bright it is in the room where the color is viewed. Can be
   *     calculated from lux by multiplying lux by 0.0586. default = 11.72,
   *     or 200 lux.
   * @param backgroundLstar The lightness of the area surrounding the color.
   *     measured by L* in L*a*b*. default = 50.0
   * @param surround A general description of the lighting surrounding the
   *     color. 0 is pitch dark, like watching a movie in a theater. 1.0 is a
   *     dimly light room, like watching TV at home at night. 2.0 means there
   *     is no difference between the lighting on the color and around it.
   *     default = 2.0
   * @param discountingIlluminant Whether the eye accounts for the tint of the
   *     ambient lighting, such as knowing an apple is still red in green light.
   *     default = false, the eye does not perform this process on
   *       self-luminous objects like displays.
   */
  static make(whitePoint = whitePointD65(), adaptingLuminance = 200 / Math.PI * yFromLstar(50) / 100, backgroundLstar = 50, surround = 2, discountingIlluminant = false) {
    const xyz = whitePoint;
    const rW = xyz[0] * 0.401288 + xyz[1] * 0.650173 + xyz[2] * -0.051461;
    const gW = xyz[0] * -0.250268 + xyz[1] * 1.204414 + xyz[2] * 0.045854;
    const bW = xyz[0] * -2079e-6 + xyz[1] * 0.048952 + xyz[2] * 0.953127;
    const f = 0.8 + surround / 10;
    const c = f >= 0.9 ? lerp(0.59, 0.69, (f - 0.9) * 10) : lerp(0.525, 0.59, (f - 0.8) * 10);
    let d2 = discountingIlluminant ? 1 : f * (1 - 1 / 3.6 * Math.exp((-adaptingLuminance - 42) / 92));
    d2 = d2 > 1 ? 1 : d2 < 0 ? 0 : d2;
    const nc = f;
    const rgbD = [
      d2 * (100 / rW) + 1 - d2,
      d2 * (100 / gW) + 1 - d2,
      d2 * (100 / bW) + 1 - d2
    ];
    const k = 1 / (5 * adaptingLuminance + 1);
    const k4 = k * k * k * k;
    const k4F = 1 - k4;
    const fl = k4 * adaptingLuminance + 0.1 * k4F * k4F * Math.cbrt(5 * adaptingLuminance);
    const n2 = yFromLstar(backgroundLstar) / whitePoint[1];
    const z = 1.48 + Math.sqrt(n2);
    const nbb = 0.725 / Math.pow(n2, 0.2);
    const ncb = nbb;
    const rgbAFactors = [
      Math.pow(fl * rgbD[0] * rW / 100, 0.42),
      Math.pow(fl * rgbD[1] * gW / 100, 0.42),
      Math.pow(fl * rgbD[2] * bW / 100, 0.42)
    ];
    const rgbA = [
      400 * rgbAFactors[0] / (rgbAFactors[0] + 27.13),
      400 * rgbAFactors[1] / (rgbAFactors[1] + 27.13),
      400 * rgbAFactors[2] / (rgbAFactors[2] + 27.13)
    ];
    const aw = (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]) * nbb;
    return new _ViewingConditions(n2, aw, nbb, ncb, c, nc, rgbD, fl, Math.pow(fl, 0.25), z);
  }
  /**
   * Parameters are intermediate values of the CAM16 conversion process. Their
   * names are shorthand for technical color science terminology, this class
   * would not benefit from documenting them individually. A brief overview
   * is available in the CAM16 specification, and a complete overview requires
   * a color science textbook, such as Fairchild's Color Appearance Models.
   */
  constructor(n2, aw, nbb, ncb, c, nc, rgbD, fl, fLRoot, z) {
    this.n = n2;
    this.aw = aw;
    this.nbb = nbb;
    this.ncb = ncb;
    this.c = c;
    this.nc = nc;
    this.rgbD = rgbD;
    this.fl = fl;
    this.fLRoot = fLRoot;
    this.z = z;
  }
};
ViewingConditions.DEFAULT = ViewingConditions.make();

// node_modules/mdui/node_modules/@material/material-color-utilities/hct/cam16.js
var Cam16 = class _Cam16 {
  /**
   * All of the CAM16 dimensions can be calculated from 3 of the dimensions, in
   * the following combinations:
   *      -  {j or q} and {c, m, or s} and hue
   *      - jstar, astar, bstar
   * Prefer using a static method that constructs from 3 of those dimensions.
   * This constructor is intended for those methods to use to return all
   * possible dimensions.
   *
   * @param hue
   * @param chroma informally, colorfulness / color intensity. like saturation
   *     in HSL, except perceptually accurate.
   * @param j lightness
   * @param q brightness; ratio of lightness to white point's lightness
   * @param m colorfulness
   * @param s saturation; ratio of chroma to white point's chroma
   * @param jstar CAM16-UCS J coordinate
   * @param astar CAM16-UCS a coordinate
   * @param bstar CAM16-UCS b coordinate
   */
  constructor(hue, chroma, j, q, m, s2, jstar, astar, bstar) {
    this.hue = hue;
    this.chroma = chroma;
    this.j = j;
    this.q = q;
    this.m = m;
    this.s = s2;
    this.jstar = jstar;
    this.astar = astar;
    this.bstar = bstar;
  }
  /**
   * CAM16 instances also have coordinates in the CAM16-UCS space, called J*,
   * a*, b*, or jstar, astar, bstar in code. CAM16-UCS is included in the CAM16
   * specification, and is used to measure distances between colors.
   */
  distance(other) {
    const dJ = this.jstar - other.jstar;
    const dA = this.astar - other.astar;
    const dB = this.bstar - other.bstar;
    const dEPrime = Math.sqrt(dJ * dJ + dA * dA + dB * dB);
    const dE = 1.41 * Math.pow(dEPrime, 0.63);
    return dE;
  }
  /**
   * @param argb ARGB representation of a color.
   * @return CAM16 color, assuming the color was viewed in default viewing
   *     conditions.
   */
  static fromInt(argb) {
    return _Cam16.fromIntInViewingConditions(argb, ViewingConditions.DEFAULT);
  }
  /**
   * @param argb ARGB representation of a color.
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   * @return CAM16 color.
   */
  static fromIntInViewingConditions(argb, viewingConditions) {
    const red = (argb & 16711680) >> 16;
    const green = (argb & 65280) >> 8;
    const blue = argb & 255;
    const redL = linearized(red);
    const greenL = linearized(green);
    const blueL = linearized(blue);
    const x = 0.41233895 * redL + 0.35762064 * greenL + 0.18051042 * blueL;
    const y = 0.2126 * redL + 0.7152 * greenL + 0.0722 * blueL;
    const z = 0.01932141 * redL + 0.11916382 * greenL + 0.95034478 * blueL;
    const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
    const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
    const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
    const rD = viewingConditions.rgbD[0] * rC;
    const gD = viewingConditions.rgbD[1] * gC;
    const bD = viewingConditions.rgbD[2] * bC;
    const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
    const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
    const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
    const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
    const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
    const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    const u = (20 * rA + 20 * gA + 21 * bA) / 20;
    const p2 = (40 * rA + 20 * gA + bA) / 20;
    const atan2 = Math.atan2(b, a);
    const atanDegrees = atan2 * 180 / Math.PI;
    const hue = atanDegrees < 0 ? atanDegrees + 360 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
    const hueRadians = hue * Math.PI / 180;
    const ac = p2 * viewingConditions.nbb;
    const j = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
    const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const huePrime = hue < 20.14 ? hue + 360 : hue;
    const eHue = 0.25 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
    const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
    const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
    const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const c = alpha * Math.sqrt(j / 100);
    const m = c * viewingConditions.fLRoot;
    const s2 = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
    const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new _Cam16(hue, c, j, q, m, s2, jstar, astar, bstar);
  }
  /**
   * @param j CAM16 lightness
   * @param c CAM16 chroma
   * @param h CAM16 hue
   */
  static fromJch(j, c, h) {
    return _Cam16.fromJchInViewingConditions(j, c, h, ViewingConditions.DEFAULT);
  }
  /**
   * @param j CAM16 lightness
   * @param c CAM16 chroma
   * @param h CAM16 hue
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   */
  static fromJchInViewingConditions(j, c, h, viewingConditions) {
    const q = 4 / viewingConditions.c * Math.sqrt(j / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const m = c * viewingConditions.fLRoot;
    const alpha = c / Math.sqrt(j / 100);
    const s2 = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const hueRadians = h * Math.PI / 180;
    const jstar = (1 + 100 * 7e-3) * j / (1 + 7e-3 * j);
    const mstar = 1 / 0.0228 * Math.log(1 + 0.0228 * m);
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new _Cam16(h, c, j, q, m, s2, jstar, astar, bstar);
  }
  /**
   * @param jstar CAM16-UCS lightness.
   * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the Y axis.
   * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the X axis.
   */
  static fromUcs(jstar, astar, bstar) {
    return _Cam16.fromUcsInViewingConditions(jstar, astar, bstar, ViewingConditions.DEFAULT);
  }
  /**
   * @param jstar CAM16-UCS lightness.
   * @param astar CAM16-UCS a dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the Y axis.
   * @param bstar CAM16-UCS b dimension. Like a* in L*a*b*, it is a Cartesian
   *     coordinate on the X axis.
   * @param viewingConditions Information about the environment where the color
   *     was observed.
   */
  static fromUcsInViewingConditions(jstar, astar, bstar, viewingConditions) {
    const a = astar;
    const b = bstar;
    const m = Math.sqrt(a * a + b * b);
    const M = (Math.exp(m * 0.0228) - 1) / 0.0228;
    const c = M / viewingConditions.fLRoot;
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) {
      h += 360;
    }
    const j = jstar / (1 - (jstar - 100) * 7e-3);
    return _Cam16.fromJchInViewingConditions(j, c, h, viewingConditions);
  }
  /**
   *  @return ARGB representation of color, assuming the color was viewed in
   *     default viewing conditions, which are near-identical to the default
   *     viewing conditions for sRGB.
   */
  toInt() {
    return this.viewed(ViewingConditions.DEFAULT);
  }
  /**
   * @param viewingConditions Information about the environment where the color
   *     will be viewed.
   * @return ARGB representation of color
   */
  viewed(viewingConditions) {
    const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
    const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
    const hRad = this.hue * Math.PI / 180;
    const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
    const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const p2 = ac / viewingConditions.nbb;
    const hSin = Math.sin(hRad);
    const hCos = Math.cos(hRad);
    const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
    const a = gamma * hCos;
    const b = gamma * hSin;
    const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
    const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
    const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
    const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
    const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
    const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
    const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
    const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
    const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
    const rF = rC / viewingConditions.rgbD[0];
    const gF = gC / viewingConditions.rgbD[1];
    const bF = bC / viewingConditions.rgbD[2];
    const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
    const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
    const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
    const argb = argbFromXyz(x, y, z);
    return argb;
  }
  /// Given color expressed in XYZ and viewed in [viewingConditions], convert to
  /// CAM16.
  static fromXyzInViewingConditions(x, y, z, viewingConditions) {
    const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
    const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
    const bC = -2079e-6 * x + 0.048952 * y + 0.953127 * z;
    const rD = viewingConditions.rgbD[0] * rC;
    const gD = viewingConditions.rgbD[1] * gC;
    const bD = viewingConditions.rgbD[2] * bC;
    const rAF = Math.pow(viewingConditions.fl * Math.abs(rD) / 100, 0.42);
    const gAF = Math.pow(viewingConditions.fl * Math.abs(gD) / 100, 0.42);
    const bAF = Math.pow(viewingConditions.fl * Math.abs(bD) / 100, 0.42);
    const rA = signum(rD) * 400 * rAF / (rAF + 27.13);
    const gA = signum(gD) * 400 * gAF / (gAF + 27.13);
    const bA = signum(bD) * 400 * bAF / (bAF + 27.13);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    const u = (20 * rA + 20 * gA + 21 * bA) / 20;
    const p2 = (40 * rA + 20 * gA + bA) / 20;
    const atan2 = Math.atan2(b, a);
    const atanDegrees = atan2 * 180 / Math.PI;
    const hue = atanDegrees < 0 ? atanDegrees + 360 : atanDegrees >= 360 ? atanDegrees - 360 : atanDegrees;
    const hueRadians = hue * Math.PI / 180;
    const ac = p2 * viewingConditions.nbb;
    const J = 100 * Math.pow(ac / viewingConditions.aw, viewingConditions.c * viewingConditions.z);
    const Q = 4 / viewingConditions.c * Math.sqrt(J / 100) * (viewingConditions.aw + 4) * viewingConditions.fLRoot;
    const huePrime = hue < 20.14 ? hue + 360 : hue;
    const eHue = 1 / 4 * (Math.cos(huePrime * Math.PI / 180 + 2) + 3.8);
    const p1 = 5e4 / 13 * eHue * viewingConditions.nc * viewingConditions.ncb;
    const t = p1 * Math.sqrt(a * a + b * b) / (u + 0.305);
    const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const C = alpha * Math.sqrt(J / 100);
    const M = C * viewingConditions.fLRoot;
    const s2 = 50 * Math.sqrt(alpha * viewingConditions.c / (viewingConditions.aw + 4));
    const jstar = (1 + 100 * 7e-3) * J / (1 + 7e-3 * J);
    const mstar = Math.log(1 + 0.0228 * M) / 0.0228;
    const astar = mstar * Math.cos(hueRadians);
    const bstar = mstar * Math.sin(hueRadians);
    return new _Cam16(hue, C, J, Q, M, s2, jstar, astar, bstar);
  }
  /// XYZ representation of CAM16 seen in [viewingConditions].
  xyzInViewingConditions(viewingConditions) {
    const alpha = this.chroma === 0 || this.j === 0 ? 0 : this.chroma / Math.sqrt(this.j / 100);
    const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73), 1 / 0.9);
    const hRad = this.hue * Math.PI / 180;
    const eHue = 0.25 * (Math.cos(hRad + 2) + 3.8);
    const ac = viewingConditions.aw * Math.pow(this.j / 100, 1 / viewingConditions.c / viewingConditions.z);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const p2 = ac / viewingConditions.nbb;
    const hSin = Math.sin(hRad);
    const hCos = Math.cos(hRad);
    const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
    const a = gamma * hCos;
    const b = gamma * hSin;
    const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
    const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
    const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
    const rCBase = Math.max(0, 27.13 * Math.abs(rA) / (400 - Math.abs(rA)));
    const rC = signum(rA) * (100 / viewingConditions.fl) * Math.pow(rCBase, 1 / 0.42);
    const gCBase = Math.max(0, 27.13 * Math.abs(gA) / (400 - Math.abs(gA)));
    const gC = signum(gA) * (100 / viewingConditions.fl) * Math.pow(gCBase, 1 / 0.42);
    const bCBase = Math.max(0, 27.13 * Math.abs(bA) / (400 - Math.abs(bA)));
    const bC = signum(bA) * (100 / viewingConditions.fl) * Math.pow(bCBase, 1 / 0.42);
    const rF = rC / viewingConditions.rgbD[0];
    const gF = gC / viewingConditions.rgbD[1];
    const bF = bC / viewingConditions.rgbD[2];
    const x = 1.86206786 * rF - 1.01125463 * gF + 0.14918677 * bF;
    const y = 0.38752654 * rF + 0.62144744 * gF - 897398e-8 * bF;
    const z = -0.0158415 * rF - 0.03412294 * gF + 1.04996444 * bF;
    return [x, y, z];
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/hct/hct_solver.js
var HctSolver = class _HctSolver {
  /**
   * Sanitizes a small enough angle in radians.
   *
   * @param angle An angle in radians; must not deviate too much
   * from 0.
   * @return A coterminal angle between 0 and 2pi.
   */
  static sanitizeRadians(angle) {
    return (angle + Math.PI * 8) % (Math.PI * 2);
  }
  /**
   * Delinearizes an RGB component, returning a floating-point
   * number.
   *
   * @param rgbComponent 0.0 <= rgb_component <= 100.0, represents
   * linear R/G/B channel
   * @return 0.0 <= output <= 255.0, color channel converted to
   * regular RGB space
   */
  static trueDelinearized(rgbComponent) {
    const normalized = rgbComponent / 100;
    let delinearized2 = 0;
    if (normalized <= 31308e-7) {
      delinearized2 = normalized * 12.92;
    } else {
      delinearized2 = 1.055 * Math.pow(normalized, 1 / 2.4) - 0.055;
    }
    return delinearized2 * 255;
  }
  static chromaticAdaptation(component) {
    const af = Math.pow(Math.abs(component), 0.42);
    return signum(component) * 400 * af / (af + 27.13);
  }
  /**
   * Returns the hue of a linear RGB color in CAM16.
   *
   * @param linrgb The linear RGB coordinates of a color.
   * @return The hue of the color in CAM16, in radians.
   */
  static hueOf(linrgb) {
    const scaledDiscount = matrixMultiply(linrgb, _HctSolver.SCALED_DISCOUNT_FROM_LINRGB);
    const rA = _HctSolver.chromaticAdaptation(scaledDiscount[0]);
    const gA = _HctSolver.chromaticAdaptation(scaledDiscount[1]);
    const bA = _HctSolver.chromaticAdaptation(scaledDiscount[2]);
    const a = (11 * rA + -12 * gA + bA) / 11;
    const b = (rA + gA - 2 * bA) / 9;
    return Math.atan2(b, a);
  }
  static areInCyclicOrder(a, b, c) {
    const deltaAB = _HctSolver.sanitizeRadians(b - a);
    const deltaAC = _HctSolver.sanitizeRadians(c - a);
    return deltaAB < deltaAC;
  }
  /**
   * Solves the lerp equation.
   *
   * @param source The starting number.
   * @param mid The number in the middle.
   * @param target The ending number.
   * @return A number t such that lerp(source, target, t) = mid.
   */
  static intercept(source, mid, target) {
    return (mid - source) / (target - source);
  }
  static lerpPoint(source, t, target) {
    return [
      source[0] + (target[0] - source[0]) * t,
      source[1] + (target[1] - source[1]) * t,
      source[2] + (target[2] - source[2]) * t
    ];
  }
  /**
   * Intersects a segment with a plane.
   *
   * @param source The coordinates of point A.
   * @param coordinate The R-, G-, or B-coordinate of the plane.
   * @param target The coordinates of point B.
   * @param axis The axis the plane is perpendicular with. (0: R, 1:
   * G, 2: B)
   * @return The intersection point of the segment AB with the plane
   * R=coordinate, G=coordinate, or B=coordinate
   */
  static setCoordinate(source, coordinate, target, axis) {
    const t = _HctSolver.intercept(source[axis], coordinate, target[axis]);
    return _HctSolver.lerpPoint(source, t, target);
  }
  static isBounded(x) {
    return 0 <= x && x <= 100;
  }
  /**
   * Returns the nth possible vertex of the polygonal intersection.
   *
   * @param y The Y value of the plane.
   * @param n The zero-based index of the point. 0 <= n <= 11.
   * @return The nth possible vertex of the polygonal intersection
   * of the y plane and the RGB cube, in linear RGB coordinates, if
   * it exists. If this possible vertex lies outside of the cube,
   * [-1.0, -1.0, -1.0] is returned.
   */
  static nthVertex(y, n2) {
    const kR = _HctSolver.Y_FROM_LINRGB[0];
    const kG = _HctSolver.Y_FROM_LINRGB[1];
    const kB = _HctSolver.Y_FROM_LINRGB[2];
    const coordA = n2 % 4 <= 1 ? 0 : 100;
    const coordB = n2 % 2 === 0 ? 0 : 100;
    if (n2 < 4) {
      const g = coordA;
      const b = coordB;
      const r = (y - g * kG - b * kB) / kR;
      if (_HctSolver.isBounded(r)) {
        return [r, g, b];
      } else {
        return [-1, -1, -1];
      }
    } else if (n2 < 8) {
      const b = coordA;
      const r = coordB;
      const g = (y - r * kR - b * kB) / kG;
      if (_HctSolver.isBounded(g)) {
        return [r, g, b];
      } else {
        return [-1, -1, -1];
      }
    } else {
      const r = coordA;
      const g = coordB;
      const b = (y - r * kR - g * kG) / kB;
      if (_HctSolver.isBounded(b)) {
        return [r, g, b];
      } else {
        return [-1, -1, -1];
      }
    }
  }
  /**
   * Finds the segment containing the desired color.
   *
   * @param y The Y value of the color.
   * @param targetHue The hue of the color.
   * @return A list of two sets of linear RGB coordinates, each
   * corresponding to an endpoint of the segment containing the
   * desired color.
   */
  static bisectToSegment(y, targetHue) {
    let left = [-1, -1, -1];
    let right = left;
    let leftHue = 0;
    let rightHue = 0;
    let initialized = false;
    let uncut = true;
    for (let n2 = 0; n2 < 12; n2++) {
      const mid = _HctSolver.nthVertex(y, n2);
      if (mid[0] < 0) {
        continue;
      }
      const midHue = _HctSolver.hueOf(mid);
      if (!initialized) {
        left = mid;
        right = mid;
        leftHue = midHue;
        rightHue = midHue;
        initialized = true;
        continue;
      }
      if (uncut || _HctSolver.areInCyclicOrder(leftHue, midHue, rightHue)) {
        uncut = false;
        if (_HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
          right = mid;
          rightHue = midHue;
        } else {
          left = mid;
          leftHue = midHue;
        }
      }
    }
    return [left, right];
  }
  static midpoint(a, b) {
    return [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      (a[2] + b[2]) / 2
    ];
  }
  static criticalPlaneBelow(x) {
    return Math.floor(x - 0.5);
  }
  static criticalPlaneAbove(x) {
    return Math.ceil(x - 0.5);
  }
  /**
   * Finds a color with the given Y and hue on the boundary of the
   * cube.
   *
   * @param y The Y value of the color.
   * @param targetHue The hue of the color.
   * @return The desired color, in linear RGB coordinates.
   */
  static bisectToLimit(y, targetHue) {
    const segment = _HctSolver.bisectToSegment(y, targetHue);
    let left = segment[0];
    let leftHue = _HctSolver.hueOf(left);
    let right = segment[1];
    for (let axis = 0; axis < 3; axis++) {
      if (left[axis] !== right[axis]) {
        let lPlane = -1;
        let rPlane = 255;
        if (left[axis] < right[axis]) {
          lPlane = _HctSolver.criticalPlaneBelow(_HctSolver.trueDelinearized(left[axis]));
          rPlane = _HctSolver.criticalPlaneAbove(_HctSolver.trueDelinearized(right[axis]));
        } else {
          lPlane = _HctSolver.criticalPlaneAbove(_HctSolver.trueDelinearized(left[axis]));
          rPlane = _HctSolver.criticalPlaneBelow(_HctSolver.trueDelinearized(right[axis]));
        }
        for (let i = 0; i < 8; i++) {
          if (Math.abs(rPlane - lPlane) <= 1) {
            break;
          } else {
            const mPlane = Math.floor((lPlane + rPlane) / 2);
            const midPlaneCoordinate = _HctSolver.CRITICAL_PLANES[mPlane];
            const mid = _HctSolver.setCoordinate(left, midPlaneCoordinate, right, axis);
            const midHue = _HctSolver.hueOf(mid);
            if (_HctSolver.areInCyclicOrder(leftHue, targetHue, midHue)) {
              right = mid;
              rPlane = mPlane;
            } else {
              left = mid;
              leftHue = midHue;
              lPlane = mPlane;
            }
          }
        }
      }
    }
    return _HctSolver.midpoint(left, right);
  }
  static inverseChromaticAdaptation(adapted) {
    const adaptedAbs = Math.abs(adapted);
    const base = Math.max(0, 27.13 * adaptedAbs / (400 - adaptedAbs));
    return signum(adapted) * Math.pow(base, 1 / 0.42);
  }
  /**
   * Finds a color with the given hue, chroma, and Y.
   *
   * @param hueRadians The desired hue in radians.
   * @param chroma The desired chroma.
   * @param y The desired Y.
   * @return The desired color as a hexadecimal integer, if found; 0
   * otherwise.
   */
  static findResultByJ(hueRadians, chroma, y) {
    let j = Math.sqrt(y) * 11;
    const viewingConditions = ViewingConditions.DEFAULT;
    const tInnerCoeff = 1 / Math.pow(1.64 - Math.pow(0.29, viewingConditions.n), 0.73);
    const eHue = 0.25 * (Math.cos(hueRadians + 2) + 3.8);
    const p1 = eHue * (5e4 / 13) * viewingConditions.nc * viewingConditions.ncb;
    const hSin = Math.sin(hueRadians);
    const hCos = Math.cos(hueRadians);
    for (let iterationRound = 0; iterationRound < 5; iterationRound++) {
      const jNormalized = j / 100;
      const alpha = chroma === 0 || j === 0 ? 0 : chroma / Math.sqrt(jNormalized);
      const t = Math.pow(alpha * tInnerCoeff, 1 / 0.9);
      const ac = viewingConditions.aw * Math.pow(jNormalized, 1 / viewingConditions.c / viewingConditions.z);
      const p2 = ac / viewingConditions.nbb;
      const gamma = 23 * (p2 + 0.305) * t / (23 * p1 + 11 * t * hCos + 108 * t * hSin);
      const a = gamma * hCos;
      const b = gamma * hSin;
      const rA = (460 * p2 + 451 * a + 288 * b) / 1403;
      const gA = (460 * p2 - 891 * a - 261 * b) / 1403;
      const bA = (460 * p2 - 220 * a - 6300 * b) / 1403;
      const rCScaled = _HctSolver.inverseChromaticAdaptation(rA);
      const gCScaled = _HctSolver.inverseChromaticAdaptation(gA);
      const bCScaled = _HctSolver.inverseChromaticAdaptation(bA);
      const linrgb = matrixMultiply([rCScaled, gCScaled, bCScaled], _HctSolver.LINRGB_FROM_SCALED_DISCOUNT);
      if (linrgb[0] < 0 || linrgb[1] < 0 || linrgb[2] < 0) {
        return 0;
      }
      const kR = _HctSolver.Y_FROM_LINRGB[0];
      const kG = _HctSolver.Y_FROM_LINRGB[1];
      const kB = _HctSolver.Y_FROM_LINRGB[2];
      const fnj = kR * linrgb[0] + kG * linrgb[1] + kB * linrgb[2];
      if (fnj <= 0) {
        return 0;
      }
      if (iterationRound === 4 || Math.abs(fnj - y) < 2e-3) {
        if (linrgb[0] > 100.01 || linrgb[1] > 100.01 || linrgb[2] > 100.01) {
          return 0;
        }
        return argbFromLinrgb(linrgb);
      }
      j = j - (fnj - y) * j / (2 * fnj);
    }
    return 0;
  }
  /**
   * Finds an sRGB color with the given hue, chroma, and L*, if
   * possible.
   *
   * @param hueDegrees The desired hue, in degrees.
   * @param chroma The desired chroma.
   * @param lstar The desired L*.
   * @return A hexadecimal representing the sRGB color. The color
   * has sufficiently close hue, chroma, and L* to the desired
   * values, if possible; otherwise, the hue and L* will be
   * sufficiently close, and chroma will be maximized.
   */
  static solveToInt(hueDegrees, chroma, lstar) {
    if (chroma < 1e-4 || lstar < 1e-4 || lstar > 99.9999) {
      return argbFromLstar(lstar);
    }
    hueDegrees = sanitizeDegreesDouble(hueDegrees);
    const hueRadians = hueDegrees / 180 * Math.PI;
    const y = yFromLstar(lstar);
    const exactAnswer = _HctSolver.findResultByJ(hueRadians, chroma, y);
    if (exactAnswer !== 0) {
      return exactAnswer;
    }
    const linrgb = _HctSolver.bisectToLimit(y, hueRadians);
    return argbFromLinrgb(linrgb);
  }
  /**
   * Finds an sRGB color with the given hue, chroma, and L*, if
   * possible.
   *
   * @param hueDegrees The desired hue, in degrees.
   * @param chroma The desired chroma.
   * @param lstar The desired L*.
   * @return An CAM16 object representing the sRGB color. The color
   * has sufficiently close hue, chroma, and L* to the desired
   * values, if possible; otherwise, the hue and L* will be
   * sufficiently close, and chroma will be maximized.
   */
  static solveToCam(hueDegrees, chroma, lstar) {
    return Cam16.fromInt(_HctSolver.solveToInt(hueDegrees, chroma, lstar));
  }
};
HctSolver.SCALED_DISCOUNT_FROM_LINRGB = [
  [
    0.001200833568784504,
    0.002389694492170889,
    2795742885861124e-19
  ],
  [
    5891086651375999e-19,
    0.0029785502573438758,
    3270666104008398e-19
  ],
  [
    10146692491640572e-20,
    5364214359186694e-19,
    0.0032979401770712076
  ]
];
HctSolver.LINRGB_FROM_SCALED_DISCOUNT = [
  [
    1373.2198709594231,
    -1100.4251190754821,
    -7.278681089101213
  ],
  [
    -271.815969077903,
    559.6580465940733,
    -32.46047482791194
  ],
  [
    1.9622899599665666,
    -57.173814538844006,
    308.7233197812385
  ]
];
HctSolver.Y_FROM_LINRGB = [0.2126, 0.7152, 0.0722];
HctSolver.CRITICAL_PLANES = [
  0.015176349177441876,
  0.045529047532325624,
  0.07588174588720938,
  0.10623444424209313,
  0.13658714259697685,
  0.16693984095186062,
  0.19729253930674434,
  0.2276452376616281,
  0.2579979360165119,
  0.28835063437139563,
  0.3188300904430532,
  0.350925934958123,
  0.3848314933096426,
  0.42057480301049466,
  0.458183274052838,
  0.4976837250274023,
  0.5391024159806381,
  0.5824650784040898,
  0.6277969426914107,
  0.6751227633498623,
  0.7244668422128921,
  0.775853049866786,
  0.829304845476233,
  0.8848452951698498,
  0.942497089126609,
  1.0022825574869039,
  1.0642236851973577,
  1.1283421258858297,
  1.1946592148522128,
  1.2631959812511864,
  1.3339731595349034,
  1.407011200216447,
  1.4823302800086415,
  1.5599503113873272,
  1.6398909516233677,
  1.7221716113234105,
  1.8068114625156377,
  1.8938294463134073,
  1.9832442801866852,
  2.075074464868551,
  2.1693382909216234,
  2.2660538449872063,
  2.36523901573795,
  2.4669114995532007,
  2.5710888059345764,
  2.6777882626779785,
  2.7870270208169257,
  2.898822059350997,
  3.0131901897720907,
  3.1301480604002863,
  3.2497121605402226,
  3.3718988244681087,
  3.4967242352587946,
  3.624204428461639,
  3.754355295633311,
  3.887192587735158,
  4.022731918402185,
  4.160988767090289,
  4.301978482107941,
  4.445716283538092,
  4.592217266055746,
  4.741496401646282,
  4.893568542229298,
  5.048448422192488,
  5.20615066083972,
  5.3666897647573375,
  5.5300801301023865,
  5.696336044816294,
  5.865471690767354,
  6.037501145825082,
  6.212438385869475,
  6.390297286737924,
  6.571091626112461,
  6.7548350853498045,
  6.941541251256611,
  7.131223617812143,
  7.323895587840543,
  7.5195704746346665,
  7.7182615035334345,
  7.919981813454504,
  8.124744458384042,
  8.332562408825165,
  8.543448553206703,
  8.757415699253682,
  8.974476575321063,
  9.194643831691977,
  9.417930041841839,
  9.644347703669503,
  9.873909240696694,
  10.106627003236781,
  10.342513269534024,
  10.58158024687427,
  10.8238400726681,
  11.069304815507364,
  11.317986476196008,
  11.569896988756009,
  11.825048221409341,
  12.083451977536606,
  12.345119996613247,
  12.610063955123938,
  12.878295467455942,
  13.149826086772048,
  13.42466730586372,
  13.702830557985108,
  13.984327217668513,
  14.269168601521828,
  14.55736596900856,
  14.848930523210871,
  15.143873411576273,
  15.44220572664832,
  15.743938506781891,
  16.04908273684337,
  16.35764934889634,
  16.66964922287304,
  16.985093187232053,
  17.30399201960269,
  17.62635644741625,
  17.95219714852476,
  18.281524751807332,
  18.614349837764564,
  18.95068293910138,
  19.290534541298456,
  19.633915083172692,
  19.98083495742689,
  20.331304511189067,
  20.685334046541502,
  21.042933821039977,
  21.404114048223256,
  21.76888489811322,
  22.137256497705877,
  22.50923893145328,
  22.884842241736916,
  23.264076429332462,
  23.6469514538663,
  24.033477234264016,
  24.42366364919083,
  24.817520537484558,
  25.21505769858089,
  25.61628489293138,
  26.021211842414342,
  26.429848230738664,
  26.842203703840827,
  27.258287870275353,
  27.678110301598522,
  28.10168053274597,
  28.529008062403893,
  28.96010235337422,
  29.39497283293396,
  29.83362889318845,
  30.276079891419332,
  30.722335150426627,
  31.172403958865512,
  31.62629557157785,
  32.08401920991837,
  32.54558406207592,
  33.010999283389665,
  33.4802739966603,
  33.953417292456834,
  34.430438229418264,
  34.911345834551085,
  35.39614910352207,
  35.88485700094671,
  36.37747846067349,
  36.87402238606382,
  37.37449765026789,
  37.87891309649659,
  38.38727753828926,
  38.89959975977785,
  39.41588851594697,
  39.93615253289054,
  40.460400508064545,
  40.98864111053629,
  41.520882981230194,
  42.05713473317016,
  42.597404951718396,
  43.141702194811224,
  43.6900349931913,
  44.24241185063697,
  44.798841244188324,
  45.35933162437017,
  45.92389141541209,
  46.49252901546552,
  47.065252796817916,
  47.64207110610409,
  48.22299226451468,
  48.808024568002054,
  49.3971762874833,
  49.9904556690408,
  50.587870934119984,
  51.189430279724725,
  51.79514187861014,
  52.40501387947288,
  53.0190544071392,
  53.637271562750364,
  54.259673423945976,
  54.88626804504493,
  55.517063457223934,
  56.15206766869424,
  56.79128866487574,
  57.43473440856916,
  58.08241284012621,
  58.734331877617365,
  59.39049941699807,
  60.05092333227251,
  60.715611475655585,
  61.38457167773311,
  62.057811747619894,
  62.7353394731159,
  63.417162620860914,
  64.10328893648692,
  64.79372614476921,
  65.48848194977529,
  66.18756403501224,
  66.89098006357258,
  67.59873767827808,
  68.31084450182222,
  69.02730813691093,
  69.74813616640164,
  70.47333615344107,
  71.20291564160104,
  71.93688215501312,
  72.67524319850172,
  73.41800625771542,
  74.16517879925733,
  74.9167682708136,
  75.67278210128072,
  76.43322770089146,
  77.1981124613393,
  77.96744375590167,
  78.74122893956174,
  79.51947534912904,
  80.30219030335869,
  81.08938110306934,
  81.88105503125999,
  82.67721935322541,
  83.4778813166706,
  84.28304815182372,
  85.09272707154808,
  85.90692527145302,
  86.72564993000343,
  87.54890820862819,
  88.3767072518277,
  89.2090541872801,
  90.04595612594655,
  90.88742016217518,
  91.73345337380438,
  92.58406282226491,
  93.43925555268066,
  94.29903859396902,
  95.16341895893969,
  96.03240364439274,
  96.9059996312159,
  97.78421388448044,
  98.6670533535366,
  99.55452497210776
];

// node_modules/mdui/node_modules/@material/material-color-utilities/hct/hct.js
var Hct = class _Hct {
  static from(hue, chroma, tone) {
    return new _Hct(HctSolver.solveToInt(hue, chroma, tone));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return HCT representation of a color in default viewing conditions
   */
  static fromInt(argb) {
    return new _Hct(argb);
  }
  toInt() {
    return this.argb;
  }
  /**
   * A number, in degrees, representing ex. red, orange, yellow, etc.
   * Ranges from 0 <= hue < 360.
   */
  get hue() {
    return this.internalHue;
  }
  /**
   * @param newHue 0 <= newHue < 360; invalid values are corrected.
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set hue(newHue) {
    this.setInternalState(HctSolver.solveToInt(newHue, this.internalChroma, this.internalTone));
  }
  get chroma() {
    return this.internalChroma;
  }
  /**
   * @param newChroma 0 <= newChroma < ?
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set chroma(newChroma) {
    this.setInternalState(HctSolver.solveToInt(this.internalHue, newChroma, this.internalTone));
  }
  /** Lightness. Ranges from 0 to 100. */
  get tone() {
    return this.internalTone;
  }
  /**
   * @param newTone 0 <= newTone <= 100; invalid valids are corrected.
   * Chroma may decrease because chroma has a different maximum for any given
   * hue and tone.
   */
  set tone(newTone) {
    this.setInternalState(HctSolver.solveToInt(this.internalHue, this.internalChroma, newTone));
  }
  constructor(argb) {
    this.argb = argb;
    const cam = Cam16.fromInt(argb);
    this.internalHue = cam.hue;
    this.internalChroma = cam.chroma;
    this.internalTone = lstarFromArgb(argb);
    this.argb = argb;
  }
  setInternalState(argb) {
    const cam = Cam16.fromInt(argb);
    this.internalHue = cam.hue;
    this.internalChroma = cam.chroma;
    this.internalTone = lstarFromArgb(argb);
    this.argb = argb;
  }
  /**
   * Translates a color into different [ViewingConditions].
   *
   * Colors change appearance. They look different with lights on versus off,
   * the same color, as in hex code, on white looks different when on black.
   * This is called color relativity, most famously explicated by Josef Albers
   * in Interaction of Color.
   *
   * In color science, color appearance models can account for this and
   * calculate the appearance of a color in different settings. HCT is based on
   * CAM16, a color appearance model, and uses it to make these calculations.
   *
   * See [ViewingConditions.make] for parameters affecting color appearance.
   */
  inViewingConditions(vc) {
    const cam = Cam16.fromInt(this.toInt());
    const viewedInVc = cam.xyzInViewingConditions(vc);
    const recastInVc = Cam16.fromXyzInViewingConditions(viewedInVc[0], viewedInVc[1], viewedInVc[2], ViewingConditions.make());
    const recastHct = _Hct.from(recastInVc.hue, recastInVc.chroma, lstarFromY(viewedInVc[1]));
    return recastHct;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/blend/blend.js
var Blend = class _Blend {
  /**
   * Blend the design color's HCT hue towards the key color's HCT
   * hue, in a way that leaves the original color recognizable and
   * recognizably shifted towards the key color.
   *
   * @param designColor ARGB representation of an arbitrary color.
   * @param sourceColor ARGB representation of the main theme color.
   * @return The design color with a hue shifted towards the
   * system's color, a slightly warmer/cooler variant of the design
   * color's hue.
   */
  static harmonize(designColor, sourceColor) {
    const fromHct = Hct.fromInt(designColor);
    const toHct = Hct.fromInt(sourceColor);
    const differenceDegrees2 = differenceDegrees(fromHct.hue, toHct.hue);
    const rotationDegrees = Math.min(differenceDegrees2 * 0.5, 15);
    const outputHue = sanitizeDegreesDouble(fromHct.hue + rotationDegrees * rotationDirection(fromHct.hue, toHct.hue));
    return Hct.from(outputHue, fromHct.chroma, fromHct.tone).toInt();
  }
  /**
   * Blends hue from one color into another. The chroma and tone of
   * the original color are maintained.
   *
   * @param from ARGB representation of color
   * @param to ARGB representation of color
   * @param amount how much blending to perform; 0.0 >= and <= 1.0
   * @return from, with a hue blended towards to. Chroma and tone
   * are constant.
   */
  static hctHue(from, to, amount) {
    const ucs = _Blend.cam16Ucs(from, to, amount);
    const ucsCam = Cam16.fromInt(ucs);
    const fromCam = Cam16.fromInt(from);
    const blended = Hct.from(ucsCam.hue, fromCam.chroma, lstarFromArgb(from));
    return blended.toInt();
  }
  /**
   * Blend in CAM16-UCS space.
   *
   * @param from ARGB representation of color
   * @param to ARGB representation of color
   * @param amount how much blending to perform; 0.0 >= and <= 1.0
   * @return from, blended towards to. Hue, chroma, and tone will
   * change.
   */
  static cam16Ucs(from, to, amount) {
    const fromCam = Cam16.fromInt(from);
    const toCam = Cam16.fromInt(to);
    const fromJ = fromCam.jstar;
    const fromA = fromCam.astar;
    const fromB = fromCam.bstar;
    const toJ = toCam.jstar;
    const toA = toCam.astar;
    const toB = toCam.bstar;
    const jstar = fromJ + (toJ - fromJ) * amount;
    const astar = fromA + (toA - fromA) * amount;
    const bstar = fromB + (toB - fromB) * amount;
    return Cam16.fromUcs(jstar, astar, bstar).toInt();
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/contrast/contrast.js
var Contrast = class _Contrast {
  /**
   * Returns a contrast ratio, which ranges from 1 to 21.
   *
   * @param toneA Tone between 0 and 100. Values outside will be clamped.
   * @param toneB Tone between 0 and 100. Values outside will be clamped.
   */
  static ratioOfTones(toneA, toneB) {
    toneA = clampDouble(0, 100, toneA);
    toneB = clampDouble(0, 100, toneB);
    return _Contrast.ratioOfYs(yFromLstar(toneA), yFromLstar(toneB));
  }
  static ratioOfYs(y1, y2) {
    const lighter = y1 > y2 ? y1 : y2;
    const darker = lighter === y2 ? y1 : y2;
    return (lighter + 5) / (darker + 5);
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns -1 if ratio cannot be achieved with tone parameter.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in -1 being returned.
   * @param ratio Contrast ratio of return value and tone.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static lighter(tone, ratio) {
    if (tone < 0 || tone > 100) {
      return -1;
    }
    const darkY = yFromLstar(tone);
    const lightY = ratio * (darkY + 5) - 5;
    const realContrast = _Contrast.ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) {
      return -1;
    }
    const returnValue = lstarFromY(lightY) + 0.4;
    if (returnValue < 0 || returnValue > 100) {
      return -1;
    }
    return returnValue;
  }
  /**
   * Returns a tone <= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns -1 if ratio cannot be achieved with tone parameter.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in -1 being returned.
   * @param ratio Contrast ratio of return value and tone.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static darker(tone, ratio) {
    if (tone < 0 || tone > 100) {
      return -1;
    }
    const lightY = yFromLstar(tone);
    const darkY = (lightY + 5) / ratio - 5;
    const realContrast = _Contrast.ratioOfYs(lightY, darkY);
    const delta = Math.abs(realContrast - ratio);
    if (realContrast < ratio && delta > 0.04) {
      return -1;
    }
    const returnValue = lstarFromY(darkY) - 0.4;
    if (returnValue < 0 || returnValue > 100) {
      return -1;
    }
    return returnValue;
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns 100 if ratio cannot be achieved with tone parameter.
   *
   * This method is unsafe because the returned value is guaranteed to be in
   * bounds for tone, i.e. between 0 and 100. However, that value may not reach
   * the ratio with tone. For example, there is no color lighter than T100.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in 100 being returned.
   * @param ratio Desired contrast ratio of return value and tone parameter.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static lighterUnsafe(tone, ratio) {
    const lighterSafe = _Contrast.lighter(tone, ratio);
    return lighterSafe < 0 ? 100 : lighterSafe;
  }
  /**
   * Returns a tone >= tone parameter that ensures ratio parameter.
   * Return value is between 0 and 100.
   * Returns 100 if ratio cannot be achieved with tone parameter.
   *
   * This method is unsafe because the returned value is guaranteed to be in
   * bounds for tone, i.e. between 0 and 100. However, that value may not reach
   * the [ratio with [tone]. For example, there is no color darker than T0.
   *
   * @param tone Tone return value must contrast with.
   * Range is 0 to 100. Invalid values will result in 0 being returned.
   * @param ratio Desired contrast ratio of return value and tone parameter.
   * Range is 1 to 21, invalid values have undefined behavior.
   */
  static darkerUnsafe(tone, ratio) {
    const darkerSafe = _Contrast.darker(tone, ratio);
    return darkerSafe < 0 ? 0 : darkerSafe;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/dislike/dislike_analyzer.js
var DislikeAnalyzer = class _DislikeAnalyzer {
  /**
   * Returns true if a color is disliked.
   *
   * @param hct A color to be judged.
   * @return Whether the color is disliked.
   *
   * Disliked is defined as a dark yellow-green that is not neutral.
   */
  static isDisliked(hct) {
    const huePasses = Math.round(hct.hue) >= 90 && Math.round(hct.hue) <= 111;
    const chromaPasses = Math.round(hct.chroma) > 16;
    const tonePasses = Math.round(hct.tone) < 65;
    return huePasses && chromaPasses && tonePasses;
  }
  /**
   * If a color is disliked, lighten it to make it likable.
   *
   * @param hct A color to be judged.
   * @return A new color if the original color is disliked, or the original
   *   color if it is acceptable.
   */
  static fixIfDisliked(hct) {
    if (_DislikeAnalyzer.isDisliked(hct)) {
      return Hct.from(hct.hue, hct.chroma, 70);
    }
    return hct;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/dynamic_color.js
var DynamicColor = class _DynamicColor {
  /**
   * Create a DynamicColor defined by a TonalPalette and HCT tone.
   *
   * @param args Functions with DynamicScheme as input. Must provide a palette
   * and tone. May provide a background DynamicColor and ToneDeltaConstraint.
   */
  static fromPalette(args) {
    return new _DynamicColor(args.name ?? "", args.palette, args.tone, args.isBackground ?? false, args.background, args.secondBackground, args.contrastCurve, args.toneDeltaPair);
  }
  /**
   * The base constructor for DynamicColor.
   *
   * _Strongly_ prefer using one of the convenience constructors. This class is
   * arguably too flexible to ensure it can support any scenario. Functional
   * arguments allow  overriding without risks that come with subclasses.
   *
   * For example, the default behavior of adjust tone at max contrast
   * to be at a 7.0 ratio with its background is principled and
   * matches accessibility guidance. That does not mean it's the desired
   * approach for _every_ design system, and every color pairing,
   * always, in every case.
   *
   * @param name The name of the dynamic color. Defaults to empty.
   * @param palette Function that provides a TonalPalette given
   * DynamicScheme. A TonalPalette is defined by a hue and chroma, so this
   * replaces the need to specify hue/chroma. By providing a tonal palette, when
   * contrast adjustments are made, intended chroma can be preserved.
   * @param tone Function that provides a tone, given a DynamicScheme.
   * @param isBackground Whether this dynamic color is a background, with
   * some other color as the foreground. Defaults to false.
   * @param background The background of the dynamic color (as a function of a
   *     `DynamicScheme`), if it exists.
   * @param secondBackground A second background of the dynamic color (as a
   *     function of a `DynamicScheme`), if it
   * exists.
   * @param contrastCurve A `ContrastCurve` object specifying how its contrast
   * against its background should behave in various contrast levels options.
   * @param toneDeltaPair A `ToneDeltaPair` object specifying a tone delta
   * constraint between two colors. One of them must be the color being
   * constructed.
   */
  constructor(name, palette, tone, isBackground, background, secondBackground, contrastCurve, toneDeltaPair) {
    this.name = name;
    this.palette = palette;
    this.tone = tone;
    this.isBackground = isBackground;
    this.background = background;
    this.secondBackground = secondBackground;
    this.contrastCurve = contrastCurve;
    this.toneDeltaPair = toneDeltaPair;
    this.hctCache = /* @__PURE__ */ new Map();
    if (!background && secondBackground) {
      throw new Error(`Color ${name} has secondBackgrounddefined, but background is not defined.`);
    }
    if (!background && contrastCurve) {
      throw new Error(`Color ${name} has contrastCurvedefined, but background is not defined.`);
    }
    if (background && !contrastCurve) {
      throw new Error(`Color ${name} has backgrounddefined, but contrastCurve is not defined.`);
    }
  }
  /**
   * Return a ARGB integer (i.e. a hex code).
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getArgb(scheme) {
    return this.getHct(scheme).toInt();
  }
  /**
   * Return a color, expressed in the HCT color space, that this
   * DynamicColor is under the conditions in scheme.
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getHct(scheme) {
    const cachedAnswer = this.hctCache.get(scheme);
    if (cachedAnswer != null) {
      return cachedAnswer;
    }
    const tone = this.getTone(scheme);
    const answer = this.palette(scheme).getHct(tone);
    if (this.hctCache.size > 4) {
      this.hctCache.clear();
    }
    this.hctCache.set(scheme, answer);
    return answer;
  }
  /**
   * Return a tone, T in the HCT color space, that this DynamicColor is under
   * the conditions in scheme.
   *
   * @param scheme Defines the conditions of the user interface, for example,
   * whether or not it is dark mode or light mode, and what the desired
   * contrast level is.
   */
  getTone(scheme) {
    const decreasingContrast = scheme.contrastLevel < 0;
    if (this.toneDeltaPair) {
      const toneDeltaPair = this.toneDeltaPair(scheme);
      const roleA = toneDeltaPair.roleA;
      const roleB = toneDeltaPair.roleB;
      const delta = toneDeltaPair.delta;
      const polarity = toneDeltaPair.polarity;
      const stayTogether = toneDeltaPair.stayTogether;
      const bg = this.background(scheme);
      const bgTone = bg.getTone(scheme);
      const aIsNearer = polarity === "nearer" || polarity === "lighter" && !scheme.isDark || polarity === "darker" && scheme.isDark;
      const nearer = aIsNearer ? roleA : roleB;
      const farther = aIsNearer ? roleB : roleA;
      const amNearer = this.name === nearer.name;
      const expansionDir = scheme.isDark ? 1 : -1;
      const nContrast = nearer.contrastCurve.get(scheme.contrastLevel);
      const fContrast = farther.contrastCurve.get(scheme.contrastLevel);
      const nInitialTone = nearer.tone(scheme);
      let nTone = Contrast.ratioOfTones(bgTone, nInitialTone) >= nContrast ? nInitialTone : _DynamicColor.foregroundTone(bgTone, nContrast);
      const fInitialTone = farther.tone(scheme);
      let fTone = Contrast.ratioOfTones(bgTone, fInitialTone) >= fContrast ? fInitialTone : _DynamicColor.foregroundTone(bgTone, fContrast);
      if (decreasingContrast) {
        nTone = _DynamicColor.foregroundTone(bgTone, nContrast);
        fTone = _DynamicColor.foregroundTone(bgTone, fContrast);
      }
      if ((fTone - nTone) * expansionDir >= delta) {
      } else {
        fTone = clampDouble(0, 100, nTone + delta * expansionDir);
        if ((fTone - nTone) * expansionDir >= delta) {
        } else {
          nTone = clampDouble(0, 100, fTone - delta * expansionDir);
        }
      }
      if (50 <= nTone && nTone < 60) {
        if (expansionDir > 0) {
          nTone = 60;
          fTone = Math.max(fTone, nTone + delta * expansionDir);
        } else {
          nTone = 49;
          fTone = Math.min(fTone, nTone + delta * expansionDir);
        }
      } else if (50 <= fTone && fTone < 60) {
        if (stayTogether) {
          if (expansionDir > 0) {
            nTone = 60;
            fTone = Math.max(fTone, nTone + delta * expansionDir);
          } else {
            nTone = 49;
            fTone = Math.min(fTone, nTone + delta * expansionDir);
          }
        } else {
          if (expansionDir > 0) {
            fTone = 60;
          } else {
            fTone = 49;
          }
        }
      }
      return amNearer ? nTone : fTone;
    } else {
      let answer = this.tone(scheme);
      if (this.background == null) {
        return answer;
      }
      const bgTone = this.background(scheme).getTone(scheme);
      const desiredRatio = this.contrastCurve.get(scheme.contrastLevel);
      if (Contrast.ratioOfTones(bgTone, answer) >= desiredRatio) {
      } else {
        answer = _DynamicColor.foregroundTone(bgTone, desiredRatio);
      }
      if (decreasingContrast) {
        answer = _DynamicColor.foregroundTone(bgTone, desiredRatio);
      }
      if (this.isBackground && 50 <= answer && answer < 60) {
        if (Contrast.ratioOfTones(49, bgTone) >= desiredRatio) {
          answer = 49;
        } else {
          answer = 60;
        }
      }
      if (this.secondBackground) {
        const [bg1, bg2] = [this.background, this.secondBackground];
        const [bgTone1, bgTone2] = [bg1(scheme).getTone(scheme), bg2(scheme).getTone(scheme)];
        const [upper, lower] = [Math.max(bgTone1, bgTone2), Math.min(bgTone1, bgTone2)];
        if (Contrast.ratioOfTones(upper, answer) >= desiredRatio && Contrast.ratioOfTones(lower, answer) >= desiredRatio) {
          return answer;
        }
        const lightOption = Contrast.lighter(upper, desiredRatio);
        const darkOption = Contrast.darker(lower, desiredRatio);
        const availables = [];
        if (lightOption !== -1)
          availables.push(lightOption);
        if (darkOption !== -1)
          availables.push(darkOption);
        const prefersLight = _DynamicColor.tonePrefersLightForeground(bgTone1) || _DynamicColor.tonePrefersLightForeground(bgTone2);
        if (prefersLight) {
          return lightOption < 0 ? 100 : lightOption;
        }
        if (availables.length === 1) {
          return availables[0];
        }
        return darkOption < 0 ? 0 : darkOption;
      }
      return answer;
    }
  }
  /**
   * Given a background tone, find a foreground tone, while ensuring they reach
   * a contrast ratio that is as close to [ratio] as possible.
   *
   * @param bgTone Tone in HCT. Range is 0 to 100, undefined behavior when it
   *     falls outside that range.
   * @param ratio The contrast ratio desired between bgTone and the return
   *     value.
   */
  static foregroundTone(bgTone, ratio) {
    const lighterTone = Contrast.lighterUnsafe(bgTone, ratio);
    const darkerTone = Contrast.darkerUnsafe(bgTone, ratio);
    const lighterRatio = Contrast.ratioOfTones(lighterTone, bgTone);
    const darkerRatio = Contrast.ratioOfTones(darkerTone, bgTone);
    const preferLighter = _DynamicColor.tonePrefersLightForeground(bgTone);
    if (preferLighter) {
      const negligibleDifference = Math.abs(lighterRatio - darkerRatio) < 0.1 && lighterRatio < ratio && darkerRatio < ratio;
      return lighterRatio >= ratio || lighterRatio >= darkerRatio || negligibleDifference ? lighterTone : darkerTone;
    } else {
      return darkerRatio >= ratio || darkerRatio >= lighterRatio ? darkerTone : lighterTone;
    }
  }
  /**
   * Returns whether [tone] prefers a light foreground.
   *
   * People prefer white foregrounds on ~T60-70. Observed over time, and also
   * by Andrew Somers during research for APCA.
   *
   * T60 used as to create the smallest discontinuity possible when skipping
   * down to T49 in order to ensure light foregrounds.
   * Since `tertiaryContainer` in dark monochrome scheme requires a tone of
   * 60, it should not be adjusted. Therefore, 60 is excluded here.
   */
  static tonePrefersLightForeground(tone) {
    return Math.round(tone) < 60;
  }
  /**
   * Returns whether [tone] can reach a contrast ratio of 4.5 with a lighter
   * color.
   */
  static toneAllowsLightForeground(tone) {
    return Math.round(tone) <= 49;
  }
  /**
   * Adjust a tone such that white has 4.5 contrast, if the tone is
   * reasonably close to supporting it.
   */
  static enableLightForeground(tone) {
    if (_DynamicColor.tonePrefersLightForeground(tone) && !_DynamicColor.toneAllowsLightForeground(tone)) {
      return 49;
    }
    return tone;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/palettes/tonal_palette.js
var TonalPalette = class _TonalPalette {
  /**
   * @param argb ARGB representation of a color
   * @return Tones matching that color's hue and chroma.
   */
  static fromInt(argb) {
    const hct = Hct.fromInt(argb);
    return _TonalPalette.fromHct(hct);
  }
  /**
   * @param hct Hct
   * @return Tones matching that color's hue and chroma.
   */
  static fromHct(hct) {
    return new _TonalPalette(hct.hue, hct.chroma, hct);
  }
  /**
   * @param hue HCT hue
   * @param chroma HCT chroma
   * @return Tones matching hue and chroma.
   */
  static fromHueAndChroma(hue, chroma) {
    const keyColor = new KeyColor(hue, chroma).create();
    return new _TonalPalette(hue, chroma, keyColor);
  }
  constructor(hue, chroma, keyColor) {
    this.hue = hue;
    this.chroma = chroma;
    this.keyColor = keyColor;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * @param tone HCT tone, measured from 0 to 100.
   * @return ARGB representation of a color with that tone.
   */
  tone(tone) {
    let argb = this.cache.get(tone);
    if (argb === void 0) {
      argb = Hct.from(this.hue, this.chroma, tone).toInt();
      this.cache.set(tone, argb);
    }
    return argb;
  }
  /**
   * @param tone HCT tone.
   * @return HCT representation of a color with that tone.
   */
  getHct(tone) {
    return Hct.fromInt(this.tone(tone));
  }
};
var KeyColor = class {
  constructor(hue, requestedChroma) {
    this.hue = hue;
    this.requestedChroma = requestedChroma;
    this.chromaCache = /* @__PURE__ */ new Map();
    this.maxChromaValue = 200;
  }
  /**
   * Creates a key color from a [hue] and a [chroma].
   * The key color is the first tone, starting from T50, matching the given hue
   * and chroma.
   *
   * @return Key color [Hct]
   */
  create() {
    const pivotTone = 50;
    const toneStepSize = 1;
    const epsilon = 0.01;
    let lowerTone = 0;
    let upperTone = 100;
    while (lowerTone < upperTone) {
      const midTone = Math.floor((lowerTone + upperTone) / 2);
      const isAscending = this.maxChroma(midTone) < this.maxChroma(midTone + toneStepSize);
      const sufficientChroma = this.maxChroma(midTone) >= this.requestedChroma - epsilon;
      if (sufficientChroma) {
        if (Math.abs(lowerTone - pivotTone) < Math.abs(upperTone - pivotTone)) {
          upperTone = midTone;
        } else {
          if (lowerTone === midTone) {
            return Hct.from(this.hue, this.requestedChroma, lowerTone);
          }
          lowerTone = midTone;
        }
      } else {
        if (isAscending) {
          lowerTone = midTone + toneStepSize;
        } else {
          upperTone = midTone;
        }
      }
    }
    return Hct.from(this.hue, this.requestedChroma, lowerTone);
  }
  // Find the maximum chroma for a given tone
  maxChroma(tone) {
    if (this.chromaCache.has(tone)) {
      return this.chromaCache.get(tone);
    }
    const chroma = Hct.from(this.hue, this.maxChromaValue, tone).chroma;
    this.chromaCache.set(tone, chroma);
    return chroma;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/contrast_curve.js
var ContrastCurve = class {
  /**
   * Creates a `ContrastCurve` object.
   *
   * @param low Value for contrast level -1.0
   * @param normal Value for contrast level 0.0
   * @param medium Value for contrast level 0.5
   * @param high Value for contrast level 1.0
   */
  constructor(low, normal, medium, high) {
    this.low = low;
    this.normal = normal;
    this.medium = medium;
    this.high = high;
  }
  /**
   * Returns the value at a given contrast level.
   *
   * @param contrastLevel The contrast level. 0.0 is the default (normal); -1.0
   *     is the lowest; 1.0 is the highest.
   * @return The value. For contrast ratios, a number between 1.0 and 21.0.
   */
  get(contrastLevel) {
    if (contrastLevel <= -1) {
      return this.low;
    } else if (contrastLevel < 0) {
      return lerp(this.low, this.normal, (contrastLevel - -1) / 1);
    } else if (contrastLevel < 0.5) {
      return lerp(this.normal, this.medium, (contrastLevel - 0) / 0.5);
    } else if (contrastLevel < 1) {
      return lerp(this.medium, this.high, (contrastLevel - 0.5) / 0.5);
    } else {
      return this.high;
    }
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/tone_delta_pair.js
var ToneDeltaPair = class {
  /**
   * Documents a constraint in tone distance between two DynamicColors.
   *
   * The polarity is an adjective that describes "A", compared to "B".
   *
   * For instance, ToneDeltaPair(A, B, 15, 'darker', stayTogether) states that
   * A's tone should be at least 15 darker than B's.
   *
   * 'nearer' and 'farther' describes closeness to the surface roles. For
   * instance, ToneDeltaPair(A, B, 10, 'nearer', stayTogether) states that A
   * should be 10 lighter than B in light mode, and 10 darker than B in dark
   * mode.
   *
   * @param roleA The first role in a pair.
   * @param roleB The second role in a pair.
   * @param delta Required difference between tones. Absolute value, negative
   * values have undefined behavior.
   * @param polarity The relative relation between tones of roleA and roleB,
   * as described above.
   * @param stayTogether Whether these two roles should stay on the same side of
   * the "awkward zone" (T50-59). This is necessary for certain cases where
   * one role has two backgrounds.
   */
  constructor(roleA, roleB, delta, polarity, stayTogether) {
    this.roleA = roleA;
    this.roleB = roleB;
    this.delta = delta;
    this.polarity = polarity;
    this.stayTogether = stayTogether;
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/variant.js
var Variant;
(function(Variant2) {
  Variant2[Variant2["MONOCHROME"] = 0] = "MONOCHROME";
  Variant2[Variant2["NEUTRAL"] = 1] = "NEUTRAL";
  Variant2[Variant2["TONAL_SPOT"] = 2] = "TONAL_SPOT";
  Variant2[Variant2["VIBRANT"] = 3] = "VIBRANT";
  Variant2[Variant2["EXPRESSIVE"] = 4] = "EXPRESSIVE";
  Variant2[Variant2["FIDELITY"] = 5] = "FIDELITY";
  Variant2[Variant2["CONTENT"] = 6] = "CONTENT";
  Variant2[Variant2["RAINBOW"] = 7] = "RAINBOW";
  Variant2[Variant2["FRUIT_SALAD"] = 8] = "FRUIT_SALAD";
})(Variant || (Variant = {}));

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/material_dynamic_colors.js
function isFidelity(scheme) {
  return scheme.variant === Variant.FIDELITY || scheme.variant === Variant.CONTENT;
}
function isMonochrome(scheme) {
  return scheme.variant === Variant.MONOCHROME;
}
function findDesiredChromaByTone(hue, chroma, tone, byDecreasingTone) {
  let answer = tone;
  let closestToChroma = Hct.from(hue, chroma, tone);
  if (closestToChroma.chroma < chroma) {
    let chromaPeak = closestToChroma.chroma;
    while (closestToChroma.chroma < chroma) {
      answer += byDecreasingTone ? -1 : 1;
      const potentialSolution = Hct.from(hue, chroma, answer);
      if (chromaPeak > potentialSolution.chroma) {
        break;
      }
      if (Math.abs(potentialSolution.chroma - chroma) < 0.4) {
        break;
      }
      const potentialDelta = Math.abs(potentialSolution.chroma - chroma);
      const currentDelta = Math.abs(closestToChroma.chroma - chroma);
      if (potentialDelta < currentDelta) {
        closestToChroma = potentialSolution;
      }
      chromaPeak = Math.max(chromaPeak, potentialSolution.chroma);
    }
  }
  return answer;
}
var MaterialDynamicColors = class _MaterialDynamicColors {
  static highestSurface(s2) {
    return s2.isDark ? _MaterialDynamicColors.surfaceBright : _MaterialDynamicColors.surfaceDim;
  }
};
MaterialDynamicColors.contentAccentToneDelta = 15;
MaterialDynamicColors.primaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "primary_palette_key_color",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => s2.primaryPalette.keyColor.tone
});
MaterialDynamicColors.secondaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "secondary_palette_key_color",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => s2.secondaryPalette.keyColor.tone
});
MaterialDynamicColors.tertiaryPaletteKeyColor = DynamicColor.fromPalette({
  name: "tertiary_palette_key_color",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => s2.tertiaryPalette.keyColor.tone
});
MaterialDynamicColors.neutralPaletteKeyColor = DynamicColor.fromPalette({
  name: "neutral_palette_key_color",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.neutralPalette.keyColor.tone
});
MaterialDynamicColors.neutralVariantPaletteKeyColor = DynamicColor.fromPalette({
  name: "neutral_variant_palette_key_color",
  palette: (s2) => s2.neutralVariantPalette,
  tone: (s2) => s2.neutralVariantPalette.keyColor.tone
});
MaterialDynamicColors.background = DynamicColor.fromPalette({
  name: "background",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 6 : 98,
  isBackground: true
});
MaterialDynamicColors.onBackground = DynamicColor.fromPalette({
  name: "on_background",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 90 : 10,
  background: (s2) => MaterialDynamicColors.background,
  contrastCurve: new ContrastCurve(3, 3, 4.5, 7)
});
MaterialDynamicColors.surface = DynamicColor.fromPalette({
  name: "surface",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 6 : 98,
  isBackground: true
});
MaterialDynamicColors.surfaceDim = DynamicColor.fromPalette({
  name: "surface_dim",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 6 : new ContrastCurve(87, 87, 80, 75).get(s2.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceBright = DynamicColor.fromPalette({
  name: "surface_bright",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(24, 24, 29, 34).get(s2.contrastLevel) : 98,
  isBackground: true
});
MaterialDynamicColors.surfaceContainerLowest = DynamicColor.fromPalette({
  name: "surface_container_lowest",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(4, 4, 2, 0).get(s2.contrastLevel) : 100,
  isBackground: true
});
MaterialDynamicColors.surfaceContainerLow = DynamicColor.fromPalette({
  name: "surface_container_low",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(10, 10, 11, 12).get(s2.contrastLevel) : new ContrastCurve(96, 96, 96, 95).get(s2.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainer = DynamicColor.fromPalette({
  name: "surface_container",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(12, 12, 16, 20).get(s2.contrastLevel) : new ContrastCurve(94, 94, 92, 90).get(s2.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainerHigh = DynamicColor.fromPalette({
  name: "surface_container_high",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(17, 17, 21, 25).get(s2.contrastLevel) : new ContrastCurve(92, 92, 88, 85).get(s2.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.surfaceContainerHighest = DynamicColor.fromPalette({
  name: "surface_container_highest",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? new ContrastCurve(22, 22, 26, 30).get(s2.contrastLevel) : new ContrastCurve(90, 90, 84, 80).get(s2.contrastLevel),
  isBackground: true
});
MaterialDynamicColors.onSurface = DynamicColor.fromPalette({
  name: "on_surface",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 90 : 10,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.surfaceVariant = DynamicColor.fromPalette({
  name: "surface_variant",
  palette: (s2) => s2.neutralVariantPalette,
  tone: (s2) => s2.isDark ? 30 : 90,
  isBackground: true
});
MaterialDynamicColors.onSurfaceVariant = DynamicColor.fromPalette({
  name: "on_surface_variant",
  palette: (s2) => s2.neutralVariantPalette,
  tone: (s2) => s2.isDark ? 80 : 30,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.inverseSurface = DynamicColor.fromPalette({
  name: "inverse_surface",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 90 : 20
});
MaterialDynamicColors.inverseOnSurface = DynamicColor.fromPalette({
  name: "inverse_on_surface",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => s2.isDark ? 20 : 95,
  background: (s2) => MaterialDynamicColors.inverseSurface,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.outline = DynamicColor.fromPalette({
  name: "outline",
  palette: (s2) => s2.neutralVariantPalette,
  tone: (s2) => s2.isDark ? 60 : 50,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1.5, 3, 4.5, 7)
});
MaterialDynamicColors.outlineVariant = DynamicColor.fromPalette({
  name: "outline_variant",
  palette: (s2) => s2.neutralVariantPalette,
  tone: (s2) => s2.isDark ? 30 : 80,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5)
});
MaterialDynamicColors.shadow = DynamicColor.fromPalette({
  name: "shadow",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => 0
});
MaterialDynamicColors.scrim = DynamicColor.fromPalette({
  name: "scrim",
  palette: (s2) => s2.neutralPalette,
  tone: (s2) => 0
});
MaterialDynamicColors.surfaceTint = DynamicColor.fromPalette({
  name: "surface_tint",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => s2.isDark ? 80 : 40,
  isBackground: true
});
MaterialDynamicColors.primary = DynamicColor.fromPalette({
  name: "primary",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 100 : 0;
    }
    return s2.isDark ? 80 : 40;
  },
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.primaryContainer, MaterialDynamicColors.primary, 10, "nearer", false)
});
MaterialDynamicColors.onPrimary = DynamicColor.fromPalette({
  name: "on_primary",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 10 : 90;
    }
    return s2.isDark ? 20 : 100;
  },
  background: (s2) => MaterialDynamicColors.primary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.primaryContainer = DynamicColor.fromPalette({
  name: "primary_container",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => {
    if (isFidelity(s2)) {
      return s2.sourceColorHct.tone;
    }
    if (isMonochrome(s2)) {
      return s2.isDark ? 85 : 25;
    }
    return s2.isDark ? 30 : 90;
  },
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.primaryContainer, MaterialDynamicColors.primary, 10, "nearer", false)
});
MaterialDynamicColors.onPrimaryContainer = DynamicColor.fromPalette({
  name: "on_primary_container",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => {
    if (isFidelity(s2)) {
      return DynamicColor.foregroundTone(MaterialDynamicColors.primaryContainer.tone(s2), 4.5);
    }
    if (isMonochrome(s2)) {
      return s2.isDark ? 0 : 100;
    }
    return s2.isDark ? 90 : 30;
  },
  background: (s2) => MaterialDynamicColors.primaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.inversePrimary = DynamicColor.fromPalette({
  name: "inverse_primary",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => s2.isDark ? 40 : 80,
  background: (s2) => MaterialDynamicColors.inverseSurface,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7)
});
MaterialDynamicColors.secondary = DynamicColor.fromPalette({
  name: "secondary",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => s2.isDark ? 80 : 40,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.secondaryContainer, MaterialDynamicColors.secondary, 10, "nearer", false)
});
MaterialDynamicColors.onSecondary = DynamicColor.fromPalette({
  name: "on_secondary",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 10 : 100;
    } else {
      return s2.isDark ? 20 : 100;
    }
  },
  background: (s2) => MaterialDynamicColors.secondary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.secondaryContainer = DynamicColor.fromPalette({
  name: "secondary_container",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => {
    const initialTone = s2.isDark ? 30 : 90;
    if (isMonochrome(s2)) {
      return s2.isDark ? 30 : 85;
    }
    if (!isFidelity(s2)) {
      return initialTone;
    }
    return findDesiredChromaByTone(s2.secondaryPalette.hue, s2.secondaryPalette.chroma, initialTone, s2.isDark ? false : true);
  },
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.secondaryContainer, MaterialDynamicColors.secondary, 10, "nearer", false)
});
MaterialDynamicColors.onSecondaryContainer = DynamicColor.fromPalette({
  name: "on_secondary_container",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 90 : 10;
    }
    if (!isFidelity(s2)) {
      return s2.isDark ? 90 : 30;
    }
    return DynamicColor.foregroundTone(MaterialDynamicColors.secondaryContainer.tone(s2), 4.5);
  },
  background: (s2) => MaterialDynamicColors.secondaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.tertiary = DynamicColor.fromPalette({
  name: "tertiary",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 90 : 25;
    }
    return s2.isDark ? 80 : 40;
  },
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.tertiaryContainer, MaterialDynamicColors.tertiary, 10, "nearer", false)
});
MaterialDynamicColors.onTertiary = DynamicColor.fromPalette({
  name: "on_tertiary",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 10 : 90;
    }
    return s2.isDark ? 20 : 100;
  },
  background: (s2) => MaterialDynamicColors.tertiary,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.tertiaryContainer = DynamicColor.fromPalette({
  name: "tertiary_container",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 60 : 49;
    }
    if (!isFidelity(s2)) {
      return s2.isDark ? 30 : 90;
    }
    const proposedHct = s2.tertiaryPalette.getHct(s2.sourceColorHct.tone);
    return DislikeAnalyzer.fixIfDisliked(proposedHct).tone;
  },
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.tertiaryContainer, MaterialDynamicColors.tertiary, 10, "nearer", false)
});
MaterialDynamicColors.onTertiaryContainer = DynamicColor.fromPalette({
  name: "on_tertiary_container",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 0 : 100;
    }
    if (!isFidelity(s2)) {
      return s2.isDark ? 90 : 30;
    }
    return DynamicColor.foregroundTone(MaterialDynamicColors.tertiaryContainer.tone(s2), 4.5);
  },
  background: (s2) => MaterialDynamicColors.tertiaryContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.error = DynamicColor.fromPalette({
  name: "error",
  palette: (s2) => s2.errorPalette,
  tone: (s2) => s2.isDark ? 80 : 40,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(3, 4.5, 7, 7),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.errorContainer, MaterialDynamicColors.error, 10, "nearer", false)
});
MaterialDynamicColors.onError = DynamicColor.fromPalette({
  name: "on_error",
  palette: (s2) => s2.errorPalette,
  tone: (s2) => s2.isDark ? 20 : 100,
  background: (s2) => MaterialDynamicColors.error,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.errorContainer = DynamicColor.fromPalette({
  name: "error_container",
  palette: (s2) => s2.errorPalette,
  tone: (s2) => s2.isDark ? 30 : 90,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.errorContainer, MaterialDynamicColors.error, 10, "nearer", false)
});
MaterialDynamicColors.onErrorContainer = DynamicColor.fromPalette({
  name: "on_error_container",
  palette: (s2) => s2.errorPalette,
  tone: (s2) => {
    if (isMonochrome(s2)) {
      return s2.isDark ? 90 : 10;
    }
    return s2.isDark ? 90 : 30;
  },
  background: (s2) => MaterialDynamicColors.errorContainer,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.primaryFixed = DynamicColor.fromPalette({
  name: "primary_fixed",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => isMonochrome(s2) ? 40 : 90,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.primaryFixed, MaterialDynamicColors.primaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.primaryFixedDim = DynamicColor.fromPalette({
  name: "primary_fixed_dim",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => isMonochrome(s2) ? 30 : 80,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.primaryFixed, MaterialDynamicColors.primaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onPrimaryFixed = DynamicColor.fromPalette({
  name: "on_primary_fixed",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => isMonochrome(s2) ? 100 : 10,
  background: (s2) => MaterialDynamicColors.primaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.primaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onPrimaryFixedVariant = DynamicColor.fromPalette({
  name: "on_primary_fixed_variant",
  palette: (s2) => s2.primaryPalette,
  tone: (s2) => isMonochrome(s2) ? 90 : 30,
  background: (s2) => MaterialDynamicColors.primaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.primaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.secondaryFixed = DynamicColor.fromPalette({
  name: "secondary_fixed",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => isMonochrome(s2) ? 80 : 90,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.secondaryFixed, MaterialDynamicColors.secondaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.secondaryFixedDim = DynamicColor.fromPalette({
  name: "secondary_fixed_dim",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => isMonochrome(s2) ? 70 : 80,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.secondaryFixed, MaterialDynamicColors.secondaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onSecondaryFixed = DynamicColor.fromPalette({
  name: "on_secondary_fixed",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => 10,
  background: (s2) => MaterialDynamicColors.secondaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.secondaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onSecondaryFixedVariant = DynamicColor.fromPalette({
  name: "on_secondary_fixed_variant",
  palette: (s2) => s2.secondaryPalette,
  tone: (s2) => isMonochrome(s2) ? 25 : 30,
  background: (s2) => MaterialDynamicColors.secondaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.secondaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});
MaterialDynamicColors.tertiaryFixed = DynamicColor.fromPalette({
  name: "tertiary_fixed",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => isMonochrome(s2) ? 40 : 90,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.tertiaryFixed, MaterialDynamicColors.tertiaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.tertiaryFixedDim = DynamicColor.fromPalette({
  name: "tertiary_fixed_dim",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => isMonochrome(s2) ? 30 : 80,
  isBackground: true,
  background: (s2) => MaterialDynamicColors.highestSurface(s2),
  contrastCurve: new ContrastCurve(1, 1, 3, 4.5),
  toneDeltaPair: (s2) => new ToneDeltaPair(MaterialDynamicColors.tertiaryFixed, MaterialDynamicColors.tertiaryFixedDim, 10, "lighter", true)
});
MaterialDynamicColors.onTertiaryFixed = DynamicColor.fromPalette({
  name: "on_tertiary_fixed",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => isMonochrome(s2) ? 100 : 10,
  background: (s2) => MaterialDynamicColors.tertiaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.tertiaryFixed,
  contrastCurve: new ContrastCurve(4.5, 7, 11, 21)
});
MaterialDynamicColors.onTertiaryFixedVariant = DynamicColor.fromPalette({
  name: "on_tertiary_fixed_variant",
  palette: (s2) => s2.tertiaryPalette,
  tone: (s2) => isMonochrome(s2) ? 90 : 30,
  background: (s2) => MaterialDynamicColors.tertiaryFixedDim,
  secondBackground: (s2) => MaterialDynamicColors.tertiaryFixed,
  contrastCurve: new ContrastCurve(3, 4.5, 7, 11)
});

// node_modules/mdui/node_modules/@material/material-color-utilities/dynamiccolor/dynamic_scheme.js
var DynamicScheme = class {
  constructor(args) {
    this.sourceColorArgb = args.sourceColorArgb;
    this.variant = args.variant;
    this.contrastLevel = args.contrastLevel;
    this.isDark = args.isDark;
    this.sourceColorHct = Hct.fromInt(args.sourceColorArgb);
    this.primaryPalette = args.primaryPalette;
    this.secondaryPalette = args.secondaryPalette;
    this.tertiaryPalette = args.tertiaryPalette;
    this.neutralPalette = args.neutralPalette;
    this.neutralVariantPalette = args.neutralVariantPalette;
    this.errorPalette = TonalPalette.fromHueAndChroma(25, 84);
  }
  /**
   * Support design spec'ing Dynamic Color by schemes that specify hue
   * rotations that should be applied at certain breakpoints.
   * @param sourceColor the source color of the theme, in HCT.
   * @param hues The "breakpoints", i.e. the hues at which a rotation should
   * be apply.
   * @param rotations The rotation that should be applied when source color's
   * hue is >= the same index in hues array, and <= the hue at the next index
   * in hues array.
   */
  static getRotatedHue(sourceColor, hues, rotations) {
    const sourceHue = sourceColor.hue;
    if (hues.length !== rotations.length) {
      throw new Error(`mismatch between hue length ${hues.length} & rotations ${rotations.length}`);
    }
    if (rotations.length === 1) {
      return sanitizeDegreesDouble(sourceColor.hue + rotations[0]);
    }
    const size = hues.length;
    for (let i = 0; i <= size - 2; i++) {
      const thisHue = hues[i];
      const nextHue = hues[i + 1];
      if (thisHue < sourceHue && sourceHue < nextHue) {
        return sanitizeDegreesDouble(sourceHue + rotations[i]);
      }
    }
    return sourceHue;
  }
  getArgb(dynamicColor) {
    return dynamicColor.getArgb(this);
  }
  getHct(dynamicColor) {
    return dynamicColor.getHct(this);
  }
  get primaryPaletteKeyColor() {
    return this.getArgb(MaterialDynamicColors.primaryPaletteKeyColor);
  }
  get secondaryPaletteKeyColor() {
    return this.getArgb(MaterialDynamicColors.secondaryPaletteKeyColor);
  }
  get tertiaryPaletteKeyColor() {
    return this.getArgb(MaterialDynamicColors.tertiaryPaletteKeyColor);
  }
  get neutralPaletteKeyColor() {
    return this.getArgb(MaterialDynamicColors.neutralPaletteKeyColor);
  }
  get neutralVariantPaletteKeyColor() {
    return this.getArgb(MaterialDynamicColors.neutralVariantPaletteKeyColor);
  }
  get background() {
    return this.getArgb(MaterialDynamicColors.background);
  }
  get onBackground() {
    return this.getArgb(MaterialDynamicColors.onBackground);
  }
  get surface() {
    return this.getArgb(MaterialDynamicColors.surface);
  }
  get surfaceDim() {
    return this.getArgb(MaterialDynamicColors.surfaceDim);
  }
  get surfaceBright() {
    return this.getArgb(MaterialDynamicColors.surfaceBright);
  }
  get surfaceContainerLowest() {
    return this.getArgb(MaterialDynamicColors.surfaceContainerLowest);
  }
  get surfaceContainerLow() {
    return this.getArgb(MaterialDynamicColors.surfaceContainerLow);
  }
  get surfaceContainer() {
    return this.getArgb(MaterialDynamicColors.surfaceContainer);
  }
  get surfaceContainerHigh() {
    return this.getArgb(MaterialDynamicColors.surfaceContainerHigh);
  }
  get surfaceContainerHighest() {
    return this.getArgb(MaterialDynamicColors.surfaceContainerHighest);
  }
  get onSurface() {
    return this.getArgb(MaterialDynamicColors.onSurface);
  }
  get surfaceVariant() {
    return this.getArgb(MaterialDynamicColors.surfaceVariant);
  }
  get onSurfaceVariant() {
    return this.getArgb(MaterialDynamicColors.onSurfaceVariant);
  }
  get inverseSurface() {
    return this.getArgb(MaterialDynamicColors.inverseSurface);
  }
  get inverseOnSurface() {
    return this.getArgb(MaterialDynamicColors.inverseOnSurface);
  }
  get outline() {
    return this.getArgb(MaterialDynamicColors.outline);
  }
  get outlineVariant() {
    return this.getArgb(MaterialDynamicColors.outlineVariant);
  }
  get shadow() {
    return this.getArgb(MaterialDynamicColors.shadow);
  }
  get scrim() {
    return this.getArgb(MaterialDynamicColors.scrim);
  }
  get surfaceTint() {
    return this.getArgb(MaterialDynamicColors.surfaceTint);
  }
  get primary() {
    return this.getArgb(MaterialDynamicColors.primary);
  }
  get onPrimary() {
    return this.getArgb(MaterialDynamicColors.onPrimary);
  }
  get primaryContainer() {
    return this.getArgb(MaterialDynamicColors.primaryContainer);
  }
  get onPrimaryContainer() {
    return this.getArgb(MaterialDynamicColors.onPrimaryContainer);
  }
  get inversePrimary() {
    return this.getArgb(MaterialDynamicColors.inversePrimary);
  }
  get secondary() {
    return this.getArgb(MaterialDynamicColors.secondary);
  }
  get onSecondary() {
    return this.getArgb(MaterialDynamicColors.onSecondary);
  }
  get secondaryContainer() {
    return this.getArgb(MaterialDynamicColors.secondaryContainer);
  }
  get onSecondaryContainer() {
    return this.getArgb(MaterialDynamicColors.onSecondaryContainer);
  }
  get tertiary() {
    return this.getArgb(MaterialDynamicColors.tertiary);
  }
  get onTertiary() {
    return this.getArgb(MaterialDynamicColors.onTertiary);
  }
  get tertiaryContainer() {
    return this.getArgb(MaterialDynamicColors.tertiaryContainer);
  }
  get onTertiaryContainer() {
    return this.getArgb(MaterialDynamicColors.onTertiaryContainer);
  }
  get error() {
    return this.getArgb(MaterialDynamicColors.error);
  }
  get onError() {
    return this.getArgb(MaterialDynamicColors.onError);
  }
  get errorContainer() {
    return this.getArgb(MaterialDynamicColors.errorContainer);
  }
  get onErrorContainer() {
    return this.getArgb(MaterialDynamicColors.onErrorContainer);
  }
  get primaryFixed() {
    return this.getArgb(MaterialDynamicColors.primaryFixed);
  }
  get primaryFixedDim() {
    return this.getArgb(MaterialDynamicColors.primaryFixedDim);
  }
  get onPrimaryFixed() {
    return this.getArgb(MaterialDynamicColors.onPrimaryFixed);
  }
  get onPrimaryFixedVariant() {
    return this.getArgb(MaterialDynamicColors.onPrimaryFixedVariant);
  }
  get secondaryFixed() {
    return this.getArgb(MaterialDynamicColors.secondaryFixed);
  }
  get secondaryFixedDim() {
    return this.getArgb(MaterialDynamicColors.secondaryFixedDim);
  }
  get onSecondaryFixed() {
    return this.getArgb(MaterialDynamicColors.onSecondaryFixed);
  }
  get onSecondaryFixedVariant() {
    return this.getArgb(MaterialDynamicColors.onSecondaryFixedVariant);
  }
  get tertiaryFixed() {
    return this.getArgb(MaterialDynamicColors.tertiaryFixed);
  }
  get tertiaryFixedDim() {
    return this.getArgb(MaterialDynamicColors.tertiaryFixedDim);
  }
  get onTertiaryFixed() {
    return this.getArgb(MaterialDynamicColors.onTertiaryFixed);
  }
  get onTertiaryFixedVariant() {
    return this.getArgb(MaterialDynamicColors.onTertiaryFixedVariant);
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/palettes/core_palette.js
var CorePalette = class _CorePalette {
  /**
   * @param argb ARGB representation of a color
   */
  static of(argb) {
    return new _CorePalette(argb, false);
  }
  /**
   * @param argb ARGB representation of a color
   */
  static contentOf(argb) {
    return new _CorePalette(argb, true);
  }
  /**
   * Create a [CorePalette] from a set of colors
   */
  static fromColors(colors) {
    return _CorePalette.createPaletteFromColors(false, colors);
  }
  /**
   * Create a content [CorePalette] from a set of colors
   */
  static contentFromColors(colors) {
    return _CorePalette.createPaletteFromColors(true, colors);
  }
  static createPaletteFromColors(content, colors) {
    const palette = new _CorePalette(colors.primary, content);
    if (colors.secondary) {
      const p = new _CorePalette(colors.secondary, content);
      palette.a2 = p.a1;
    }
    if (colors.tertiary) {
      const p = new _CorePalette(colors.tertiary, content);
      palette.a3 = p.a1;
    }
    if (colors.error) {
      const p = new _CorePalette(colors.error, content);
      palette.error = p.a1;
    }
    if (colors.neutral) {
      const p = new _CorePalette(colors.neutral, content);
      palette.n1 = p.n1;
    }
    if (colors.neutralVariant) {
      const p = new _CorePalette(colors.neutralVariant, content);
      palette.n2 = p.n2;
    }
    return palette;
  }
  constructor(argb, isContent) {
    const hct = Hct.fromInt(argb);
    const hue = hct.hue;
    const chroma = hct.chroma;
    if (isContent) {
      this.a1 = TonalPalette.fromHueAndChroma(hue, chroma);
      this.a2 = TonalPalette.fromHueAndChroma(hue, chroma / 3);
      this.a3 = TonalPalette.fromHueAndChroma(hue + 60, chroma / 2);
      this.n1 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 12, 4));
      this.n2 = TonalPalette.fromHueAndChroma(hue, Math.min(chroma / 6, 8));
    } else {
      this.a1 = TonalPalette.fromHueAndChroma(hue, Math.max(48, chroma));
      this.a2 = TonalPalette.fromHueAndChroma(hue, 16);
      this.a3 = TonalPalette.fromHueAndChroma(hue + 60, 24);
      this.n1 = TonalPalette.fromHueAndChroma(hue, 4);
      this.n2 = TonalPalette.fromHueAndChroma(hue, 8);
    }
    this.error = TonalPalette.fromHueAndChroma(25, 84);
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/scheme/scheme.js
var Scheme = class _Scheme {
  get primary() {
    return this.props.primary;
  }
  get onPrimary() {
    return this.props.onPrimary;
  }
  get primaryContainer() {
    return this.props.primaryContainer;
  }
  get onPrimaryContainer() {
    return this.props.onPrimaryContainer;
  }
  get secondary() {
    return this.props.secondary;
  }
  get onSecondary() {
    return this.props.onSecondary;
  }
  get secondaryContainer() {
    return this.props.secondaryContainer;
  }
  get onSecondaryContainer() {
    return this.props.onSecondaryContainer;
  }
  get tertiary() {
    return this.props.tertiary;
  }
  get onTertiary() {
    return this.props.onTertiary;
  }
  get tertiaryContainer() {
    return this.props.tertiaryContainer;
  }
  get onTertiaryContainer() {
    return this.props.onTertiaryContainer;
  }
  get error() {
    return this.props.error;
  }
  get onError() {
    return this.props.onError;
  }
  get errorContainer() {
    return this.props.errorContainer;
  }
  get onErrorContainer() {
    return this.props.onErrorContainer;
  }
  get background() {
    return this.props.background;
  }
  get onBackground() {
    return this.props.onBackground;
  }
  get surface() {
    return this.props.surface;
  }
  get onSurface() {
    return this.props.onSurface;
  }
  get surfaceVariant() {
    return this.props.surfaceVariant;
  }
  get onSurfaceVariant() {
    return this.props.onSurfaceVariant;
  }
  get outline() {
    return this.props.outline;
  }
  get outlineVariant() {
    return this.props.outlineVariant;
  }
  get shadow() {
    return this.props.shadow;
  }
  get scrim() {
    return this.props.scrim;
  }
  get inverseSurface() {
    return this.props.inverseSurface;
  }
  get inverseOnSurface() {
    return this.props.inverseOnSurface;
  }
  get inversePrimary() {
    return this.props.inversePrimary;
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Light Material color scheme, based on the color's hue.
   */
  static light(argb) {
    return _Scheme.lightFromCorePalette(CorePalette.of(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Dark Material color scheme, based on the color's hue.
   */
  static dark(argb) {
    return _Scheme.darkFromCorePalette(CorePalette.of(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Light Material content color scheme, based on the color's hue.
   */
  static lightContent(argb) {
    return _Scheme.lightFromCorePalette(CorePalette.contentOf(argb));
  }
  /**
   * @param argb ARGB representation of a color.
   * @return Dark Material content color scheme, based on the color's hue.
   */
  static darkContent(argb) {
    return _Scheme.darkFromCorePalette(CorePalette.contentOf(argb));
  }
  /**
   * Light scheme from core palette
   */
  static lightFromCorePalette(core) {
    return new _Scheme({
      primary: core.a1.tone(40),
      onPrimary: core.a1.tone(100),
      primaryContainer: core.a1.tone(90),
      onPrimaryContainer: core.a1.tone(10),
      secondary: core.a2.tone(40),
      onSecondary: core.a2.tone(100),
      secondaryContainer: core.a2.tone(90),
      onSecondaryContainer: core.a2.tone(10),
      tertiary: core.a3.tone(40),
      onTertiary: core.a3.tone(100),
      tertiaryContainer: core.a3.tone(90),
      onTertiaryContainer: core.a3.tone(10),
      error: core.error.tone(40),
      onError: core.error.tone(100),
      errorContainer: core.error.tone(90),
      onErrorContainer: core.error.tone(10),
      background: core.n1.tone(99),
      onBackground: core.n1.tone(10),
      surface: core.n1.tone(99),
      onSurface: core.n1.tone(10),
      surfaceVariant: core.n2.tone(90),
      onSurfaceVariant: core.n2.tone(30),
      outline: core.n2.tone(50),
      outlineVariant: core.n2.tone(80),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(20),
      inverseOnSurface: core.n1.tone(95),
      inversePrimary: core.a1.tone(80)
    });
  }
  /**
   * Dark scheme from core palette
   */
  static darkFromCorePalette(core) {
    return new _Scheme({
      primary: core.a1.tone(80),
      onPrimary: core.a1.tone(20),
      primaryContainer: core.a1.tone(30),
      onPrimaryContainer: core.a1.tone(90),
      secondary: core.a2.tone(80),
      onSecondary: core.a2.tone(20),
      secondaryContainer: core.a2.tone(30),
      onSecondaryContainer: core.a2.tone(90),
      tertiary: core.a3.tone(80),
      onTertiary: core.a3.tone(20),
      tertiaryContainer: core.a3.tone(30),
      onTertiaryContainer: core.a3.tone(90),
      error: core.error.tone(80),
      onError: core.error.tone(20),
      errorContainer: core.error.tone(30),
      onErrorContainer: core.error.tone(80),
      background: core.n1.tone(10),
      onBackground: core.n1.tone(90),
      surface: core.n1.tone(10),
      onSurface: core.n1.tone(90),
      surfaceVariant: core.n2.tone(30),
      onSurfaceVariant: core.n2.tone(80),
      outline: core.n2.tone(60),
      outlineVariant: core.n2.tone(30),
      shadow: core.n1.tone(0),
      scrim: core.n1.tone(0),
      inverseSurface: core.n1.tone(90),
      inverseOnSurface: core.n1.tone(20),
      inversePrimary: core.a1.tone(40)
    });
  }
  constructor(props) {
    this.props = props;
  }
  toJSON() {
    return {
      ...this.props
    };
  }
};

// node_modules/mdui/node_modules/@material/material-color-utilities/scheme/scheme_expressive.js
var SchemeExpressive = class _SchemeExpressive extends DynamicScheme {
  constructor(sourceColorHct, isDark, contrastLevel) {
    super({
      sourceColorArgb: sourceColorHct.toInt(),
      variant: Variant.EXPRESSIVE,
      contrastLevel,
      isDark,
      primaryPalette: TonalPalette.fromHueAndChroma(sanitizeDegreesDouble(sourceColorHct.hue + 240), 40),
      secondaryPalette: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, _SchemeExpressive.hues, _SchemeExpressive.secondaryRotations), 24),
      tertiaryPalette: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, _SchemeExpressive.hues, _SchemeExpressive.tertiaryRotations), 32),
      neutralPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue + 15, 8),
      neutralVariantPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue + 15, 12)
    });
  }
};
SchemeExpressive.hues = [
  0,
  21,
  51,
  121,
  151,
  191,
  271,
  321,
  360
];
SchemeExpressive.secondaryRotations = [
  45,
  95,
  45,
  20,
  45,
  90,
  45,
  45,
  45
];
SchemeExpressive.tertiaryRotations = [
  120,
  120,
  20,
  45,
  20,
  15,
  20,
  120,
  120
];

// node_modules/mdui/node_modules/@material/material-color-utilities/scheme/scheme_vibrant.js
var SchemeVibrant = class _SchemeVibrant extends DynamicScheme {
  constructor(sourceColorHct, isDark, contrastLevel) {
    super({
      sourceColorArgb: sourceColorHct.toInt(),
      variant: Variant.VIBRANT,
      contrastLevel,
      isDark,
      primaryPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 200),
      secondaryPalette: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, _SchemeVibrant.hues, _SchemeVibrant.secondaryRotations), 24),
      tertiaryPalette: TonalPalette.fromHueAndChroma(DynamicScheme.getRotatedHue(sourceColorHct, _SchemeVibrant.hues, _SchemeVibrant.tertiaryRotations), 32),
      neutralPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 10),
      neutralVariantPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 12)
    });
  }
};
SchemeVibrant.hues = [
  0,
  41,
  61,
  101,
  131,
  181,
  251,
  301,
  360
];
SchemeVibrant.secondaryRotations = [
  18,
  15,
  10,
  12,
  15,
  18,
  15,
  12,
  12
];
SchemeVibrant.tertiaryRotations = [
  35,
  30,
  20,
  25,
  30,
  35,
  30,
  25,
  25
];

// node_modules/mdui/node_modules/@material/material-color-utilities/score/score.js
var SCORE_OPTION_DEFAULTS = {
  desired: 4,
  fallbackColorARGB: 4282549748,
  filter: true
  // Avoid unsuitable colors.
};
function compare(a, b) {
  if (a.score > b.score) {
    return -1;
  } else if (a.score < b.score) {
    return 1;
  }
  return 0;
}
var Score = class _Score {
  constructor() {
  }
  /**
   * Given a map with keys of colors and values of how often the color appears,
   * rank the colors based on suitability for being used for a UI theme.
   *
   * @param colorsToPopulation map with keys of colors and values of how often
   *     the color appears, usually from a source image.
   * @param {ScoreOptions} options optional parameters.
   * @return Colors sorted by suitability for a UI theme. The most suitable
   *     color is the first item, the least suitable is the last. There will
   *     always be at least one color returned. If all the input colors
   *     were not suitable for a theme, a default fallback color will be
   *     provided, Google Blue.
   */
  static score(colorsToPopulation, options) {
    const { desired, fallbackColorARGB, filter } = { ...SCORE_OPTION_DEFAULTS, ...options };
    const colorsHct = [];
    const huePopulation = new Array(360).fill(0);
    let populationSum = 0;
    for (const [argb, population] of colorsToPopulation.entries()) {
      const hct = Hct.fromInt(argb);
      colorsHct.push(hct);
      const hue = Math.floor(hct.hue);
      huePopulation[hue] += population;
      populationSum += population;
    }
    const hueExcitedProportions = new Array(360).fill(0);
    for (let hue = 0; hue < 360; hue++) {
      const proportion = huePopulation[hue] / populationSum;
      for (let i = hue - 14; i < hue + 16; i++) {
        const neighborHue = sanitizeDegreesInt(i);
        hueExcitedProportions[neighborHue] += proportion;
      }
    }
    const scoredHct = new Array();
    for (const hct of colorsHct) {
      const hue = sanitizeDegreesInt(Math.round(hct.hue));
      const proportion = hueExcitedProportions[hue];
      if (filter && (hct.chroma < _Score.CUTOFF_CHROMA || proportion <= _Score.CUTOFF_EXCITED_PROPORTION)) {
        continue;
      }
      const proportionScore = proportion * 100 * _Score.WEIGHT_PROPORTION;
      const chromaWeight = hct.chroma < _Score.TARGET_CHROMA ? _Score.WEIGHT_CHROMA_BELOW : _Score.WEIGHT_CHROMA_ABOVE;
      const chromaScore = (hct.chroma - _Score.TARGET_CHROMA) * chromaWeight;
      const score = proportionScore + chromaScore;
      scoredHct.push({ hct, score });
    }
    scoredHct.sort(compare);
    const chosenColors = [];
    for (let differenceDegrees2 = 90; differenceDegrees2 >= 15; differenceDegrees2--) {
      chosenColors.length = 0;
      for (const { hct } of scoredHct) {
        const duplicateHue = chosenColors.find((chosenHct) => {
          return differenceDegrees(hct.hue, chosenHct.hue) < differenceDegrees2;
        });
        if (!duplicateHue) {
          chosenColors.push(hct);
        }
        if (chosenColors.length >= desired)
          break;
      }
      if (chosenColors.length >= desired)
        break;
    }
    const colors = [];
    if (chosenColors.length === 0) {
      colors.push(fallbackColorARGB);
    }
    for (const chosenHct of chosenColors) {
      colors.push(chosenHct.toInt());
    }
    return colors;
  }
};
Score.TARGET_CHROMA = 48;
Score.WEIGHT_PROPORTION = 0.7;
Score.WEIGHT_CHROMA_ABOVE = 0.3;
Score.WEIGHT_CHROMA_BELOW = 0.1;
Score.CUTOFF_CHROMA = 5;
Score.CUTOFF_EXCITED_PROPORTION = 0.01;

// node_modules/mdui/node_modules/@material/material-color-utilities/utils/string_utils.js
function argbFromHex(hex) {
  hex = hex.replace("#", "");
  const isThree = hex.length === 3;
  const isSix = hex.length === 6;
  const isEight = hex.length === 8;
  if (!isThree && !isSix && !isEight) {
    throw new Error("unexpected hex " + hex);
  }
  let r = 0;
  let g = 0;
  let b = 0;
  if (isThree) {
    r = parseIntHex(hex.slice(0, 1).repeat(2));
    g = parseIntHex(hex.slice(1, 2).repeat(2));
    b = parseIntHex(hex.slice(2, 3).repeat(2));
  } else if (isSix) {
    r = parseIntHex(hex.slice(0, 2));
    g = parseIntHex(hex.slice(2, 4));
    b = parseIntHex(hex.slice(4, 6));
  } else if (isEight) {
    r = parseIntHex(hex.slice(2, 4));
    g = parseIntHex(hex.slice(4, 6));
    b = parseIntHex(hex.slice(6, 8));
  }
  return (255 << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255) >>> 0;
}
function parseIntHex(value) {
  return parseInt(value, 16);
}

// node_modules/mdui/node_modules/@material/material-color-utilities/utils/theme_utils.js
function customColor(source, color) {
  let value = color.value;
  const from = value;
  const to = source;
  if (color.blend) {
    value = Blend.harmonize(from, to);
  }
  const palette = CorePalette.of(value);
  const tones = palette.a1;
  return {
    color,
    value,
    light: {
      color: tones.tone(40),
      onColor: tones.tone(100),
      colorContainer: tones.tone(90),
      onColorContainer: tones.tone(10)
    },
    dark: {
      color: tones.tone(80),
      onColor: tones.tone(20),
      colorContainer: tones.tone(30),
      onColorContainer: tones.tone(90)
    }
  };
}

// node_modules/mdui/internal/colorScheme.js
var themeArr = ["light", "dark"];
var prefix = "mdui-custom-color-scheme-";
var themeIndex = 0;
var rgbFromArgb = (source) => {
  const red = redFromArgb(source);
  const green = greenFromArgb(source);
  const blue = blueFromArgb(source);
  return [red, green, blue].join(", ");
};
var remove2 = (target) => {
  const $target = $(target);
  let classNames = $target.get().map((element) => Array.from(element.classList)).flat();
  classNames = unique(classNames).filter((className2) => className2.startsWith(prefix));
  $target.removeClass(classNames.join(" "));
  const unusedClassNames = classNames.filter((className2) => $(`.${className2}`).length === 0);
  $(unusedClassNames.map((i) => `#${i}`).join(",")).remove();
};
var setFromSource = (source, options) => {
  const document3 = getDocument();
  const $target = $(options?.target || document3.documentElement);
  const schemes = {
    light: Scheme.light(source).toJSON(),
    dark: Scheme.dark(source).toJSON()
  };
  const palette = CorePalette.of(source);
  Object.assign(schemes.light, {
    "surface-dim": palette.n1.tone(87),
    "surface-bright": palette.n1.tone(98),
    "surface-container-lowest": palette.n1.tone(100),
    "surface-container-low": palette.n1.tone(96),
    "surface-container": palette.n1.tone(94),
    "surface-container-high": palette.n1.tone(92),
    "surface-container-highest": palette.n1.tone(90),
    "surface-tint-color": schemes.light.primary
  });
  Object.assign(schemes.dark, {
    "surface-dim": palette.n1.tone(6),
    "surface-bright": palette.n1.tone(24),
    "surface-container-lowest": palette.n1.tone(4),
    "surface-container-low": palette.n1.tone(10),
    "surface-container": palette.n1.tone(12),
    "surface-container-high": palette.n1.tone(17),
    "surface-container-highest": palette.n1.tone(22),
    "surface-tint-color": schemes.dark.primary
  });
  (options?.customColors || []).map((color) => {
    const name = toKebabCase(color.name);
    const custom = customColor(source, {
      name,
      value: argbFromHex(color.value),
      blend: true
    });
    themeArr.forEach((theme) => {
      schemes[theme][name] = custom[theme].color;
      schemes[theme][`on-${name}`] = custom[theme].onColor;
      schemes[theme][`${name}-container`] = custom[theme].colorContainer;
      schemes[theme][`on-${name}-container`] = custom[theme].onColorContainer;
    });
  });
  const colorVar = (theme, callback) => {
    return Object.entries(schemes[theme]).map(([key, value]) => callback(toKebabCase(key), rgbFromArgb(value))).join("");
  };
  const className2 = prefix + `${source}-${themeIndex++}`;
  const cssText = `.${className2} {
  ${colorVar("light", (token, rgb) => `--mdui-color-${token}-light: ${rgb};`)}
  ${colorVar("dark", (token, rgb) => `--mdui-color-${token}-dark: ${rgb};`)}
  ${colorVar("light", (token) => `--mdui-color-${token}: var(--mdui-color-${token}-light);`)}

  color: rgb(var(--mdui-color-on-background));
  background-color: rgb(var(--mdui-color-background));
}

.mdui-theme-dark .${className2},
.mdui-theme-dark.${className2} {
  ${colorVar("dark", (token) => `--mdui-color-${token}: var(--mdui-color-${token}-dark);`)}
}

@media (prefers-color-scheme: dark) {
  .mdui-theme-auto .${className2},
  .mdui-theme-auto.${className2} {
    ${colorVar("dark", (token) => `--mdui-color-${token}: var(--mdui-color-${token}-dark);`)}
  }
}`;
  remove2($target);
  $(document3.head).append(`<style id="${className2}">${cssText}</style>`);
  $target.addClass(className2);
};

// node_modules/mdui/functions/setColorScheme.js
var setColorScheme = (hex, options) => {
  const source = argbFromHex(hex);
  setFromSource(source, options);
};

// packages/mdui-admin/webjsx/elementTags.ts
var KNOWN_ELEMENTS = new Map(
  Object.entries({
    a: "A",
    abbr: "ABBR",
    address: "ADDRESS",
    area: "AREA",
    article: "ARTICLE",
    aside: "ASIDE",
    audio: "AUDIO",
    b: "B",
    base: "BASE",
    bdi: "BDI",
    bdo: "BDO",
    blockquote: "BLOCKQUOTE",
    body: "BODY",
    br: "BR",
    button: "BUTTON",
    canvas: "CANVAS",
    caption: "CAPTION",
    cite: "CITE",
    code: "CODE",
    col: "COL",
    colgroup: "COLGROUP",
    data: "DATA",
    datalist: "DATALIST",
    dd: "DD",
    del: "DEL",
    details: "DETAILS",
    dfn: "DFN",
    dialog: "DIALOG",
    div: "DIV",
    dl: "DL",
    dt: "DT",
    em: "EM",
    embed: "EMBED",
    fieldset: "FIELDSET",
    figcaption: "FIGCAPTION",
    figure: "FIGURE",
    footer: "FOOTER",
    form: "FORM",
    h1: "H1",
    h2: "H2",
    h3: "H3",
    h4: "H4",
    h5: "H5",
    h6: "H6",
    head: "HEAD",
    header: "HEADER",
    hgroup: "HGROUP",
    hr: "HR",
    html: "HTML",
    i: "I",
    iframe: "IFRAME",
    img: "IMG",
    input: "INPUT",
    ins: "INS",
    kbd: "KBD",
    label: "LABEL",
    legend: "LEGEND",
    li: "LI",
    link: "LINK",
    main: "MAIN",
    map: "MAP",
    mark: "MARK",
    menu: "MENU",
    meta: "META",
    meter: "METER",
    nav: "NAV",
    noscript: "NOSCRIPT",
    object: "OBJECT",
    ol: "OL",
    optgroup: "OPTGROUP",
    option: "OPTION",
    output: "OUTPUT",
    p: "P",
    picture: "PICTURE",
    pre: "PRE",
    progress: "PROGRESS",
    q: "Q",
    rp: "RP",
    rt: "RT",
    ruby: "RUBY",
    s: "S",
    samp: "SAMP",
    script: "SCRIPT",
    section: "SECTION",
    select: "SELECT",
    slot: "SLOT",
    small: "SMALL",
    source: "SOURCE",
    span: "SPAN",
    strong: "STRONG",
    style: "STYLE",
    sub: "SUB",
    summary: "SUMMARY",
    sup: "SUP",
    table: "TABLE",
    tbody: "TBODY",
    td: "TD",
    template: "TEMPLATE",
    textarea: "TEXTAREA",
    tfoot: "TFOOT",
    th: "TH",
    thead: "THEAD",
    time: "TIME",
    title: "TITLE",
    tr: "TR",
    track: "TRACK",
    u: "U",
    ul: "UL",
    var: "VAR",
    video: "VIDEO",
    wbr: "WBR"
  })
);

// packages/mdui-admin/webjsx/constants.ts
var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// packages/mdui-admin/webjsx/utils.ts
function flattenVNodes(vnodes, result = []) {
  if (Array.isArray(vnodes)) {
    for (const vnode of vnodes) {
      flattenVNodes(vnode, result);
    }
  } else if (isValidVNode(vnodes)) {
    result.push(vnodes);
  }
  return result;
}
function isValidVNode(vnode) {
  const typeofVNode = typeof vnode;
  return vnode !== null && vnode !== void 0 && (typeofVNode === "string" || typeofVNode === "object" || typeofVNode === "number" || typeofVNode === "bigint");
}
function getChildNodes(parent) {
  const nodes = [];
  let current = parent.firstChild;
  while (current) {
    nodes.push(current);
    current = current.nextSibling;
  }
  return nodes;
}
function assignRef(node, ref2) {
  if (typeof ref2 === "function") {
    ref2(node);
  } else if (ref2 && typeof ref2 === "object") {
    ref2.current = node;
  }
}
function isVElement(vnode) {
  const typeofVNode = typeof vnode;
  return typeofVNode !== "string" && typeofVNode !== "number" && typeofVNode !== "bigint";
}
function isNonBooleanPrimitive(vnode) {
  const typeofVNode = typeof vnode;
  return typeofVNode === "string" || typeofVNode === "number" || typeofVNode === "bigint";
}
function getNamespaceURI(node) {
  return node instanceof Element && node.namespaceURI !== HTML_NAMESPACE ? node.namespaceURI ?? void 0 : void 0;
}
function setWebJSXProps(element, props) {
  element.__webjsx_props = props;
}
function getWebJSXProps(element) {
  let props = element.__webjsx_props;
  if (!props) {
    props = {};
    element.__webjsx_props = props;
  }
  return props;
}
function setWebJSXChildNodeCache(element, childNodes) {
  element.__webjsx_childNodes = childNodes;
}
function getWebJSXChildNodeCache(element) {
  return element.__webjsx_childNodes;
}

// packages/mdui-admin/webjsx/createElement.ts
function createElementJSX(type, props, key) {
  if (typeof type === "string") {
    props = props || {};
    const flatChildren = props ? flattenVNodes(props.children) : [];
    if (key !== void 0) {
      props.key = key;
    }
    if (flatChildren.length > 0) {
      if (!props.dangerouslySetInnerHTML) {
        props.children = flatChildren;
      } else {
        props.children = [];
        console.warn(
          "WebJSX: Ignoring children since dangerouslySetInnerHTML is set."
        );
      }
    } else {
      props.children = [];
    }
    const result = {
      type,
      tagName: KNOWN_ELEMENTS.get(type) ?? type.toUpperCase(),
      props: props ?? {}
    };
    return result;
  } else {
    const flatChildren = props ? flattenVNodes(props.children) : [];
    return flatChildren;
  }
}

// packages/mdui-admin/webjsx/renderSuspension.ts
function definesRenderSuspension(el) {
  return !!el.__webjsx_suspendRendering;
}
function withRenderSuspension(el, callback) {
  const isRenderingSuspended = !!el.__webjsx_suspendRendering;
  if (isRenderingSuspended) {
    el.__webjsx_suspendRendering();
  }
  try {
    return callback();
  } finally {
    if (isRenderingSuspended) {
      el.__webjsx_resumeRendering();
    }
  }
}

// packages/mdui-admin/webjsx/attributes.ts
function updateEventListener(el, eventName, newHandler, oldHandler) {
  if (oldHandler && oldHandler !== newHandler) {
    el.removeEventListener(eventName, oldHandler);
  }
  if (newHandler && oldHandler !== newHandler) {
    el.addEventListener(eventName, newHandler);
    el.__webjsx_listeners = el.__webjsx_listeners ?? {};
    el.__webjsx_listeners[eventName] = newHandler;
  }
}
function updatePropOrAttr(el, key, value) {
  if (el instanceof HTMLElement) {
    if (key in el) {
      el[key] = value;
      return;
    }
    if (typeof value === "string") {
      el.setAttribute(key, value);
      return;
    }
    el[key] = value;
    return;
  }
  const isSVG = el.namespaceURI === "http://www.w3.org/2000/svg";
  if (isSVG) {
    if (value !== void 0 && value !== null) {
      el.setAttribute(key, `${value}`);
    } else {
      el.removeAttribute(key);
    }
    return;
  }
  if (typeof value === "string") {
    el.setAttribute(key, value);
  } else {
    el[key] = value;
  }
}
function updateAttributesCore(el, newProps, oldProps = {}) {
  for (const key of Object.keys(newProps)) {
    const value = newProps[key];
    if (key === "children" || key === "key" || key === "dangerouslySetInnerHTML" || key === "nodes")
      continue;
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      updateEventListener(
        el,
        eventName,
        value,
        el.__webjsx_listeners?.[eventName]
      );
    } else if (value !== oldProps[key]) {
      updatePropOrAttr(el, key, value);
    }
  }
  if (newProps.dangerouslySetInnerHTML) {
    if (!oldProps.dangerouslySetInnerHTML || newProps.dangerouslySetInnerHTML.__html !== oldProps.dangerouslySetInnerHTML.__html) {
      const html2 = newProps.dangerouslySetInnerHTML?.__html || "";
      el.innerHTML = html2;
    }
  } else {
    if (oldProps.dangerouslySetInnerHTML) {
      el.innerHTML = "";
    }
  }
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps) && key !== "children" && key !== "key" && key !== "dangerouslySetInnerHTML" && key !== "nodes") {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = el.__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
          delete el.__webjsx_listeners[eventName];
        }
      } else if (key in el) {
        el[key] = void 0;
      } else {
        el.removeAttribute(key);
      }
    }
  }
}
function setAttributes(el, props) {
  if (definesRenderSuspension(el)) {
    withRenderSuspension(el, () => {
      updateAttributesCore(el, props);
    });
  } else {
    updateAttributesCore(el, props);
  }
}
function updateAttributes(el, newProps, oldProps) {
  if (definesRenderSuspension(el)) {
    withRenderSuspension(el, () => {
      updateAttributesCore(el, newProps, oldProps);
    });
  } else {
    updateAttributesCore(el, newProps, oldProps);
  }
}

// packages/mdui-admin/webjsx/createDOMElement.ts
function createDOMElement(velement, parentNamespaceURI) {
  const namespaceURI = velement.props.xmlns !== void 0 ? velement.props.xmlns : velement.type === "svg" ? SVG_NAMESPACE : parentNamespaceURI ?? void 0;
  const el = velement.props.is !== void 0 ? namespaceURI !== void 0 ? document.createElementNS(namespaceURI, velement.type, {
    is: velement.props.is
  }) : document.createElement(velement.type, {
    is: velement.props.is
  }) : namespaceURI !== void 0 ? document.createElementNS(namespaceURI, velement.type) : document.createElement(velement.type);
  if (velement.props) {
    setAttributes(el, velement.props);
  }
  if (velement.props.key !== void 0) {
    el.__webjsx_key = velement.props.key;
  }
  if (velement.props.ref) {
    assignRef(el, velement.props.ref);
  }
  if (velement.props.children && !velement.props.dangerouslySetInnerHTML) {
    const children = velement.props.children;
    const nodes = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const node = isVElement(child) ? createDOMElement(child, namespaceURI) : document.createTextNode(`${child}`);
      nodes.push(node);
      el.appendChild(node);
    }
    setWebJSXProps(el, velement.props);
    setWebJSXChildNodeCache(el, nodes);
  }
  return el;
}

// packages/mdui-admin/webjsx/applyDiff.ts
function applyDiff(parent, vnodes) {
  const newVNodes = flattenVNodes(vnodes);
  const newNodes = diffChildren(parent, newVNodes);
  const props = getWebJSXProps(parent);
  props.children = newVNodes;
  setWebJSXChildNodeCache(parent, newNodes);
}
function diffChildren(parent, newVNodes) {
  const parentProps = getWebJSXProps(parent);
  const oldVNodes = parentProps.children ?? [];
  if (newVNodes.length === 0) {
    if (oldVNodes.length > 0) {
      parent.innerHTML = "";
      return [];
    } else {
      return [];
    }
  }
  const changes = [];
  let keyedMap = null;
  const originalChildNodes = getWebJSXChildNodeCache(parent) ?? getChildNodes(parent);
  let hasKeyedNodes = false;
  let nodeOrderUnchanged = true;
  for (let i = 0; i < newVNodes.length; i++) {
    const newVNode = newVNodes[i];
    const oldVNode = oldVNodes[i];
    const currentNode = originalChildNodes[i];
    const newKey = isVElement(newVNode) ? newVNode.props.key : void 0;
    if (newKey !== void 0) {
      if (!keyedMap) {
        hasKeyedNodes = true;
        keyedMap = /* @__PURE__ */ new Map();
        for (let j = 0; j < oldVNodes.length; j++) {
          const matchingVNode = oldVNodes[j];
          const key = matchingVNode.props.key;
          if (key !== void 0) {
            const node = originalChildNodes[j];
            keyedMap.set(key, { node, oldVNode: matchingVNode });
          }
        }
      }
      const keyedNode = keyedMap.get(newKey);
      if (keyedNode) {
        if (keyedNode.oldVNode !== oldVNode) {
          nodeOrderUnchanged = false;
        }
        changes.push({
          type: "update",
          node: keyedNode.node,
          newVNode,
          oldVNode: keyedNode.oldVNode
        });
      } else {
        nodeOrderUnchanged = false;
        changes.push({ type: "create", vnode: newVNode });
      }
    } else {
      if (!hasKeyedNodes && canUpdateVNodes(newVNode, oldVNode) && currentNode) {
        changes.push({
          type: "update",
          node: currentNode,
          newVNode,
          oldVNode
        });
      } else {
        nodeOrderUnchanged = false;
        changes.push({ type: "create", vnode: newVNode });
      }
    }
  }
  if (changes.length) {
    const { nodes, lastNode: lastPlacedNode } = applyChanges(
      parent,
      changes,
      originalChildNodes,
      nodeOrderUnchanged
    );
    while (lastPlacedNode?.nextSibling) {
      parent.removeChild(lastPlacedNode.nextSibling);
    }
    return nodes;
  } else {
    return originalChildNodes;
  }
}
function canUpdateVNodes(newVNode, oldVNode) {
  if (oldVNode === void 0) return false;
  if (isNonBooleanPrimitive(newVNode) && isNonBooleanPrimitive(oldVNode)) {
    return true;
  } else {
    if (isVElement(oldVNode) && isVElement(newVNode)) {
      const oldKey = oldVNode.props.key;
      const newKey = newVNode.props.key;
      return oldVNode.tagName === newVNode.tagName && (oldKey === void 0 && newKey === void 0 || oldKey !== void 0 && newKey !== void 0 && oldKey === newKey);
    } else {
      return false;
    }
  }
}
function applyChanges(parent, changes, originalNodes, nodeOrderUnchanged) {
  const nodes = [];
  let lastPlacedNode = null;
  for (const change of changes) {
    if (change.type === "create") {
      let node = void 0;
      if (isVElement(change.vnode)) {
        node = createDOMElement(change.vnode, getNamespaceURI(parent));
      } else {
        node = document.createTextNode(`${change.vnode}`);
      }
      if (!lastPlacedNode) {
        parent.prepend(node);
      } else {
        parent.insertBefore(node, lastPlacedNode.nextSibling ?? null);
      }
      lastPlacedNode = node;
      nodes.push(node);
    } else {
      const { node, newVNode, oldVNode } = change;
      if (isVElement(newVNode)) {
        const oldProps = oldVNode?.props || {};
        const newProps = newVNode.props;
        updateAttributes(node, newProps, oldProps);
        if (newVNode.props.key !== void 0) {
          node.__webjsx_key = newVNode.props.key;
        } else {
          if (oldVNode.props?.key) {
            delete node.__webjsx_key;
          }
        }
        if (newVNode.props.ref) {
          assignRef(node, newVNode.props.ref);
        }
        if (!newProps.dangerouslySetInnerHTML && newProps.children != null) {
          const childNodes = diffChildren(node, newProps.children);
          setWebJSXProps(node, newProps);
          setWebJSXChildNodeCache(node, childNodes);
        }
      } else {
        if (newVNode !== oldVNode) {
          node.textContent = `${newVNode}`;
        }
      }
      if (!nodeOrderUnchanged) {
        if (!lastPlacedNode) {
          if (node !== originalNodes[0]) {
            parent.prepend(node);
          }
        } else {
          if (lastPlacedNode.nextSibling !== node) {
            parent.insertBefore(node, lastPlacedNode.nextSibling ?? null);
          }
        }
      }
      lastPlacedNode = node;
      nodes.push(node);
    }
  }
  return { nodes, lastNode: lastPlacedNode };
}

// packages/mdui-admin/webjsx/types.ts
var Fragment = (props) => {
  return flattenVNodes(props.children);
};

// packages/mdui-admin/webjsx/jsx-runtime.ts
function jsx(type, props, key) {
  return createElementJSX(type, props, key);
}
function jsxs(type, props, key) {
  return jsx(type, props, key);
}

// packages/mdui-admin/src/JSXElement.tsx
var JSXElement = class extends ReactiveElement {
  update(changedProperties) {
    const tree = this.render();
    super.update(changedProperties);
    if (this.shadowRoot)
      applyDiff(this.shadowRoot, tree ?? []);
  }
  render() {
    return /* @__PURE__ */ jsx("slot", {});
  }
  __jsx_events__;
};

// packages/mdui-admin/src/FormClasses.tsx
var FormControl = class {
  constructor(defaultValue2) {
    this.defaultValue = defaultValue2;
    this._value = defaultValue2;
  }
  _value;
  get value() {
    return this._value;
  }
  setValue(value, emitChange = true) {
    this._value = value;
    if (emitChange) {
      this.emitValue();
    }
  }
  subscribers = /* @__PURE__ */ new Set();
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
  destroy() {
    this.subscribers.clear();
  }
  emitValue() {
    this.subscribers.forEach((subscriber) => subscriber(this._value));
  }
};
var FormGroup = class extends FormControl {
  constructor(controls) {
    super(Object.fromEntries(Object.entries(controls).map(([key, child]) => [key, child.defaultValue])));
    this.controls = controls;
  }
  getValue() {
    return Object.fromEntries(Object.entries(this.controls).map(([key, child]) => [key, child.value]));
  }
  onChange = (key, emitChange = true) => (value) => {
    this._value = this.getValue();
    if (emitChange) {
      this.emitValue();
    }
  };
  destroy() {
    super.destroy();
    this.teardowns.forEach((teardown) => teardown());
    this.teardowns.clear();
  }
  teardowns = /* @__PURE__ */ new Map();
  addControl(key, control, emitChange = true) {
    if (key in this.controls) {
      throw new Error(`Control with key "${key}" already exists.`);
    }
    this.controls[key] = control;
    this.teardowns.set(key, control.subscribe(this.onChange(key, emitChange)));
    this._value = this.getValue();
    if (emitChange) {
      this.emitValue();
    }
  }
  setValue(value, emitChange = true) {
    for (const key in this.controls) {
      if (key in value) {
        this.controls[key].setValue(value[key], false);
      } else {
        throw new Error(`Missing value for key: ${key}`);
      }
    }
    this._value = this.getValue();
    if (emitChange) {
      this.emitValue();
    }
  }
  patchValue(value, emitChange = true) {
    for (const key in value) {
      if (key in this.controls) {
        this.controls[key].setValue(value[key], false);
      } else {
        throw new Error(`Invalid key: ${key}`);
      }
    }
    this._value = this.getValue();
    if (emitChange) {
      this.emitValue();
    }
  }
};
var _control_dec, _name_dec, _a, _FormFieldGroup_decorators, _init, _name, _control;
_FormFieldGroup_decorators = [customElement("form-field-group")];
var FormFieldGroup = class extends (_a = JSXElement, _name_dec = [state()], _control_dec = [state()], _a) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _name, __runInitializers(_init, 8, this, "")), __runInitializers(_init, 11, this);
    __privateAdd(this, _control, __runInitializers(_init, 12, this, new FormGroup({}))), __runInitializers(_init, 15, this);
    __publicField(this, "registerFormControl", (event) => {
      if (event.detail === this.control) return;
      event.stopPropagation();
      const control = event.detail;
      const target = event.target;
      this.control.addControl(target.name, control);
    });
  }
  firstUpdated(_changedProperties) {
    this.dispatchEvent(new CustomEvent("registerFormControl", {
      detail: this.control,
      bubbles: true
    }));
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("registerFormControl", this.registerFormControl);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("registerFormControl", this.registerFormControl);
    this.control.destroy();
    this.control = new FormGroup({});
  }
};
_init = __decoratorStart(_a);
_name = new WeakMap();
_control = new WeakMap();
__decorateElement(_init, 4, "name", _name_dec, FormFieldGroup, _name);
__decorateElement(_init, 4, "control", _control_dec, FormFieldGroup, _control);
FormFieldGroup = __decorateElement(_init, 0, "FormFieldGroup", _FormFieldGroup_decorators, FormFieldGroup);
__publicField(FormFieldGroup, "styles", css`
    :host {
      display: contents;
    }
  `);
__runInitializers(_init, 1, FormFieldGroup);
var _control_dec2, _emitOnInput_dec, _label_dec, _name_dec2, _variant_dec, _a2, _FormField_decorators, _init2, _variant, _name2, _label, _emitOnInput, _control2;
_FormField_decorators = [customElement("form-field")];
var FormField = class extends (_a2 = JSXElement, _variant_dec = [state()], _name_dec2 = [state()], _label_dec = [state()], _emitOnInput_dec = [state()], _control_dec2 = [state()], _a2) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _variant, __runInitializers(_init2, 8, this, "filled")), __runInitializers(_init2, 11, this);
    __privateAdd(this, _name2, __runInitializers(_init2, 12, this, "")), __runInitializers(_init2, 15, this);
    __privateAdd(this, _label, __runInitializers(_init2, 16, this, "")), __runInitializers(_init2, 19, this);
    __privateAdd(this, _emitOnInput, __runInitializers(_init2, 20, this, false)), __runInitializers(_init2, 23, this);
    __privateAdd(this, _control2, __runInitializers(_init2, 24, this, new FormControl(""))), __runInitializers(_init2, 27, this);
  }
  firstUpdated(_changedProperties) {
    this.dispatchEvent(new CustomEvent("registerFormControl", {
      detail: this.control,
      bubbles: true
    }));
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.control.destroy();
    this.control = new FormControl("");
  }
  render() {
    return /* @__PURE__ */ jsx(
      "mdui-text-field",
      {
        onchange: (event) => {
          const target = event.target;
          this.control.setValue(target.value);
        },
        oninput: (event) => {
          if (!this.emitOnInput) return;
          const target = event.target;
          this.control.setValue(target.value, false);
        },
        variant: this.variant,
        label: this.label
      }
    );
  }
};
_init2 = __decoratorStart(_a2);
_variant = new WeakMap();
_name2 = new WeakMap();
_label = new WeakMap();
_emitOnInput = new WeakMap();
_control2 = new WeakMap();
__decorateElement(_init2, 4, "variant", _variant_dec, FormField, _variant);
__decorateElement(_init2, 4, "name", _name_dec2, FormField, _name2);
__decorateElement(_init2, 4, "label", _label_dec, FormField, _label);
__decorateElement(_init2, 4, "emitOnInput", _emitOnInput_dec, FormField, _emitOnInput);
__decorateElement(_init2, 4, "control", _control_dec2, FormField, _control2);
FormField = __decorateElement(_init2, 0, "FormField", _FormField_decorators, FormField);
__publicField(FormField, "styles", css`
    :host {
      display: contents;
    }
  `);
__runInitializers(_init2, 1, FormField);

// packages/mdui-admin/src/my-detail-form.tsx
var _MyForm_decorators, _init3, _a3;
_MyForm_decorators = [customElement("my-form")];
var MyForm = class extends (_a3 = JSXElement) {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    .flex-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
  `;
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener("registerFormControl", this.registerFormControl);
  }
  registerFormControl = (event) => {
    const control = event.detail;
    console.log("register", control);
    control.subscribe((value) => {
    });
  };
  firstUpdated(_changedProperties) {
  }
  render() {
    return null;
  }
};
_init3 = __decoratorStart(_a3);
MyForm = __decorateElement(_init3, 0, "MyForm", _MyForm_decorators, MyForm);
__runInitializers(_init3, 1, MyForm);

// node_modules/luxon/src/errors.js
var LuxonError = class extends Error {
};
var InvalidDateTimeError = class extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
};
var InvalidIntervalError = class extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
};
var InvalidDurationError = class extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
};
var ConflictingSpecificationError = class extends LuxonError {
};
var InvalidUnitError = class extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
};
var InvalidArgumentError = class extends LuxonError {
};
var ZoneIsAbstractError = class extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
};

// node_modules/luxon/src/impl/formats.js
var n = "numeric";
var s = "short";
var l = "long";
var DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
var DATE_MED = {
  year: n,
  month: s,
  day: n
};
var DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
var DATE_FULL = {
  year: n,
  month: l,
  day: n
};
var DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};
var TIME_SIMPLE = {
  hour: n,
  minute: n
};
var TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
var TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
var TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hourCycle: "h23"
};
var TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23"
};
var TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: s
};
var TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hourCycle: "h23",
  timeZoneName: l
};
var DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
var DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
var DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l
};
var DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};

// node_modules/luxon/src/zone.js
var Zone = class {
  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    throw new ZoneIsAbstractError();
  }
  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    throw new ZoneIsAbstractError();
  }
  /**
   * The IANA name of this zone.
   * Defaults to `name` if not overwritten by a subclass.
   * @abstract
   * @type {string}
   */
  get ianaName() {
    return this.name;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid() {
    throw new ZoneIsAbstractError();
  }
};

// node_modules/luxon/src/zones/systemZone.js
var singleton = null;
var SystemZone = class _SystemZone extends Zone {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance() {
    if (singleton === null) {
      singleton = new _SystemZone();
    }
    return singleton;
  }
  /** @override **/
  get type() {
    return "system";
  }
  /** @override **/
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale);
  }
  /** @override **/
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  /** @override **/
  equals(otherZone) {
    return otherZone.type === "system";
  }
  /** @override **/
  get isValid() {
    return true;
  }
};

// node_modules/luxon/src/zones/IANAZone.js
var dtfCache = /* @__PURE__ */ new Map();
function makeDTF(zoneName) {
  let dtf = dtfCache.get(zoneName);
  if (dtf === void 0) {
    dtf = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zoneName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short"
    });
    dtfCache.set(zoneName, dtf);
  }
  return dtf;
}
var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6
};
function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}
function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];
    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined2(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}
var ianaZoneCache = /* @__PURE__ */ new Map();
var IANAZone = class _IANAZone extends Zone {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name) {
    let zone = ianaZoneCache.get(name);
    if (zone === void 0) {
      ianaZoneCache.set(name, zone = new _IANAZone(name));
    }
    return zone;
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache.clear();
    dtfCache.clear();
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @deprecated For backward compatibility, this forwards to isValidZone, better use `isValidZone()` directly instead.
   * @return {boolean}
   */
  static isValidSpecifier(s2) {
    return this.isValidZone(s2);
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone) {
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }
  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = _IANAZone.isValidZone(name);
  }
  /**
   * The type of zone. `iana` for all instances of `IANAZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "iana";
  }
  /**
   * The name of this zone (i.e. the IANA zone name).
   * @override
   * @type {string}
   */
  get name() {
    return this.zoneName;
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns false for all IANA zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return false;
  }
  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @override
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    if (!this.valid) return NaN;
    const date = new Date(ts);
    if (isNaN(date)) return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
    if (adOrBc === "BC") {
      year = -Math.abs(year) + 1;
    }
    const adjustedHour = hour === 24 ? 0 : hour;
    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0
    });
    let asTS = +date;
    const over = asTS % 1e3;
    asTS -= over >= 0 ? over : 1e3 + over;
    return (asUTC - asTS) / (60 * 1e3);
  }
  /**
   * Return whether this Zone is equal to another zone
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  /**
   * Return whether this Zone is valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return this.valid;
  }
};

// node_modules/luxon/src/impl/locale.js
var intlLFCache = {};
function getCachedLF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlLFCache[key];
  if (!dtf) {
    dtf = new Intl.ListFormat(locString, opts);
    intlLFCache[key] = dtf;
  }
  return dtf;
}
var intlDTCache = /* @__PURE__ */ new Map();
function getCachedDTF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache.get(key);
  if (dtf === void 0) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache.set(key, dtf);
  }
  return dtf;
}
var intlNumCache = /* @__PURE__ */ new Map();
function getCachedINF(locString, opts = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache.get(key);
  if (inf === void 0) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache.set(key, inf);
  }
  return inf;
}
var intlRelCache = /* @__PURE__ */ new Map();
function getCachedRTF(locString, opts = {}) {
  const { base, ...cacheKeyOpts } = opts;
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache.get(key);
  if (inf === void 0) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache.set(key, inf);
  }
  return inf;
}
var sysLocaleCache = null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}
var intlResolvedOptionsCache = /* @__PURE__ */ new Map();
function getCachedIntResolvedOptions(locString) {
  let opts = intlResolvedOptionsCache.get(locString);
  if (opts === void 0) {
    opts = new Intl.DateTimeFormat(locString).resolvedOptions();
    intlResolvedOptionsCache.set(locString, opts);
  }
  return opts;
}
var weekInfoCache = /* @__PURE__ */ new Map();
function getCachedWeekInfo(locString) {
  let data2 = weekInfoCache.get(locString);
  if (!data2) {
    const locale = new Intl.Locale(locString);
    data2 = "getWeekInfo" in locale ? locale.getWeekInfo() : locale.weekInfo;
    if (!("minimalDays" in data2)) {
      data2 = { ...fallbackWeekSettings, ...data2 };
    }
    weekInfoCache.set(locString, data2);
  }
  return data2;
}
function parseLocaleString(localeStr) {
  const xIndex = localeStr.indexOf("-x-");
  if (xIndex !== -1) {
    localeStr = localeStr.substring(0, xIndex);
  }
  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    let selectedStr;
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
      selectedStr = localeStr;
    } catch (e) {
      const smaller = localeStr.substring(0, uIndex);
      options = getCachedDTF(smaller).resolvedOptions();
      selectedStr = smaller;
    }
    const { numberingSystem, calendar } = options;
    return [selectedStr, numberingSystem, calendar];
  }
}
function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (outputCalendar || numberingSystem) {
    if (!localeStr.includes("-u-")) {
      localeStr += "-u";
    }
    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }
    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}
function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime.utc(2009, i, 1);
    ms.push(f(dt));
  }
  return ms;
}
function mapWeekdays(f) {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}
function listStuff(loc, length, englishFn, intlFn) {
  const mode = loc.listingMode();
  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}
function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || getCachedIntResolvedOptions(loc.locale).numberingSystem === "latn";
  }
}
var PolyNumberFormatter = class {
  constructor(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;
    const { padTo, floor, ...otherOpts } = opts;
    if (!forceSimple || Object.keys(otherOpts).length > 0) {
      const intlOpts = { useGrouping: false, ...opts };
      if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }
  format(i) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
      return padStart(fixed, this.padTo);
    }
  }
};
var PolyDateFormatter = class {
  constructor(dt, intl, opts) {
    this.opts = opts;
    this.originalZone = void 0;
    let z = void 0;
    if (this.opts.timeZone) {
      this.dt = dt;
    } else if (dt.zone.type === "fixed") {
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
        z = offsetZ;
        this.dt = dt;
      } else {
        z = "UTC";
        this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({ minutes: dt.offset });
        this.originalZone = dt.zone;
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else if (dt.zone.type === "iana") {
      this.dt = dt;
      z = dt.zone.name;
    } else {
      z = "UTC";
      this.dt = dt.setZone("UTC").plus({ minutes: dt.offset });
      this.originalZone = dt.zone;
    }
    const intlOpts = { ...this.opts };
    intlOpts.timeZone = intlOpts.timeZone || z;
    this.dtf = getCachedDTF(intl, intlOpts);
  }
  format() {
    if (this.originalZone) {
      return this.formatToParts().map(({ value }) => value).join("");
    }
    return this.dtf.format(this.dt.toJSDate());
  }
  formatToParts() {
    const parts = this.dtf.formatToParts(this.dt.toJSDate());
    if (this.originalZone) {
      return parts.map((part) => {
        if (part.type === "timeZoneName") {
          const offsetName = this.originalZone.offsetName(this.dt.ts, {
            locale: this.dt.locale,
            format: this.opts.timeZoneName
          });
          return {
            ...part,
            value: offsetName
          };
        } else {
          return part;
        }
      });
    }
    return parts;
  }
  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
};
var PolyRelFormatter = class {
  constructor(intl, isEnglish, opts) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }
  format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }
  formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  }
};
var fallbackWeekSettings = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7]
};
var Locale = class _Locale {
  static fromOpts(opts) {
    return _Locale.create(
      opts.locale,
      opts.numberingSystem,
      opts.outputCalendar,
      opts.weekSettings,
      opts.defaultToEN
    );
  }
  static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
    const specifiedLocale = locale || Settings.defaultLocale;
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new _Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }
  static resetCache() {
    sysLocaleCache = null;
    intlDTCache.clear();
    intlNumCache.clear();
    intlRelCache.clear();
    intlResolvedOptionsCache.clear();
    weekInfoCache.clear();
  }
  static fromObject({ locale, numberingSystem, outputCalendar, weekSettings } = {}) {
    return _Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }
  constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }
  get fastNumbers() {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = supportsFastNumbers(this);
    }
    return this.fastNumbersCached;
  }
  listingMode() {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }
  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return _Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        validateWeekSettings(alts.weekSettings) || this.weekSettings,
        alts.defaultToEN || false
      );
    }
  }
  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }
  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }
  months(length, format = false) {
    return listStuff(this, length, months, () => {
      const monthSpecialCase = this.intl === "ja" || this.intl.startsWith("ja-");
      format &= !monthSpecialCase;
      const intl = format ? { month: length, day: "numeric" } : { month: length }, formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        const mapper = !monthSpecialCase ? (dt) => this.extract(dt, intl, "month") : (dt) => this.dtFormatter(dt, intl).format();
        this.monthsCache[formatStr][length] = mapMonths(mapper);
      }
      return this.monthsCache[formatStr][length];
    });
  }
  weekdays(length, format = false) {
    return listStuff(this, length, weekdays, () => {
      const intl = format ? { weekday: length, year: "numeric", month: "long", day: "numeric" } : { weekday: length }, formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays(
          (dt) => this.extract(dt, intl, "weekday")
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }
  meridiems() {
    return listStuff(
      this,
      void 0,
      () => meridiems,
      () => {
        if (!this.meridiemCache) {
          const intl = { hour: "numeric", hourCycle: "h12" };
          this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(
            (dt) => this.extract(dt, intl, "dayperiod")
          );
        }
        return this.meridiemCache;
      }
    );
  }
  eras(length) {
    return listStuff(this, length, eras, () => {
      const intl = { era: length };
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(
          (dt) => this.extract(dt, intl, "era")
        );
      }
      return this.eraCache[length];
    });
  }
  extract(dt, intlOpts, field) {
    const df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find((m) => m.type.toLowerCase() === field);
    return matching ? matching.value : null;
  }
  numberFormatter(opts = {}) {
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }
  dtFormatter(dt, intlOpts = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }
  relFormatter(opts = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }
  listFormatter(opts = {}) {
    return getCachedLF(this.intl, opts);
  }
  isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || getCachedIntResolvedOptions(this.intl).locale.startsWith("en-us");
  }
  getWeekSettings() {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }
  getStartOfWeek() {
    return this.getWeekSettings().firstDay;
  }
  getMinDaysInFirstWeek() {
    return this.getWeekSettings().minimalDays;
  }
  getWeekendDays() {
    return this.getWeekSettings().weekend;
  }
  equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  }
  toString() {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
};

// node_modules/luxon/src/zones/fixedOffsetZone.js
var singleton2 = null;
var FixedOffsetZone = class _FixedOffsetZone extends Zone {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    if (singleton2 === null) {
      singleton2 = new _FixedOffsetZone(0);
    }
    return singleton2;
  }
  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset2) {
    return offset2 === 0 ? _FixedOffsetZone.utcInstance : new _FixedOffsetZone(offset2);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(s2) {
    if (s2) {
      const r = s2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new _FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }
  constructor(offset2) {
    super();
    this.fixed = offset2;
  }
  /**
   * The type of zone. `fixed` for all instances of `FixedOffsetZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "fixed";
  }
  /**
   * The name of this zone.
   * All fixed zones' names always start with "UTC" (plus optional offset)
   * @override
   * @type {string}
   */
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }
  /**
   * The IANA name of this zone, i.e. `Etc/UTC` or `Etc/GMT+/-nn`
   *
   * @override
   * @type {string}
   */
  get ianaName() {
    if (this.fixed === 0) {
      return "Etc/UTC";
    } else {
      return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
    }
  }
  /**
   * Returns the offset's common name at the specified timestamp.
   *
   * For fixed offset zones this equals to the zone name.
   * @override
   */
  offsetName() {
    return this.name;
  }
  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    return formatOffset(this.fixed, format);
  }
  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns true for all fixed offset zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
    return true;
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   *
   * For fixed offset zones, this is constant and does not depend on a timestamp.
   * @override
   * @return {number}
   */
  offset() {
    return this.fixed;
  }
  /**
   * Return whether this Zone is equal to another zone (i.e. also fixed and same offset)
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  /**
   * Return whether this Zone is valid:
   * All fixed offset zones are valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return true;
  }
};

// node_modules/luxon/src/zones/invalidZone.js
var InvalidZone = class extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }
  /** @override **/
  get type() {
    return "invalid";
  }
  /** @override **/
  get name() {
    return this.zoneName;
  }
  /** @override **/
  get isUniversal() {
    return false;
  }
  /** @override **/
  offsetName() {
    return null;
  }
  /** @override **/
  formatOffset() {
    return "";
  }
  /** @override **/
  offset() {
    return NaN;
  }
  /** @override **/
  equals() {
    return false;
  }
  /** @override **/
  get isValid() {
    return false;
  }
};

// node_modules/luxon/src/impl/zoneUtil.js
function normalizeZone(input, defaultZone2) {
  let offset2;
  if (isUndefined2(input) || input === null) {
    return defaultZone2;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString2(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone2;
    else if (lowered === "local" || lowered === "system") return SystemZone.instance;
    else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
    else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
  } else if (isNumber2(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
    return input;
  } else {
    return new InvalidZone(input);
  }
}

// node_modules/luxon/src/impl/digits.js
var numberingSystems = {
  arab: "[\u0660-\u0669]",
  arabext: "[\u06F0-\u06F9]",
  bali: "[\u1B50-\u1B59]",
  beng: "[\u09E6-\u09EF]",
  deva: "[\u0966-\u096F]",
  fullwide: "[\uFF10-\uFF19]",
  gujr: "[\u0AE6-\u0AEF]",
  hanidec: "[\u3007|\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D]",
  khmr: "[\u17E0-\u17E9]",
  knda: "[\u0CE6-\u0CEF]",
  laoo: "[\u0ED0-\u0ED9]",
  limb: "[\u1946-\u194F]",
  mlym: "[\u0D66-\u0D6F]",
  mong: "[\u1810-\u1819]",
  mymr: "[\u1040-\u1049]",
  orya: "[\u0B66-\u0B6F]",
  tamldec: "[\u0BE6-\u0BEF]",
  telu: "[\u0C66-\u0C6F]",
  thai: "[\u0E50-\u0E59]",
  tibt: "[\u0F20-\u0F29]",
  latn: "\\d"
};
var numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
};
var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}
var digitRegexCache = /* @__PURE__ */ new Map();
function resetDigitRegexCache() {
  digitRegexCache.clear();
}
function digitRegex({ numberingSystem }, append = "") {
  const ns = numberingSystem || "latn";
  let appendCache = digitRegexCache.get(ns);
  if (appendCache === void 0) {
    appendCache = /* @__PURE__ */ new Map();
    digitRegexCache.set(ns, appendCache);
  }
  let regex = appendCache.get(append);
  if (regex === void 0) {
    regex = new RegExp(`${numberingSystems[ns]}${append}`);
    appendCache.set(append, regex);
  }
  return regex;
}

// node_modules/luxon/src/settings.js
var now = () => Date.now();
var defaultZone = "system";
var defaultLocale = null;
var defaultNumberingSystem = null;
var defaultOutputCalendar = null;
var twoDigitCutoffYear = 60;
var throwOnInvalid;
var defaultWeekSettings = null;
var Settings = class {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }
  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n2) {
    now = n2;
  }
  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(zone) {
    defaultZone = zone;
  }
  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }
  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return defaultLocale;
  }
  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale) {
    defaultLocale = locale;
  }
  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }
  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem) {
    defaultNumberingSystem = numberingSystem;
  }
  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }
  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar) {
    defaultOutputCalendar = outputCalendar;
  }
  /**
   * @typedef {Object} WeekSettings
   * @property {number} firstDay
   * @property {number} minimalDays
   * @property {number[]} weekend
   */
  /**
   * @return {WeekSettings|null}
   */
  static get defaultWeekSettings() {
    return defaultWeekSettings;
  }
  /**
   * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
   * how many days are required in the first week of a year.
   * Does not affect existing instances.
   *
   * @param {WeekSettings|null} weekSettings
   */
  static set defaultWeekSettings(weekSettings) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }
  /**
   * Get the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   */
  static get twoDigitCutoffYear() {
    return twoDigitCutoffYear;
  }
  /**
   * Set the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   * @example Settings.twoDigitCutoffYear = 0 // all 'yy' are interpreted as 20th century
   * @example Settings.twoDigitCutoffYear = 99 // all 'yy' are interpreted as 21st century
   * @example Settings.twoDigitCutoffYear = 50 // '49' -> 2049; '50' -> 1950
   * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
   * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
   */
  static set twoDigitCutoffYear(cutoffYear) {
    twoDigitCutoffYear = cutoffYear % 100;
  }
  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static get throwOnInvalid() {
    return throwOnInvalid;
  }
  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(t) {
    throwOnInvalid = t;
  }
  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
    DateTime.resetCache();
    resetDigitRegexCache();
  }
};

// node_modules/luxon/src/impl/invalid.js
var Invalid = class {
  constructor(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }
  toMessage() {
    if (this.explanation) {
      return `${this.reason}: ${this.explanation}`;
    } else {
      return this.reason;
    }
  }
};

// node_modules/luxon/src/impl/conversions.js
var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
var leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
function unitOutOfRange(unit, value) {
  return new Invalid(
    "unit out of range",
    `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`
  );
}
function dayOfWeek(year, month, day) {
  const d2 = new Date(Date.UTC(year, month - 1, day));
  if (year < 100 && year >= 0) {
    d2.setUTCFullYear(d2.getUTCFullYear() - 1900);
  }
  const js = d2.getUTCDay();
  return js === 0 ? 7 : js;
}
function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}
function uncomputeOrdinal(year, ordinal) {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i) => i < ordinal), day = ordinal - table[month0];
  return { month: month0 + 1, day };
}
function isoWeekdayToLocal(isoWeekday, startOfWeek) {
  return (isoWeekday - startOfWeek + 7) % 7 + 1;
}
function gregorianToWeek(gregObj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { year, month, day } = gregObj, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
  let weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
  } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }
  return { weekYear, weekNumber, weekday, ...timeObject(gregObj) };
}
function weekToGregorian(weekData, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const { weekYear, weekNumber, weekday } = weekData, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
  let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(weekData) };
}
function gregorianToOrdinal(gregData) {
  const { year, month, day } = gregData;
  const ordinal = computeOrdinal(year, month, day);
  return { year, ordinal, ...timeObject(gregData) };
}
function ordinalToGregorian(ordinalData) {
  const { year, ordinal } = ordinalData;
  const { month, day } = uncomputeOrdinal(year, ordinal);
  return { year, month, day, ...timeObject(ordinalData) };
}
function usesLocalWeekValues(obj, loc) {
  const hasLocaleWeekData = !isUndefined2(obj.localWeekday) || !isUndefined2(obj.localWeekNumber) || !isUndefined2(obj.localWeekYear);
  if (hasLocaleWeekData) {
    const hasIsoWeekData = !isUndefined2(obj.weekday) || !isUndefined2(obj.weekNumber) || !isUndefined2(obj.weekYear);
    if (hasIsoWeekData) {
      throw new ConflictingSpecificationError(
        "Cannot mix locale-based week fields with ISO-based week fields"
      );
    }
    if (!isUndefined2(obj.localWeekday)) obj.weekday = obj.localWeekday;
    if (!isUndefined2(obj.localWeekNumber)) obj.weekNumber = obj.localWeekNumber;
    if (!isUndefined2(obj.localWeekYear)) obj.weekYear = obj.localWeekYear;
    delete obj.localWeekday;
    delete obj.localWeekNumber;
    delete obj.localWeekYear;
    return {
      minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
      startOfWeek: loc.getStartOfWeek()
    };
  } else {
    return { minDaysInFirstWeek: 4, startOfWeek: 1 };
  }
}
function hasInvalidWeekData(obj, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const validYear = isInteger(obj.weekYear), validWeek = integerBetween(
    obj.weekNumber,
    1,
    weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)
  ), validWeekday = integerBetween(obj.weekday, 1, 7);
  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.weekNumber);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else return false;
}
function hasInvalidOrdinalData(obj) {
  const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else return false;
}
function hasInvalidGregorianData(obj) {
  const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else return false;
}
function hasInvalidTimeData(obj) {
  const { hour, minute, second, millisecond } = obj;
  const validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else return false;
}

// node_modules/luxon/src/impl/util.js
function isUndefined2(o) {
  return typeof o === "undefined";
}
function isNumber2(o) {
  return typeof o === "number";
}
function isInteger(o) {
  return typeof o === "number" && o % 1 === 0;
}
function isString2(o) {
  return typeof o === "string";
}
function isDate(o) {
  return Object.prototype.toString.call(o) === "[object Date]";
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}
function hasLocaleWeekInfo() {
  try {
    return typeof Intl !== "undefined" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
  } catch (e) {
    return false;
  }
}
function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare2) {
  if (arr.length === 0) {
    return void 0;
  }
  return arr.reduce((best, next) => {
    const pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare2(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys) {
  return keys.reduce((a, k) => {
    a[k] = obj[k];
    return a;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
function validateWeekSettings(settings) {
  if (settings == null) {
    return null;
  } else if (typeof settings !== "object") {
    throw new InvalidArgumentError("Week settings must be an object");
  } else {
    if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some((v) => !integerBetween(v, 1, 7))) {
      throw new InvalidArgumentError("Invalid week settings");
    }
    return {
      firstDay: settings.firstDay,
      minimalDays: settings.minimalDays,
      weekend: Array.from(settings.weekend)
    };
  }
}
function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
}
function floorMod(x, n2) {
  return x - n2 * Math.floor(x / n2);
}
function padStart(input, n2 = 2) {
  const isNeg = input < 0;
  let padded;
  if (isNeg) {
    padded = "-" + ("" + -input).padStart(n2, "0");
  } else {
    padded = ("" + input).padStart(n2, "0");
  }
  return padded;
}
function parseInteger(string) {
  if (isUndefined2(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseInt(string, 10);
  }
}
function parseFloating(string) {
  if (isUndefined2(string) || string === null || string === "") {
    return void 0;
  } else {
    return parseFloat(string);
  }
}
function parseMillis(fraction) {
  if (isUndefined2(fraction) || fraction === null || fraction === "") {
    return void 0;
  } else {
    const f = parseFloat("0." + fraction) * 1e3;
    return Math.floor(f);
  }
}
function roundTo(number, digits, rounding = "round") {
  const factor = 10 ** digits;
  switch (rounding) {
    case "expand":
      return number > 0 ? Math.ceil(number * factor) / factor : Math.floor(number * factor) / factor;
    case "trunc":
      return Math.trunc(number * factor) / factor;
    case "round":
      return Math.round(number * factor) / factor;
    case "floor":
      return Math.floor(number * factor) / factor;
    case "ceil":
      return Math.ceil(number * factor) / factor;
    default:
      throw new RangeError(`Value rounding ${rounding} is out of range`);
  }
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}
function objToLocalTS(obj) {
  let d2 = Date.UTC(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second,
    obj.millisecond
  );
  if (obj.year < 100 && obj.year >= 0) {
    d2 = new Date(d2);
    d2.setUTCFullYear(obj.year, obj.month - 1, obj.day);
  }
  return +d2;
}
function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
  const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
  return -fwdlw + minDaysInFirstWeek - 1;
}
function weeksInWeekYear(weekYear, minDaysInFirstWeek = 4, startOfWeek = 1) {
  const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
  const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
  return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > Settings.twoDigitCutoffYear ? 1900 + year : 2e3 + year;
}
function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
  const date = new Date(ts), intlOpts = {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };
  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }
  const modified = { timeZoneName: offsetFormat, ...intlOpts };
  const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m) => m.type.toLowerCase() === "timezonename");
  return parsed ? parsed.value : null;
}
function signedOffset(offHourStr, offMinuteStr) {
  let offHour = parseInt(offHourStr, 10);
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }
  const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}
function asNumber(value) {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || !Number.isFinite(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}
function normalizeObject(obj, normalizer) {
  const normalized = {};
  for (const u in obj) {
    if (hasOwnProperty(obj, u)) {
      const v = obj[u];
      if (v === void 0 || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }
  return normalized;
}
function formatOffset(offset2, format) {
  const hours = Math.trunc(Math.abs(offset2 / 60)), minutes = Math.trunc(Math.abs(offset2 % 60)), sign = offset2 >= 0 ? "+" : "-";
  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}

// node_modules/luxon/src/impl/english.js
var monthsLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return [...monthsNarrow];
    case "short":
      return [...monthsShort];
    case "long":
      return [...monthsLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    default:
      return null;
  }
}
var weekdaysLong = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return [...weekdaysNarrow];
    case "short":
      return [...weekdaysShort];
    case "long":
      return [...weekdaysLong];
    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];
    default:
      return null;
  }
}
var meridiems = ["AM", "PM"];
var erasLong = ["Before Christ", "Anno Domini"];
var erasShort = ["BC", "AD"];
var erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return [...erasNarrow];
    case "short":
      return [...erasShort];
    case "long":
      return [...erasLong];
    default:
      return null;
  }
}
function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}
function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}
function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
  const units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
  if (numeric === "auto" && lastable) {
    const isDay = unit === "days";
    switch (count) {
      case 1:
        return isDay ? "tomorrow" : `next ${units[unit][0]}`;
      case -1:
        return isDay ? "yesterday" : `last ${units[unit][0]}`;
      case 0:
        return isDay ? "today" : `this ${units[unit][0]}`;
      default:
    }
  }
  const isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
}

// node_modules/luxon/src/impl/formatter.js
function stringifyTokens(splits, tokenToString) {
  let s2 = "";
  for (const token of splits) {
    if (token.literal) {
      s2 += token.val;
    } else {
      s2 += tokenToString(token.val);
    }
  }
  return s2;
}
var macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};
var Formatter = class _Formatter {
  static create(locale, opts = {}) {
    return new _Formatter(locale, opts);
  }
  static parseFormat(fmt) {
    let current = null, currentFull = "", bracketed = false;
    const splits = [];
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0 || bracketed) {
          splits.push({
            literal: bracketed || /^\s+$/.test(currentFull),
            val: currentFull === "" ? "'" : currentFull
          });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: /^\s+$/.test(currentFull), val: currentFull });
        }
        currentFull = c;
        current = c;
      }
    }
    if (currentFull.length > 0) {
      splits.push({ literal: bracketed || /^\s+$/.test(currentFull), val: currentFull });
    }
    return splits;
  }
  static macroTokenToFormatOpts(token) {
    return macroTokenToFormatOpts[token];
  }
  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }
  formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }
  dtFormatter(dt, opts = {}) {
    return this.loc.dtFormatter(dt, { ...this.opts, ...opts });
  }
  formatDateTime(dt, opts) {
    return this.dtFormatter(dt, opts).format();
  }
  formatDateTimeParts(dt, opts) {
    return this.dtFormatter(dt, opts).formatToParts();
  }
  formatInterval(interval, opts) {
    const df = this.dtFormatter(interval.start, opts);
    return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
  }
  resolvedOptions(dt, opts) {
    return this.dtFormatter(dt, opts).resolvedOptions();
  }
  num(n2, p = 0, signDisplay = void 0) {
    if (this.opts.forceSimple) {
      return padStart(n2, p);
    }
    const opts = { ...this.opts };
    if (p > 0) {
      opts.padTo = p;
    }
    if (signDisplay) {
      opts.signDisplay = signDisplay;
    }
    return this.loc.numberFormatter(opts).format(n2);
  }
  formatDateTimeFromString(dt, fmt) {
    const knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = (opts, extract) => this.loc.extract(dt, opts, extract), formatOffset2 = (opts) => {
      if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
        return "Z";
      }
      return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
    }, meridiem = () => knownEnglish ? meridiemForDateTime(dt) : string({ hour: "numeric", hourCycle: "h12" }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt, length) : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt, length) : string(
      standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" },
      "weekday"
    ), maybeMacro = (token) => {
      const formatOpts = _Formatter.macroTokenToFormatOpts(token);
      if (formatOpts) {
        return this.formatWithSystemDefault(dt, formatOpts);
      } else {
        return token;
      }
    }, era = (length) => knownEnglish ? eraForDateTime(dt, length) : string({ era: length }, "era"), tokenToString = (token) => {
      switch (token) {
        // ms
        case "S":
          return this.num(dt.millisecond);
        case "u":
        // falls through
        case "SSS":
          return this.num(dt.millisecond, 3);
        // seconds
        case "s":
          return this.num(dt.second);
        case "ss":
          return this.num(dt.second, 2);
        // fractional seconds
        case "uu":
          return this.num(Math.floor(dt.millisecond / 10), 2);
        case "uuu":
          return this.num(Math.floor(dt.millisecond / 100));
        // minutes
        case "m":
          return this.num(dt.minute);
        case "mm":
          return this.num(dt.minute, 2);
        // hours
        case "h":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
        case "hh":
          return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
        case "H":
          return this.num(dt.hour);
        case "HH":
          return this.num(dt.hour, 2);
        // offset
        case "Z":
          return formatOffset2({ format: "narrow", allowZ: this.opts.allowZ });
        case "ZZ":
          return formatOffset2({ format: "short", allowZ: this.opts.allowZ });
        case "ZZZ":
          return formatOffset2({ format: "techie", allowZ: this.opts.allowZ });
        case "ZZZZ":
          return dt.zone.offsetName(dt.ts, { format: "short", locale: this.loc.locale });
        case "ZZZZZ":
          return dt.zone.offsetName(dt.ts, { format: "long", locale: this.loc.locale });
        // zone
        case "z":
          return dt.zoneName;
        // meridiems
        case "a":
          return meridiem();
        // dates
        case "d":
          return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt.day);
        case "dd":
          return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt.day, 2);
        // weekdays - standalone
        case "c":
          return this.num(dt.weekday);
        case "ccc":
          return weekday("short", true);
        case "cccc":
          return weekday("long", true);
        case "ccccc":
          return weekday("narrow", true);
        // weekdays - format
        case "E":
          return this.num(dt.weekday);
        case "EEE":
          return weekday("short", false);
        case "EEEE":
          return weekday("long", false);
        case "EEEEE":
          return weekday("narrow", false);
        // months - standalone
        case "L":
          return useDateTimeFormatter ? string({ month: "numeric", day: "numeric" }, "month") : this.num(dt.month);
        case "LL":
          return useDateTimeFormatter ? string({ month: "2-digit", day: "numeric" }, "month") : this.num(dt.month, 2);
        case "LLL":
          return month("short", true);
        case "LLLL":
          return month("long", true);
        case "LLLLL":
          return month("narrow", true);
        // months - format
        case "M":
          return useDateTimeFormatter ? string({ month: "numeric" }, "month") : this.num(dt.month);
        case "MM":
          return useDateTimeFormatter ? string({ month: "2-digit" }, "month") : this.num(dt.month, 2);
        case "MMM":
          return month("short", false);
        case "MMMM":
          return month("long", false);
        case "MMMMM":
          return month("narrow", false);
        // years
        case "y":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year);
        case "yy":
          return useDateTimeFormatter ? string({ year: "2-digit" }, "year") : this.num(dt.year.toString().slice(-2), 2);
        case "yyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year, 4);
        case "yyyyyy":
          return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year, 6);
        // eras
        case "G":
          return era("short");
        case "GG":
          return era("long");
        case "GGGGG":
          return era("narrow");
        case "kk":
          return this.num(dt.weekYear.toString().slice(-2), 2);
        case "kkkk":
          return this.num(dt.weekYear, 4);
        case "W":
          return this.num(dt.weekNumber);
        case "WW":
          return this.num(dt.weekNumber, 2);
        case "n":
          return this.num(dt.localWeekNumber);
        case "nn":
          return this.num(dt.localWeekNumber, 2);
        case "ii":
          return this.num(dt.localWeekYear.toString().slice(-2), 2);
        case "iiii":
          return this.num(dt.localWeekYear, 4);
        case "o":
          return this.num(dt.ordinal);
        case "ooo":
          return this.num(dt.ordinal, 3);
        case "q":
          return this.num(dt.quarter);
        case "qq":
          return this.num(dt.quarter, 2);
        case "X":
          return this.num(Math.floor(dt.ts / 1e3));
        case "x":
          return this.num(dt.ts);
        default:
          return maybeMacro(token);
      }
    };
    return stringifyTokens(_Formatter.parseFormat(fmt), tokenToString);
  }
  formatDurationFromString(dur, fmt) {
    const invertLargest = this.opts.signMode === "negativeLargestOnly" ? -1 : 1;
    const tokenToField = (token) => {
      switch (token[0]) {
        case "S":
          return "milliseconds";
        case "s":
          return "seconds";
        case "m":
          return "minutes";
        case "h":
          return "hours";
        case "d":
          return "days";
        case "w":
          return "weeks";
        case "M":
          return "months";
        case "y":
          return "years";
        default:
          return null;
      }
    }, tokenToString = (lildur, info) => (token) => {
      const mapped = tokenToField(token);
      if (mapped) {
        const inversionFactor = info.isNegativeDuration && mapped !== info.largestUnit ? invertLargest : 1;
        let signDisplay;
        if (this.opts.signMode === "negativeLargestOnly" && mapped !== info.largestUnit) {
          signDisplay = "never";
        } else if (this.opts.signMode === "all") {
          signDisplay = "always";
        } else {
          signDisplay = "auto";
        }
        return this.num(lildur.get(mapped) * inversionFactor, token.length, signDisplay);
      } else {
        return token;
      }
    }, tokens = _Formatter.parseFormat(fmt), realTokens = tokens.reduce(
      (found, { literal, val }) => literal ? found : found.concat(val),
      []
    ), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t) => t)), durationInfo = {
      isNegativeDuration: collapsed < 0,
      // this relies on "collapsed" being based on "shiftTo", which builds up the object
      // in order
      largestUnit: Object.keys(collapsed.values)[0]
    };
    return stringifyTokens(tokens, tokenToString(collapsed, durationInfo));
  }
};

// node_modules/luxon/src/impl/regexParser.js
var ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
function combineRegexes(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, "");
  return RegExp(`^${full}$`);
}
function combineExtractors(...extractors) {
  return (m) => extractors.reduce(
    ([mergedVals, mergedZone, cursor], ex) => {
      const [val, zone, next] = ex(m, cursor);
      return [{ ...mergedVals, ...val }, zone || mergedZone, next];
    },
    [{}, null, 1]
  ).slice(0, 2);
}
function parse2(s2, ...patterns) {
  if (s2 == null) {
    return [null, null];
  }
  for (const [regex, extractor] of patterns) {
    const m = regex.exec(s2);
    if (m) {
      return extractor(m);
    }
  }
  return [null, null];
}
function simpleParse(...keys) {
  return (match2, cursor) => {
    const ret = {};
    let i;
    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match2[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}
var offsetRegex = /(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/;
var isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
var isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
var isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
var isoTimeExtensionRegex = RegExp(`(?:[Tt]${isoTimeRegex.source})?`);
var isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
var isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
var isoOrdinalRegex = /(\d{4})-?(\d{3})/;
var extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
var extractISOOrdinalData = simpleParse("year", "ordinal");
var sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
var sqlTimeRegex = RegExp(
  `${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`
);
var sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
function int(match2, pos, fallback) {
  const m = match2[pos];
  return isUndefined2(m) ? fallback : parseInteger(m);
}
function extractISOYmd(match2, cursor) {
  const item = {
    year: int(match2, cursor),
    month: int(match2, cursor + 1, 1),
    day: int(match2, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}
function extractISOTime(match2, cursor) {
  const item = {
    hours: int(match2, cursor, 0),
    minutes: int(match2, cursor + 1, 0),
    seconds: int(match2, cursor + 2, 0),
    milliseconds: parseMillis(match2[cursor + 3])
  };
  return [item, null, cursor + 4];
}
function extractISOOffset(match2, cursor) {
  const local = !match2[cursor] && !match2[cursor + 1], fullOffset = signedOffset(match2[cursor + 1], match2[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}
function extractIANAZone(match2, cursor) {
  const zone = match2[cursor] ? IANAZone.create(match2[cursor]) : null;
  return [{}, zone, cursor + 1];
}
var isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
var isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
function extractISODuration(match2) {
  const [s2, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match2;
  const hasNegativePrefix = s2[0] === "-";
  const negativeSeconds = secondStr && secondStr[0] === "-";
  const maybeNegate = (num, force = false) => num !== void 0 && (force || num && hasNegativePrefix) ? -num : num;
  return [
    {
      years: maybeNegate(parseFloating(yearStr)),
      months: maybeNegate(parseFloating(monthStr)),
      weeks: maybeNegate(parseFloating(weekStr)),
      days: maybeNegate(parseFloating(dayStr)),
      hours: maybeNegate(parseFloating(hourStr)),
      minutes: maybeNegate(parseFloating(minuteStr)),
      seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
      milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
    }
  ];
}
var obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr) result.second = parseInteger(secondStr);
  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }
  return result;
}
var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
function extractRFC2822(match2) {
  const [
    ,
    weekdayStr,
    dayStr,
    monthStr,
    yearStr,
    hourStr,
    minuteStr,
    secondStr,
    obsOffset,
    milOffset,
    offHourStr,
    offMinuteStr
  ] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  let offset2;
  if (obsOffset) {
    offset2 = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset2 = 0;
  } else {
    offset2 = signedOffset(offHourStr, offMinuteStr);
  }
  return [result, new FixedOffsetZone(offset2)];
}
function preprocessRFC2822(s2) {
  return s2.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
}
var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/;
var rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/;
var ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
function extractRFC1123Or850(match2) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
function extractASCII(match2) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}
var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
var extractISOYmdTimeAndOffset = combineExtractors(
  extractISOYmd,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
var extractISOWeekTimeAndOffset = combineExtractors(
  extractISOWeekData,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
var extractISOOrdinalDateAndTime = combineExtractors(
  extractISOOrdinalData,
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
var extractISOTimeAndOffset = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
function parseISODate(s2) {
  return parse2(
    s2,
    [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset],
    [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime],
    [isoTimeCombinedRegex, extractISOTimeAndOffset]
  );
}
function parseRFC2822Date(s2) {
  return parse2(preprocessRFC2822(s2), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s2) {
  return parse2(
    s2,
    [rfc1123, extractRFC1123Or850],
    [rfc850, extractRFC1123Or850],
    [ascii, extractASCII]
  );
}
function parseISODuration(s2) {
  return parse2(s2, [isoDuration, extractISODuration]);
}
var extractISOTimeOnly = combineExtractors(extractISOTime);
function parseISOTimeOnly(s2) {
  return parse2(s2, [isoTimeOnly, extractISOTimeOnly]);
}
var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
var extractISOTimeOffsetAndIANAZone = combineExtractors(
  extractISOTime,
  extractISOOffset,
  extractIANAZone
);
function parseSQL(s2) {
  return parse2(
    s2,
    [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset],
    [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]
  );
}

// node_modules/luxon/src/duration.js
var INVALID = "Invalid Duration";
var lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1e3
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1e3
  },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1e3 },
  minutes: { seconds: 60, milliseconds: 60 * 1e3 },
  seconds: { milliseconds: 1e3 }
};
var casualMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1e3
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
};
var daysInYearAccurate = 146097 / 400;
var daysInMonthAccurate = 146097 / 4800;
var accurateMatrix = {
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1e3
  },
  ...lowOrderMatrix
};
var orderedUnits = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds"
];
var reverseUnits = orderedUnits.slice(0).reverse();
function clone(dur, alts, clear = false) {
  const conf = {
    values: clear ? alts.values : { ...dur.values, ...alts.values || {} },
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
    matrix: alts.matrix || dur.matrix
  };
  return new Duration(conf);
}
function durationToMillis(matrix, vals) {
  let sum = vals.milliseconds ?? 0;
  for (const unit of reverseUnits.slice(1)) {
    if (vals[unit]) {
      sum += vals[unit] * matrix[unit]["milliseconds"];
    }
  }
  return sum;
}
function normalizeValues(matrix, vals) {
  const factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
  orderedUnits.reduceRight((previous, current) => {
    if (!isUndefined2(vals[current])) {
      if (previous) {
        const previousVal = vals[previous] * factor;
        const conv = matrix[current][previous];
        const rollUp = Math.floor(previousVal / conv);
        vals[current] += rollUp * factor;
        vals[previous] -= rollUp * conv * factor;
      }
      return current;
    } else {
      return previous;
    }
  }, null);
  orderedUnits.reduce((previous, current) => {
    if (!isUndefined2(vals[current])) {
      if (previous) {
        const fraction = vals[previous] % 1;
        vals[previous] -= fraction;
        vals[current] += fraction * matrix[previous][current];
      }
      return current;
    } else {
      return previous;
    }
  }, null);
}
function removeZeroes(vals) {
  const newVals = {};
  for (const [key, value] of Object.entries(vals)) {
    if (value !== 0) {
      newVals[key] = value;
    }
  }
  return newVals;
}
var Duration = class _Duration {
  /**
   * @private
   */
  constructor(config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    let matrix = accurate ? accurateMatrix : casualMatrix;
    if (config.matrix) {
      matrix = config.matrix;
    }
    this.values = config.values;
    this.loc = config.loc || Locale.create();
    this.conversionAccuracy = accurate ? "longterm" : "casual";
    this.invalid = config.invalid || null;
    this.matrix = matrix;
    this.isLuxonDuration = true;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  static fromMillis(count, opts) {
    return _Duration.fromObject({ milliseconds: count }, opts);
  }
  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} [opts=[]] - options for creating this Duration
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the custom conversion system to use
   * @return {Duration}
   */
  static fromObject(obj, opts = {}) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError(
        `Duration.fromObject: argument expected to be an object, got ${obj === null ? "null" : typeof obj}`
      );
    }
    return new _Duration({
      values: normalizeObject(obj, _Duration.normalizeUnit),
      loc: Locale.fromObject(opts),
      conversionAccuracy: opts.conversionAccuracy,
      matrix: opts.matrix
    });
  }
  /**
   * Create a Duration from DurationLike.
   *
   * @param {Object | number | Duration} durationLike
   * One of:
   * - object with keys like 'years' and 'hours'.
   * - number representing milliseconds
   * - Duration instance
   * @return {Duration}
   */
  static fromDurationLike(durationLike) {
    if (isNumber2(durationLike)) {
      return _Duration.fromMillis(durationLike);
    } else if (_Duration.isDuration(durationLike)) {
      return durationLike;
    } else if (typeof durationLike === "object") {
      return _Duration.fromObject(durationLike);
    } else {
      throw new InvalidArgumentError(
        `Unknown duration argument ${durationLike} of type ${typeof durationLike}`
      );
    }
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the preset conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text, opts) {
    const [parsed] = parseISODuration(text);
    if (parsed) {
      return _Duration.fromObject(parsed, opts);
    } else {
      return _Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
   * @param {string} [opts.matrix=Object] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  static fromISOTime(text, opts) {
    const [parsed] = parseISOTimeOnly(text);
    if (parsed) {
      return _Duration.fromObject(parsed, opts);
    } else {
      return _Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
    }
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new _Duration({ invalid });
    }
  }
  /**
   * @private
   */
  static normalizeUnit(unit) {
    const normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized) throw new InvalidUnitError(unit);
    return normalized;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDuration(o) {
    return o && o.isLuxonDuration || false;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `w` for weeks
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * Tokens can be escaped by wrapping with single quotes.
   * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @param {'negative'|'all'|'negativeLargestOnly'} [opts.signMode=negative] - How to handle signs
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @example Duration.fromObject({ days: 6, seconds: 2 }).toFormat("d s", { signMode: "all" }) //=> "+6 +2"
   * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "all" }) //=> "-6 -2"
   * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "negativeLargestOnly" }) //=> "-6 2"
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    const fmtOpts = {
      ...opts,
      floor: opts.round !== false && opts.floor !== false
    };
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID;
  }
  /**
   * Returns a string representation of a Duration with all units included.
   * To modify its behavior, use `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
   * @param {Object} opts - Formatting options. Accepts the same keys as the options parameter of the native `Intl.NumberFormat` constructor, as well as `listStyle`.
   * @param {string} [opts.listStyle='narrow'] - How to format the merged list. Corresponds to the `style` property of the options parameter of the native `Intl.ListFormat` constructor.
   * @param {boolean} [opts.showZeros=true] - Show all units previously used by the duration even if they are zero
   * @example
   * ```js
   * var dur = Duration.fromObject({ months: 1, weeks: 0, hours: 5, minutes: 6 })
   * dur.toHuman() //=> '1 month, 0 weeks, 5 hours, 6 minutes'
   * dur.toHuman({ listStyle: "long" }) //=> '1 month, 0 weeks, 5 hours, and 6 minutes'
   * dur.toHuman({ unitDisplay: "short" }) //=> '1 mth, 0 wks, 5 hr, 6 min'
   * dur.toHuman({ showZeros: false }) //=> '1 month, 5 hours, 6 minutes'
   * ```
   */
  toHuman(opts = {}) {
    if (!this.isValid) return INVALID;
    const showZeros = opts.showZeros !== false;
    const l2 = orderedUnits.map((unit) => {
      const val = this.values[unit];
      if (isUndefined2(val) || val === 0 && !showZeros) {
        return null;
      }
      return this.loc.numberFormatter({ style: "unit", unitDisplay: "long", ...opts, unit: unit.slice(0, -1) }).format(val);
    }).filter((n2) => n2);
    return this.loc.listFormatter({ type: "conjunction", style: opts.listStyle || "narrow", ...opts }).format(l2);
  }
  /**
   * Returns a JavaScript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject() {
    if (!this.isValid) return {};
    return { ...this.values };
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    if (!this.isValid) return null;
    let s2 = "P";
    if (this.years !== 0) s2 += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s2 += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s2 += this.weeks + "W";
    if (this.days !== 0) s2 += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
      s2 += "T";
    if (this.hours !== 0) s2 += this.hours + "H";
    if (this.minutes !== 0) s2 += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      s2 += roundTo(this.seconds + this.milliseconds / 1e3, 3) + "S";
    if (s2 === "P") s2 += "T0S";
    return s2;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  toISOTime(opts = {}) {
    if (!this.isValid) return null;
    const millis = this.toMillis();
    if (millis < 0 || millis >= 864e5) return null;
    opts = {
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended",
      ...opts,
      includeOffset: false
    };
    const dateTime = DateTime.fromMillis(millis, { zone: "UTC" });
    return dateTime.toISOTime(opts);
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }
  /**
   * Returns a string representation of this Duration appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Duration { values: ${JSON.stringify(this.values)} }`;
    } else {
      return `Duration { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  toMillis() {
    if (!this.isValid) return NaN;
    return durationToMillis(this.matrix, this.values);
  }
  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration) {
    if (!this.isValid) return this;
    const dur = _Duration.fromDurationLike(duration), result = {};
    for (const k of orderedUnits) {
      if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
        result[k] = dur.get(k) + this.get(k);
      }
    }
    return clone(this, { values: result }, true);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration) {
    if (!this.isValid) return this;
    const dur = _Duration.fromDurationLike(duration);
    return this.plus(dur.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(fn) {
    if (!this.isValid) return this;
    const result = {};
    for (const k of Object.keys(this.values)) {
      result[k] = asNumber(fn(this.values[k], k));
    }
    return clone(this, { values: result }, true);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
   * @return {number}
   */
  get(unit) {
    return this[_Duration.normalizeUnit(unit)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    if (!this.isValid) return this;
    const mixed = { ...this.values, ...normalizeObject(values, _Duration.normalizeUnit) };
    return clone(this, { values: mixed });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({ locale, numberingSystem, conversionAccuracy, matrix } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem });
    const opts = { loc, matrix, conversionAccuracy };
    return clone(this, opts);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * Assuming the overall value of the Duration is positive, this means:
   * - excessive values for lower-order units are converted to higher-order units (if possible, see first and second example)
   * - negative lower-order units are converted to higher order units (there must be such a higher order unit, otherwise
   *   the overall value would be negative, see third example)
   * - fractional values for higher-order units are converted to lower-order units (if possible, see fourth example)
   *
   * If the overall value is negative, the result of this method is equivalent to `this.negate().normalize().negate()`.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ days: 5000 }).normalize().toObject() //=> { days: 5000 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @example Duration.fromObject({ years: 2.5, days: 0, hours: 0 }).normalize().toObject() //=> { years: 2, days: 182, hours: 12 }
   * @return {Duration}
   */
  normalize() {
    if (!this.isValid) return this;
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone(this, { values: vals }, true);
  }
  /**
   * Rescale units to its largest representation
   * @example Duration.fromObject({ milliseconds: 90000 }).rescale().toObject() //=> { minutes: 1, seconds: 30 }
   * @return {Duration}
   */
  rescale() {
    if (!this.isValid) return this;
    const vals = removeZeroes(this.normalize().shiftToAll().toObject());
    return clone(this, { values: vals }, true);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (!this.isValid) return this;
    if (units.length === 0) {
      return this;
    }
    units = units.map((u) => _Duration.normalizeUnit(u));
    const built = {}, accumulated = {}, vals = this.toObject();
    let lastUnit;
    for (const k of orderedUnits) {
      if (units.indexOf(k) >= 0) {
        lastUnit = k;
        let own = 0;
        for (const ak in accumulated) {
          own += this.matrix[ak][k] * accumulated[ak];
          accumulated[ak] = 0;
        }
        if (isNumber2(vals[k])) {
          own += vals[k];
        }
        const i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = (own * 1e3 - i * 1e3) / 1e3;
      } else if (isNumber2(vals[k])) {
        accumulated[k] = vals[k];
      }
    }
    for (const key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }
    normalizeValues(this.matrix, built);
    return clone(this, { values: built }, true);
  }
  /**
   * Shift this Duration to all available units.
   * Same as shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds")
   * @return {Duration}
   */
  shiftToAll() {
    if (!this.isValid) return this;
    return this.shiftTo(
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
      "milliseconds"
    );
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.isValid) return this;
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = this.values[k] === 0 ? 0 : -this.values[k];
    }
    return clone(this, { values: negated }, true);
  }
  /**
   * Removes all units with values equal to 0 from this Duration.
   * @example Duration.fromObject({ years: 2, days: 0, hours: 0, minutes: 0 }).removeZeros().toObject() //=> { years: 2 }
   * @return {Duration}
   */
  removeZeros() {
    if (!this.isValid) return this;
    const vals = removeZeroes(this.values);
    return clone(this, { values: vals }, true);
  }
  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.isValid ? this.values.years || 0 : NaN;
  }
  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.isValid ? this.values.quarters || 0 : NaN;
  }
  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.isValid ? this.values.months || 0 : NaN;
  }
  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.isValid ? this.values.weeks || 0 : NaN;
  }
  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.isValid ? this.values.days || 0 : NaN;
  }
  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.isValid ? this.values.hours || 0 : NaN;
  }
  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.isValid ? this.values.minutes || 0 : NaN;
  }
  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.isValid ? this.values.seconds || 0 : NaN;
  }
  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.isValid ? this.values.milliseconds || 0 : NaN;
  }
  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this Duration became invalid, or null if the Duration is valid
   * @return {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    if (!this.loc.equals(other.loc)) {
      return false;
    }
    function eq(v1, v2) {
      if (v1 === void 0 || v1 === 0) return v2 === void 0 || v2 === 0;
      return v1 === v2;
    }
    for (const u of orderedUnits) {
      if (!eq(this.values[u], other.values[u])) {
        return false;
      }
    }
    return true;
  }
};

// node_modules/luxon/src/interval.js
var INVALID2 = "Invalid Interval";
function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid(
      "end before start",
      `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`
    );
  } else {
    return null;
  }
}
var Interval = class _Interval {
  /**
   * @private
   */
  constructor(config) {
    this.s = config.start;
    this.e = config.end;
    this.invalid = config.invalid || null;
    this.isLuxonInterval = true;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new _Interval({ invalid });
    }
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(start, end) {
    const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
    const validateError = validateStartEnd(builtStart, builtEnd);
    if (validateError == null) {
      return new _Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static after(start, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
    return _Interval.fromDateTimes(dt, dt.plus(dur));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  static before(end, duration) {
    const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
    return _Interval.fromDateTimes(dt.minus(dur), dt);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(text, opts) {
    const [s2, e] = (text || "").split("/", 2);
    if (s2 && e) {
      let start, startIsValid;
      try {
        start = DateTime.fromISO(s2, opts);
        startIsValid = start.isValid;
      } catch (e2) {
        startIsValid = false;
      }
      let end, endIsValid;
      try {
        end = DateTime.fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e2) {
        endIsValid = false;
      }
      if (startIsValid && endIsValid) {
        return _Interval.fromDateTimes(start, end);
      }
      if (startIsValid) {
        const dur = Duration.fromISO(e, opts);
        if (dur.isValid) {
          return _Interval.after(start, dur);
        }
      } else if (endIsValid) {
        const dur = Duration.fromISO(s2, opts);
        if (dur.isValid) {
          return _Interval.before(end, dur);
        }
      }
    }
    return _Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isInterval(o) {
    return o && o.isLuxonInterval || false;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.isValid ? this.s : null;
  }
  /**
   * Returns the end of the Interval. This is the first instant which is not part of the interval
   * (Interval is half-open).
   * @type {DateTime}
   */
  get end() {
    return this.isValid ? this.e : null;
  }
  /**
   * Returns the last DateTime included in the interval (since end is not part of the interval)
   * @type {DateTime}
   */
  get lastDateTime() {
    return this.isValid ? this.e ? this.e.minus(1) : null : null;
  }
  /**
   * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
   * @type {boolean}
   */
  get isValid() {
    return this.invalidReason === null;
  }
  /**
   * Returns an error code if this Interval is invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(unit = "milliseconds") {
    return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; this operation will always use the locale of the start DateTime
   * @return {number}
   */
  count(unit = "milliseconds", opts) {
    if (!this.isValid) return NaN;
    const start = this.start.startOf(unit, opts);
    let end;
    if (opts?.useLocaleWeeks) {
      end = this.end.reconfigure({ locale: start.locale });
    } else {
      end = this.end;
    }
    end = end.startOf(unit, opts);
    return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(dateTime) {
    if (!this.isValid) return false;
    return this.s > dateTime;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(dateTime) {
    if (!this.isValid) return false;
    return this.e <= dateTime;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(dateTime) {
    if (!this.isValid) return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({ start, end } = {}) {
    if (!this.isValid) return this;
    return _Interval.fromDateTimes(start || this.s, end || this.e);
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...DateTime} dateTimes - the unit of time to count.
   * @return {Array}
   */
  splitAt(...dateTimes) {
    if (!this.isValid) return [];
    const sorted = dateTimes.map(friendlyDateTime).filter((d2) => this.contains(d2)).sort((a, b) => a.toMillis() - b.toMillis()), results = [];
    let { s: s2 } = this, i = 0;
    while (s2 < this.e) {
      const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
      results.push(_Interval.fromDateTimes(s2, next));
      s2 = next;
      i += 1;
    }
    return results;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {Array}
   */
  splitBy(duration) {
    const dur = Duration.fromDurationLike(duration);
    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }
    let { s: s2 } = this, idx = 1, next;
    const results = [];
    while (s2 < this.e) {
      const added = this.start.plus(dur.mapUnits((x) => x * idx));
      next = +added > +this.e ? this.e : added;
      results.push(_Interval.fromDateTimes(s2, next));
      s2 = next;
      idx += 1;
    }
    return results;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {Array}
   */
  divideEqually(numberOfParts) {
    if (!this.isValid) return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(other) {
    if (!this.isValid) return false;
    return +this.e === +other.s;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(other) {
    if (!this.isValid) return false;
    return +other.e === +this.s;
  }
  /**
   * Returns true if this Interval fully contains the specified Interval, specifically if the intersect (of this Interval and the other Interval) is equal to the other Interval; false otherwise.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(other) {
    if (!this.isValid) return false;
    return this.s <= other.s && this.e >= other.e;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }
    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  intersection(other) {
    if (!this.isValid) return this;
    const s2 = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
    if (s2 >= e) {
      return null;
    } else {
      return _Interval.fromDateTimes(s2, e);
    }
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(other) {
    if (!this.isValid) return this;
    const s2 = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
    return _Interval.fromDateTimes(s2, e);
  }
  /**
   * Merge an array of Intervals into an equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * The resulting array will contain the Intervals in ascending order, that is, starting with the earliest Interval
   * and ending with the latest.
   *
   * @param {Array} intervals
   * @return {Array}
   */
  static merge(intervals) {
    const [found, final] = intervals.sort((a, b) => a.s - b.s).reduce(
      ([sofar, current], item) => {
        if (!current) {
          return [sofar, item];
        } else if (current.overlaps(item) || current.abutsStart(item)) {
          return [sofar, current.union(item)];
        } else {
          return [sofar.concat([current]), item];
        }
      },
      [[], null]
    );
    if (final) {
      found.push(final);
    }
    return found;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {Array} intervals
   * @return {Array}
   */
  static xor(intervals) {
    let start = null, currentCount = 0;
    const results = [], ends = intervals.map((i) => [
      { time: i.s, type: "s" },
      { time: i.e, type: "e" }
    ]), flattened = Array.prototype.concat(...ends), arr = flattened.sort((a, b) => a.time - b.time);
    for (const i of arr) {
      currentCount += i.type === "s" ? 1 : -1;
      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(_Interval.fromDateTimes(start, i.time));
        }
        start = null;
      }
    }
    return _Interval.merge(results);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {Array}
   */
  difference(...intervals) {
    return _Interval.xor([this].concat(intervals)).map((i) => this.intersection(i)).filter((i) => i && !i.isEmpty());
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    if (!this.isValid) return INVALID2;
    return `[${this.s.toISO()} \u2013 ${this.e.toISO()})`;
  }
  /**
   * Returns a string representation of this Interval appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`;
    } else {
      return `Interval { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns a localized string representing this Interval. Accepts the same options as the
   * Intl.DateTimeFormat constructor and any presets defined by Luxon, such as
   * {@link DateTime.DATE_FULL} or {@link DateTime.TIME_SIMPLE}. The exact behavior of this method
   * is browser-specific, but in general it will return an appropriate representation of the
   * Interval in the assigned locale. Defaults to the system's locale if no locale has been
   * specified.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {Object} [formatOpts=DateTime.DATE_SHORT] - Either a DateTime preset or
   * Intl.DateTimeFormat constructor options.
   * @param {Object} opts - Options to override the configuration of the start DateTime.
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(); //=> 11/7/2022 – 11/8/2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL); //=> November 7 – 8, 2022
   * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL, { locale: 'fr-FR' }); //=> 7–8 novembre 2022
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString(DateTime.TIME_SIMPLE); //=> 6:00 – 8:00 PM
   * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> Mon, Nov 07, 6:00 – 8:00 p
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID2;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(opts) {
    if (!this.isValid) return INVALID2;
    return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    if (!this.isValid) return INVALID2;
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISOTime(opts) {
    if (!this.isValid) return INVALID2;
    return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format
   * string. **You may not want this.** See {@link Interval#toLocaleString} for a more flexible
   * formatting tool.
   * @param {string} dateFormat - The format string. This string formats the start and end time.
   * See {@link DateTime#toFormat} for details.
   * @param {Object} opts - Options.
   * @param {string} [opts.separator =  ' – '] - A separator to place between the start and end
   * representations.
   * @return {string}
   */
  toFormat(dateFormat, { separator = " \u2013 " } = {}) {
    if (!this.isValid) return INVALID2;
    return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }
    return this.e.diff(this.s, unit, opts);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(mapFn) {
    return _Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
};

// node_modules/luxon/src/info.js
var Info = class {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = Settings.defaultZone) {
    const proto = DateTime.now().setZone(zone).set({ month: 12 });
    return !zone.isUniversal && proto.offset !== proto.set({ month: 6 }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  static isValidIANAZone(zone) {
    return IANAZone.isValidZone(zone);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone#isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  static normalizeZone(input) {
    return normalizeZone(input, Settings.defaultZone);
  }
  /**
   * Get the weekday on which the week starts according to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number} the start of the week, 1 for Monday through 7 for Sunday
   */
  static getStartOfWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getStartOfWeek();
  }
  /**
   * Get the minimum number of days necessary in a week before it is considered part of the next year according
   * to the given locale.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number}
   */
  static getMinimumDaysInFirstWeek({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
  }
  /**
   * Get the weekdays, which are considered the weekend according to the given locale
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @returns {number[]} an array of weekdays, 1 for Monday through 7 for Sunday
   */
  static getWeekendWeekdays({ locale = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale)).getWeekendDays().slice();
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {Array}
   */
  static months(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link Info#months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {Array}
   */
  static monthsFormat(length = "long", { locale = null, numberingSystem = null, locObj = null, outputCalendar = "gregory" } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {Array}
   */
  static weekdays(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link Info#weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.locObj=null] - an existing locale object to use
   * @return {Array}
   */
  static weekdaysFormat(length = "long", { locale = null, numberingSystem = null, locObj = null } = {}) {
    return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {Array}
   */
  static meridiems({ locale = null } = {}) {
    return Locale.create(locale).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {Array}
   */
  static eras(length = "short", { locale = null } = {}) {
    return Locale.create(locale, null, "gregory").eras(length);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `relative`: whether this environment supports relative time formatting
   * * `localeWeek`: whether this environment supports different weekdays for the start of the week based on the locale
   * @example Info.features() //=> { relative: false, localeWeek: true }
   * @return {Object}
   */
  static features() {
    return { relative: hasRelative(), localeWeek: hasLocaleWeekInfo() };
  }
};

// node_modules/luxon/src/impl/diff.js
function dayDiff(earlier, later) {
  const utcDayStart = (dt) => dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}
function highOrderDiffs(cursor, later, units) {
  const differs = [
    ["years", (a, b) => b.year - a.year],
    ["quarters", (a, b) => b.quarter - a.quarter + (b.year - a.year) * 4],
    ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12],
    [
      "weeks",
      (a, b) => {
        const days = dayDiff(a, b);
        return (days - days % 7) / 7;
      }
    ],
    ["days", dayDiff]
  ];
  const results = {};
  const earlier = cursor;
  let lowestOrder, highWater;
  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;
      results[unit] = differ(cursor, later);
      highWater = earlier.plus(results);
      if (highWater > later) {
        results[unit]--;
        cursor = earlier.plus(results);
        if (cursor > later) {
          highWater = cursor;
          results[unit]--;
          cursor = earlier.plus(results);
        }
      } else {
        cursor = highWater;
      }
    }
  }
  return [cursor, results, highWater, lowestOrder];
}
function diff_default(earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
  const remainingMillis = later - cursor;
  const lowerOrderUnits = units.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );
  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }
    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }
  const duration = Duration.fromObject(results, opts);
  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}

// node_modules/luxon/src/impl/tokenParser.js
var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
function intUnit(regex, post = (i) => i) {
  return { regex, deser: ([s2]) => post(parseDigits(s2)) };
}
var NBSP = String.fromCharCode(160);
var spaceOrNBSP = `[ ${NBSP}]`;
var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
function fixListRegex(s2) {
  return s2.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}
function stripInsensitivities(s2) {
  return s2.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
}
function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s2]) => strings.findIndex((i) => stripInsensitivities(s2) === stripInsensitivities(i)) + startIndex
    };
  }
}
function offset(regex, groups) {
  return { regex, deser: ([, h, m]) => signedOffset(h, m), groups };
}
function simple(regex) {
  return { regex, deser: ([s2]) => s2 };
}
function escapeToken(value) {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function unitForToken(token, loc) {
  const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = (t) => ({ regex: RegExp(escapeToken(t.val)), deser: ([s2]) => s2, literal: true }), unitate = (t) => {
    if (token.literal) {
      return literal(t);
    }
    switch (t.val) {
      // era
      case "G":
        return oneOf(loc.eras("short"), 0);
      case "GG":
        return oneOf(loc.eras("long"), 0);
      // years
      case "y":
        return intUnit(oneToSix);
      case "yy":
        return intUnit(twoToFour, untruncateYear);
      case "yyyy":
        return intUnit(four);
      case "yyyyy":
        return intUnit(fourToSix);
      case "yyyyyy":
        return intUnit(six);
      // months
      case "M":
        return intUnit(oneOrTwo);
      case "MM":
        return intUnit(two);
      case "MMM":
        return oneOf(loc.months("short", true), 1);
      case "MMMM":
        return oneOf(loc.months("long", true), 1);
      case "L":
        return intUnit(oneOrTwo);
      case "LL":
        return intUnit(two);
      case "LLL":
        return oneOf(loc.months("short", false), 1);
      case "LLLL":
        return oneOf(loc.months("long", false), 1);
      // dates
      case "d":
        return intUnit(oneOrTwo);
      case "dd":
        return intUnit(two);
      // ordinals
      case "o":
        return intUnit(oneToThree);
      case "ooo":
        return intUnit(three);
      // time
      case "HH":
        return intUnit(two);
      case "H":
        return intUnit(oneOrTwo);
      case "hh":
        return intUnit(two);
      case "h":
        return intUnit(oneOrTwo);
      case "mm":
        return intUnit(two);
      case "m":
        return intUnit(oneOrTwo);
      case "q":
        return intUnit(oneOrTwo);
      case "qq":
        return intUnit(two);
      case "s":
        return intUnit(oneOrTwo);
      case "ss":
        return intUnit(two);
      case "S":
        return intUnit(oneToThree);
      case "SSS":
        return intUnit(three);
      case "u":
        return simple(oneToNine);
      case "uu":
        return simple(oneOrTwo);
      case "uuu":
        return intUnit(one);
      // meridiem
      case "a":
        return oneOf(loc.meridiems(), 0);
      // weekYear (k)
      case "kkkk":
        return intUnit(four);
      case "kk":
        return intUnit(twoToFour, untruncateYear);
      // weekNumber (W)
      case "W":
        return intUnit(oneOrTwo);
      case "WW":
        return intUnit(two);
      // weekdays
      case "E":
      case "c":
        return intUnit(one);
      case "EEE":
        return oneOf(loc.weekdays("short", false), 1);
      case "EEEE":
        return oneOf(loc.weekdays("long", false), 1);
      case "ccc":
        return oneOf(loc.weekdays("short", true), 1);
      case "cccc":
        return oneOf(loc.weekdays("long", true), 1);
      // offset/zone
      case "Z":
      case "ZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
      case "ZZZ":
        return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
      // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
      // because we don't have any way to figure out what they are
      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);
      // this special-case "token" represents a place where a macro-token expanded into a white-space literal
      // in this case we accept any non-newline white-space
      case " ":
        return simple(/[^\S\n\r]/);
      default:
        return literal(t);
    }
  };
  const unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}
var partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh"
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ"
  }
};
function tokenForPart(part, formatOpts, resolvedOpts) {
  const { type, value } = part;
  if (type === "literal") {
    const isSpace = /^\s+$/.test(value);
    return {
      literal: !isSpace,
      val: isSpace ? " " : value
    };
  }
  const style25 = formatOpts[type];
  let actualType = type;
  if (type === "hour") {
    if (formatOpts.hour12 != null) {
      actualType = formatOpts.hour12 ? "hour12" : "hour24";
    } else if (formatOpts.hourCycle != null) {
      if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
        actualType = "hour12";
      } else {
        actualType = "hour24";
      }
    } else {
      actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
    }
  }
  let val = partTypeStyleToTokenVal[actualType];
  if (typeof val === "object") {
    val = val[style25];
  }
  if (val) {
    return {
      literal: false,
      val
    };
  }
  return void 0;
}
function buildRegex(units) {
  const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return [`^${re}$`, units];
}
function match(input, regex, handlers) {
  const matches = input.match(regex);
  if (matches) {
    const all = {};
    let matchIndex = 1;
    for (const i in handlers) {
      if (hasOwnProperty(handlers, i)) {
        const h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }
        matchIndex += groups;
      }
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}
function dateTimeFromMatches(matches) {
  const toField = (token) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };
  let zone = null;
  let specificOffset;
  if (!isUndefined2(matches.z)) {
    zone = IANAZone.create(matches.z);
  }
  if (!isUndefined2(matches.Z)) {
    if (!zone) {
      zone = new FixedOffsetZone(matches.Z);
    }
    specificOffset = matches.Z;
  }
  if (!isUndefined2(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }
  if (!isUndefined2(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }
  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }
  if (!isUndefined2(matches.u)) {
    matches.S = parseMillis(matches.u);
  }
  const vals = Object.keys(matches).reduce((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k];
    }
    return r;
  }, {});
  return [vals, zone, specificOffset];
}
var dummyDateTimeCache = null;
function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }
  return dummyDateTimeCache;
}
function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }
  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
  const tokens = formatOptsToTokens(formatOpts, locale);
  if (tokens == null || tokens.includes(void 0)) {
    return token;
  }
  return tokens;
}
function expandMacroTokens(tokens, locale) {
  return Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, locale)));
}
var TokenParser = class {
  constructor(locale, format) {
    this.locale = locale;
    this.format = format;
    this.tokens = expandMacroTokens(Formatter.parseFormat(format), locale);
    this.units = this.tokens.map((t) => unitForToken(t, locale));
    this.disqualifyingUnit = this.units.find((t) => t.invalidReason);
    if (!this.disqualifyingUnit) {
      const [regexString, handlers] = buildRegex(this.units);
      this.regex = RegExp(regexString, "i");
      this.handlers = handlers;
    }
  }
  explainFromTokens(input) {
    if (!this.isValid) {
      return { input, tokens: this.tokens, invalidReason: this.invalidReason };
    } else {
      const [rawMatches, matches] = match(input, this.regex, this.handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [null, null, void 0];
      if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
        throw new ConflictingSpecificationError(
          "Can't include meridiem when specifying 24-hour format"
        );
      }
      return {
        input,
        tokens: this.tokens,
        regex: this.regex,
        rawMatches,
        matches,
        result,
        zone,
        specificOffset
      };
    }
  }
  get isValid() {
    return !this.disqualifyingUnit;
  }
  get invalidReason() {
    return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
  }
};
function explainFromTokens(locale, input, format) {
  const parser = new TokenParser(locale, format);
  return parser.explainFromTokens(input);
}
function parseFromTokens(locale, input, format) {
  const { result, zone, specificOffset, invalidReason } = explainFromTokens(locale, input, format);
  return [result, zone, specificOffset, invalidReason];
}
function formatOptsToTokens(formatOpts, locale) {
  if (!formatOpts) {
    return null;
  }
  const formatter = Formatter.create(locale, formatOpts);
  const df = formatter.dtFormatter(getDummyDateTime());
  const parts = df.formatToParts();
  const resolvedOpts = df.resolvedOptions();
  return parts.map((p) => tokenForPart(p, formatOpts, resolvedOpts));
}

// node_modules/luxon/src/datetime.js
var INVALID3 = "Invalid DateTime";
var MAX_DATE = 864e13;
function unsupportedZone(zone) {
  return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
}
function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = gregorianToWeek(dt.c);
  }
  return dt.weekData;
}
function possiblyCachedLocalWeekData(dt) {
  if (dt.localWeekData === null) {
    dt.localWeekData = gregorianToWeek(
      dt.c,
      dt.loc.getMinDaysInFirstWeek(),
      dt.loc.getStartOfWeek()
    );
  }
  return dt.localWeekData;
}
function clone2(inst, alts) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime({ ...current, ...alts, old: current });
}
function fixOffset(localTS, o, tz) {
  let utcGuess = localTS - o * 60 * 1e3;
  const o2 = tz.offset(utcGuess);
  if (o === o2) {
    return [utcGuess, o];
  }
  utcGuess -= (o2 - o) * 60 * 1e3;
  const o3 = tz.offset(utcGuess);
  if (o2 === o3) {
    return [utcGuess, o2];
  }
  return [localTS - Math.min(o2, o3) * 60 * 1e3, Math.max(o2, o3)];
}
function tsToObj(ts, offset2) {
  ts += offset2 * 60 * 1e3;
  const d2 = new Date(ts);
  return {
    year: d2.getUTCFullYear(),
    month: d2.getUTCMonth() + 1,
    day: d2.getUTCDate(),
    hour: d2.getUTCHours(),
    minute: d2.getUTCMinutes(),
    second: d2.getUTCSeconds(),
    millisecond: d2.getUTCMilliseconds()
  };
}
function objToTS(obj, offset2, zone) {
  return fixOffset(objToLocalTS(obj), offset2, zone);
}
function adjustTime(inst, dur) {
  const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c = {
    ...inst.c,
    year,
    month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }, millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"), localTS = objToLocalTS(c);
  let [ts, o] = fixOffset(localTS, oPre, inst.zone);
  if (millisToAdd !== 0) {
    ts += millisToAdd;
    o = inst.zone.offset(ts);
  }
  return { ts, o };
}
function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
  const { setZone, zone } = opts;
  if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
    const interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, {
      ...opts,
      zone: interpretationZone,
      specificOffset
    });
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(
      new Invalid("unparsable", `the input "${text}" can't be parsed as ${format}`)
    );
  }
}
function toTechFormat(dt, format, allowZ = true) {
  return dt.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt, format) : null;
}
function toISODate(o, extended, precision) {
  const longFormat = o.c.year > 9999 || o.c.year < 0;
  let c = "";
  if (longFormat && o.c.year >= 0) c += "+";
  c += padStart(o.c.year, longFormat ? 6 : 4);
  if (precision === "year") return c;
  if (extended) {
    c += "-";
    c += padStart(o.c.month);
    if (precision === "month") return c;
    c += "-";
  } else {
    c += padStart(o.c.month);
    if (precision === "month") return c;
  }
  c += padStart(o.c.day);
  return c;
}
function toISOTime(o, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone, precision) {
  let showSeconds = !suppressSeconds || o.c.millisecond !== 0 || o.c.second !== 0, c = "";
  switch (precision) {
    case "day":
    case "month":
    case "year":
      break;
    default:
      c += padStart(o.c.hour);
      if (precision === "hour") break;
      if (extended) {
        c += ":";
        c += padStart(o.c.minute);
        if (precision === "minute") break;
        if (showSeconds) {
          c += ":";
          c += padStart(o.c.second);
        }
      } else {
        c += padStart(o.c.minute);
        if (precision === "minute") break;
        if (showSeconds) {
          c += padStart(o.c.second);
        }
      }
      if (precision === "second") break;
      if (showSeconds && (!suppressMilliseconds || o.c.millisecond !== 0)) {
        c += ".";
        c += padStart(o.c.millisecond, 3);
      }
  }
  if (includeOffset) {
    if (o.isOffsetFixed && o.offset === 0 && !extendedZone) {
      c += "Z";
    } else if (o.o < 0) {
      c += "-";
      c += padStart(Math.trunc(-o.o / 60));
      c += ":";
      c += padStart(Math.trunc(-o.o % 60));
    } else {
      c += "+";
      c += padStart(Math.trunc(o.o / 60));
      c += ":";
      c += padStart(Math.trunc(o.o % 60));
    }
  }
  if (extendedZone) {
    c += "[" + o.zone.ianaName + "]";
  }
  return c;
}
var defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
};
var orderedUnits2 = ["year", "month", "day", "hour", "minute", "second", "millisecond"];
var orderedWeekUnits = [
  "weekYear",
  "weekNumber",
  "weekday",
  "hour",
  "minute",
  "second",
  "millisecond"
];
var orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
function normalizeUnit(unit) {
  const normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized) throw new InvalidUnitError(unit);
  return normalized;
}
function normalizeUnitWithLocalWeeks(unit) {
  switch (unit.toLowerCase()) {
    case "localweekday":
    case "localweekdays":
      return "localWeekday";
    case "localweeknumber":
    case "localweeknumbers":
      return "localWeekNumber";
    case "localweekyear":
    case "localweekyears":
      return "localWeekYear";
    default:
      return normalizeUnit(unit);
  }
}
function guessOffsetForZone(zone) {
  if (zoneOffsetTs === void 0) {
    zoneOffsetTs = Settings.now();
  }
  if (zone.type !== "iana") {
    return zone.offset(zoneOffsetTs);
  }
  const zoneName = zone.name;
  let offsetGuess = zoneOffsetGuessCache.get(zoneName);
  if (offsetGuess === void 0) {
    offsetGuess = zone.offset(zoneOffsetTs);
    zoneOffsetGuessCache.set(zoneName, offsetGuess);
  }
  return offsetGuess;
}
function quickDT(obj, opts) {
  const zone = normalizeZone(opts.zone, Settings.defaultZone);
  if (!zone.isValid) {
    return DateTime.invalid(unsupportedZone(zone));
  }
  const loc = Locale.fromObject(opts);
  let ts, o;
  if (!isUndefined2(obj.year)) {
    for (const u of orderedUnits2) {
      if (isUndefined2(obj[u])) {
        obj[u] = defaultUnitValues[u];
      }
    }
    const invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
    if (invalid) {
      return DateTime.invalid(invalid);
    }
    const offsetProvis = guessOffsetForZone(zone);
    [ts, o] = objToTS(obj, offsetProvis, zone);
  } else {
    ts = Settings.now();
  }
  return new DateTime({ ts, zone, loc, o });
}
function diffRelative(start, end, opts) {
  const round = isUndefined2(opts.round) ? true : opts.round, rounding = isUndefined2(opts.rounding) ? "trunc" : opts.rounding, format = (c, unit) => {
    c = roundTo(c, round || opts.calendary ? 0 : 2, opts.calendary ? "round" : rounding);
    const formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c, unit);
  }, differ = (unit) => {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };
  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }
  for (const unit of opts.units) {
    const count = differ(unit);
    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }
  return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
}
function lastOpts(argList) {
  let opts = {}, args;
  if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
    opts = argList[argList.length - 1];
    args = Array.from(argList).slice(0, argList.length - 1);
  } else {
    args = Array.from(argList);
  }
  return [opts, args];
}
var zoneOffsetTs;
var zoneOffsetGuessCache = /* @__PURE__ */ new Map();
var DateTime = class _DateTime {
  /**
   * @access private
   */
  constructor(config) {
    const zone = config.zone || Settings.defaultZone;
    let invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    this.ts = isUndefined2(config.ts) ? Settings.now() : config.ts;
    let c = null, o = null;
    if (!invalid) {
      const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
      if (unchanged) {
        [c, o] = [config.old.c, config.old.o];
      } else {
        const ot = isNumber2(config.o) && !config.old ? config.o : zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
        c = invalid ? null : c;
        o = invalid ? null : ot;
      }
    }
    this._zone = zone;
    this.loc = config.loc || Locale.create();
    this.invalid = invalid;
    this.weekData = null;
    this.localWeekData = null;
    this.c = c;
    this.o = o;
    this.isLuxonDateTime = true;
  }
  // CONSTRUCT
  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */
  static now() {
    return new _DateTime({});
  }
  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                                  //~> now
   * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
   * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
   * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
   * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  static local() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @param {Object} options - configuration options for the DateTime
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [options.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.utc()                                              //~> now
   * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
   * @return {DateTime}
   */
  static utc() {
    const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
    opts.zone = FixedOffsetZone.utcInstance;
    return quickDT({ year, month, day, hour, minute, second, millisecond }, opts);
  }
  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  static fromJSDate(date, options = {}) {
    const ts = isDate(date) ? date.valueOf() : NaN;
    if (Number.isNaN(ts)) {
      return _DateTime.invalid("invalid input");
    }
    const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return _DateTime.invalid(unsupportedZone(zoneToUse));
    }
    return new _DateTime({
      ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromMillis(milliseconds, options = {}) {
    if (!isNumber2(milliseconds)) {
      throw new InvalidArgumentError(
        `fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`
      );
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      return _DateTime.invalid("Timestamp out of range");
    } else {
      return new _DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromSeconds(seconds, options = {}) {
    if (!isNumber2(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new _DateTime({
        ts: seconds * 1e3,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.localWeekYear - a week year, according to the locale
   * @param {number} obj.localWeekNumber - a week number, between 1 and 52 or 53, depending on the year, according to the locale
   * @param {number} obj.localWeekday - a weekday, 1-7, where 1 is the first and 7 is the last day of the week, according to the locale
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {Object} opts - options for creating this DateTime
   * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [opts.locale='system\'s locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @example DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 }, { locale: "en-US" }).toISODate() //=> '2021-12-26'
   * @return {DateTime}
   */
  static fromObject(obj, opts = {}) {
    obj = obj || {};
    const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
    if (!zoneToUse.isValid) {
      return _DateTime.invalid(unsupportedZone(zoneToUse));
    }
    const loc = Locale.fromObject(opts);
    const normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, loc);
    const tsNow = Settings.now(), offsetProvis = !isUndefined2(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined2(normalized.ordinal), containsGregorYear = !isUndefined2(normalized.year), containsGregorMD = !isUndefined2(normalized.month) || !isUndefined2(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
    let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits2;
      defaultValues = defaultUnitValues;
    }
    let foundFirst = false;
    for (const u of units) {
      const v = normalized[u];
      if (!isUndefined2(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }
    const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
    if (invalid) {
      return _DateTime.invalid(invalid);
    }
    const gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new _DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc
    });
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return _DateTime.invalid(
        "mismatched weekday",
        `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`
      );
    }
    if (!inst.isValid) {
      return _DateTime.invalid(inst.invalid);
    }
    return inst;
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
   * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
   * @param {string} [opts.weekSettings] - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(text, opts = {}) {
    const [vals, parsedZone] = parseISODate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(text, opts = {}) {
    const [vals, parsedZone] = parseRFC2822Date(text);
    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(text, opts = {}) {
    const [vals, parsedZone] = parseHTTPDate(text);
    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  static fromFormat(text, fmt, opts = {}) {
    if (isUndefined2(text) || isUndefined2(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }
    const { locale = null, numberingSystem = null } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    }), [vals, parsedZone, specificOffset, invalid] = parseFromTokens(localeToUse, text, fmt);
    if (invalid) {
      return _DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
    }
  }
  /**
   * @deprecated use fromFormat instead
   */
  static fromString(text, fmt, opts = {}) {
    return _DateTime.fromFormat(text, fmt, opts);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  static fromSQL(text, opts = {}) {
    const [vals, parsedZone] = parseSQL(text);
    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent.
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  static invalid(reason, explanation = null) {
    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }
    const invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
    if (Settings.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new _DateTime({ invalid });
    }
  }
  /**
   * Check if an object is an instance of DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  static isDateTime(o) {
    return o && o.isLuxonDateTime || false;
  }
  /**
   * Produce the format string for a set of options
   * @param formatOpts
   * @param localeOpts
   * @returns {string}
   */
  static parseFormatForOpts(formatOpts, localeOpts = {}) {
    const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
    return !tokenList ? null : tokenList.map((t) => t ? t.val : null).join("");
  }
  /**
   * Produce the the fully expanded format token for the locale
   * Does NOT quote characters, so quoted tokens will not round trip correctly
   * @param fmt
   * @param localeOpts
   * @returns {string}
   */
  static expandFormat(fmt, localeOpts = {}) {
    const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
    return expanded.map((t) => t.val).join("");
  }
  static resetCache() {
    zoneOffsetTs = void 0;
    zoneOffsetGuessCache.clear();
  }
  // INFO
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(unit) {
    return this[unit];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  get isValid() {
    return this.invalid === null;
  }
  /**
   * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidReason() {
    return this.invalid ? this.invalid.reason : null;
  }
  /**
   * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
   * @type {string}
   */
  get invalidExplanation() {
    return this.invalid ? this.invalid.explanation : null;
  }
  /**
   * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
   *
   * @type {string}
   */
  get locale() {
    return this.isValid ? this.loc.locale : null;
  }
  /**
   * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
   *
   * @type {string}
   */
  get numberingSystem() {
    return this.isValid ? this.loc.numberingSystem : null;
  }
  /**
   * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
   *
   * @type {string}
   */
  get outputCalendar() {
    return this.isValid ? this.loc.outputCalendar : null;
  }
  /**
   * Get the time zone associated with this DateTime.
   * @type {Zone}
   */
  get zone() {
    return this._zone;
  }
  /**
   * Get the name of the time zone.
   * @type {string}
   */
  get zoneName() {
    return this.isValid ? this.zone.name : null;
  }
  /**
   * Get the year
   * @example DateTime.local(2017, 5, 25).year //=> 2017
   * @type {number}
   */
  get year() {
    return this.isValid ? this.c.year : NaN;
  }
  /**
   * Get the quarter
   * @example DateTime.local(2017, 5, 25).quarter //=> 2
   * @type {number}
   */
  get quarter() {
    return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
  }
  /**
   * Get the month (1-12).
   * @example DateTime.local(2017, 5, 25).month //=> 5
   * @type {number}
   */
  get month() {
    return this.isValid ? this.c.month : NaN;
  }
  /**
   * Get the day of the month (1-30ish).
   * @example DateTime.local(2017, 5, 25).day //=> 25
   * @type {number}
   */
  get day() {
    return this.isValid ? this.c.day : NaN;
  }
  /**
   * Get the hour of the day (0-23).
   * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
   * @type {number}
   */
  get hour() {
    return this.isValid ? this.c.hour : NaN;
  }
  /**
   * Get the minute of the hour (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
   * @type {number}
   */
  get minute() {
    return this.isValid ? this.c.minute : NaN;
  }
  /**
   * Get the second of the minute (0-59).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
   * @type {number}
   */
  get second() {
    return this.isValid ? this.c.second : NaN;
  }
  /**
   * Get the millisecond of the second (0-999).
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
   * @type {number}
   */
  get millisecond() {
    return this.isValid ? this.c.millisecond : NaN;
  }
  /**
   * Get the week year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
   * @type {number}
   */
  get weekYear() {
    return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
  }
  /**
   * Get the week number of the week year (1-52ish).
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
   * @type {number}
   */
  get weekNumber() {
    return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2014, 11, 31).weekday //=> 4
   * @type {number}
   */
  get weekday() {
    return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
  }
  /**
   * Returns true if this date is on a weekend according to the locale, false otherwise
   * @returns {boolean}
   */
  get isWeekend() {
    return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
  }
  /**
   * Get the day of the week according to the locale.
   * 1 is the first day of the week and 7 is the last day of the week.
   * If the locale assigns Sunday as the first day of the week, then a date which is a Sunday will return 1,
   * @returns {number}
   */
  get localWeekday() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
  }
  /**
   * Get the week number of the week year according to the locale. Different locales assign week numbers differently,
   * because the week can start on different days of the week (see localWeekday) and because a different number of days
   * is required for a week to count as the first week of a year.
   * @returns {number}
   */
  get localWeekNumber() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
  }
  /**
   * Get the week year according to the locale. Different locales assign week numbers (and therefor week years)
   * differently, see localWeekNumber.
   * @returns {number}
   */
  get localWeekYear() {
    return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
  }
  /**
   * Get the ordinal (meaning the day of the year)
   * @example DateTime.local(2017, 5, 25).ordinal //=> 145
   * @type {number|DateTime}
   */
  get ordinal() {
    return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
  }
  /**
   * Get the human readable short month name, such as 'Oct'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
   * @type {string}
   */
  get monthShort() {
    return this.isValid ? Info.months("short", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable long month name, such as 'October'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).monthLong //=> October
   * @type {string}
   */
  get monthLong() {
    return this.isValid ? Info.months("long", { locObj: this.loc })[this.month - 1] : null;
  }
  /**
   * Get the human readable short weekday, such as 'Mon'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
   * @type {string}
   */
  get weekdayShort() {
    return this.isValid ? Info.weekdays("short", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the human readable long weekday, such as 'Monday'.
   * Defaults to the system's locale if no locale has been specified
   * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
   * @type {string}
   */
  get weekdayLong() {
    return this.isValid ? Info.weekdays("long", { locObj: this.loc })[this.weekday - 1] : null;
  }
  /**
   * Get the UTC offset of this DateTime in minutes
   * @example DateTime.now().offset //=> -240
   * @example DateTime.utc().offset //=> 0
   * @type {number}
   */
  get offset() {
    return this.isValid ? +this.o : NaN;
  }
  /**
   * Get the short human name for the zone's current offset, for example "EST" or "EDT".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameShort() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "short",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
   * Defaults to the system's locale if no locale has been specified
   * @type {string}
   */
  get offsetNameLong() {
    if (this.isValid) {
      return this.zone.offsetName(this.ts, {
        format: "long",
        locale: this.locale
      });
    } else {
      return null;
    }
  }
  /**
   * Get whether this zone's offset ever changes, as in a DST.
   * @type {boolean}
   */
  get isOffsetFixed() {
    return this.isValid ? this.zone.isUniversal : null;
  }
  /**
   * Get whether the DateTime is in a DST.
   * @type {boolean}
   */
  get isInDST() {
    if (this.isOffsetFixed) {
      return false;
    } else {
      return this.offset > this.set({ month: 1, day: 1 }).offset || this.offset > this.set({ month: 5 }).offset;
    }
  }
  /**
   * Get those DateTimes which have the same local time as this DateTime, but a different offset from UTC
   * in this DateTime's zone. During DST changes local time can be ambiguous, for example
   * `2023-10-29T02:30:00` in `Europe/Berlin` can have offset `+01:00` or `+02:00`.
   * This method will return both possible DateTimes if this DateTime's local time is ambiguous.
   * @returns {DateTime[]}
   */
  getPossibleOffsets() {
    if (!this.isValid || this.isOffsetFixed) {
      return [this];
    }
    const dayMs = 864e5;
    const minuteMs = 6e4;
    const localTS = objToLocalTS(this.c);
    const oEarlier = this.zone.offset(localTS - dayMs);
    const oLater = this.zone.offset(localTS + dayMs);
    const o1 = this.zone.offset(localTS - oEarlier * minuteMs);
    const o2 = this.zone.offset(localTS - oLater * minuteMs);
    if (o1 === o2) {
      return [this];
    }
    const ts1 = localTS - o1 * minuteMs;
    const ts2 = localTS - o2 * minuteMs;
    const c1 = tsToObj(ts1, o1);
    const c2 = tsToObj(ts2, o2);
    if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
      return [clone2(this, { ts: ts1 }), clone2(this, { ts: ts2 })];
    }
    return [this];
  }
  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear //=> true
   * @example DateTime.local(2013).isInLeapYear //=> false
   * @type {boolean}
   */
  get isInLeapYear() {
    return isLeapYear(this.year);
  }
  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).daysInMonth //=> 29
   * @example DateTime.local(2016, 3).daysInMonth //=> 31
   * @type {number}
   */
  get daysInMonth() {
    return daysInMonth(this.year, this.month);
  }
  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear //=> 366
   * @example DateTime.local(2013).daysInYear //=> 365
   * @type {number}
   */
  get daysInYear() {
    return this.isValid ? daysInYear(this.year) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's year
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @example DateTime.local(2004).weeksInWeekYear //=> 53
   * @example DateTime.local(2013).weeksInWeekYear //=> 52
   * @type {number}
   */
  get weeksInWeekYear() {
    return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
  }
  /**
   * Returns the number of weeks in this DateTime's local week year
   * @example DateTime.local(2020, 6, {locale: 'en-US'}).weeksInLocalWeekYear //=> 52
   * @example DateTime.local(2020, 6, {locale: 'de-DE'}).weeksInLocalWeekYear //=> 53
   * @type {number}
   */
  get weeksInLocalWeekYear() {
    return this.isValid ? weeksInWeekYear(
      this.localWeekYear,
      this.loc.getMinDaysInFirstWeek(),
      this.loc.getStartOfWeek()
    ) : NaN;
  }
  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  resolvedLocaleOptions(opts = {}) {
    const { locale, numberingSystem, calendar } = Formatter.create(
      this.loc.clone(opts),
      opts
    ).resolvedOptions(this);
    return { locale, numberingSystem, outputCalendar: calendar };
  }
  // TRANSFORM
  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link DateTime#setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  toUTC(offset2 = 0, opts = {}) {
    return this.setZone(FixedOffsetZone.instance(offset2), opts);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.setZone(Settings.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  setZone(zone, { keepLocalTime = false, keepCalendarTime = false } = {}) {
    zone = normalizeZone(zone, Settings.defaultZone);
    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return _DateTime.invalid(unsupportedZone(zone));
    } else {
      let newTS = this.ts;
      if (keepLocalTime || keepCalendarTime) {
        const offsetGuess = zone.offset(this.ts);
        const asObj = this.toObject();
        [newTS] = objToTS(asObj, offsetGuess, zone);
      }
      return clone2(this, { ts: newTS, zone });
    }
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  reconfigure({ locale, numberingSystem, outputCalendar } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem, outputCalendar });
    return clone2(this, { loc });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  setLocale(locale) {
    return this.reconfigure({ locale });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
   *
   * This method also supports setting locale-based week units, i.e. `localWeekday`, `localWeekNumber` and `localWeekYear`.
   * They cannot be mixed with ISO-week units like `weekday`.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(values) {
    if (!this.isValid) return this;
    const normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
    const { minDaysInFirstWeek, startOfWeek } = usesLocalWeekValues(normalized, this.loc);
    const settingWeekStuff = !isUndefined2(normalized.weekYear) || !isUndefined2(normalized.weekNumber) || !isUndefined2(normalized.weekday), containsOrdinal = !isUndefined2(normalized.ordinal), containsGregorYear = !isUndefined2(normalized.year), containsGregorMD = !isUndefined2(normalized.month) || !isUndefined2(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError(
        "Can't mix weekYear/weekNumber units with year/month/day or ordinals"
      );
    }
    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }
    let mixed;
    if (settingWeekStuff) {
      mixed = weekToGregorian(
        { ...gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek), ...normalized },
        minDaysInFirstWeek,
        startOfWeek
      );
    } else if (!isUndefined2(normalized.ordinal)) {
      mixed = ordinalToGregorian({ ...gregorianToOrdinal(this.c), ...normalized });
    } else {
      mixed = { ...this.toObject(), ...normalized };
      if (isUndefined2(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }
    const [ts, o] = objToTS(mixed, this.o, this.zone);
    return clone2(this, { ts, o });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  plus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration);
    return clone2(this, adjustTime(this, dur));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link DateTime#plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
   */
  minus(duration) {
    if (!this.isValid) return this;
    const dur = Duration.fromDurationLike(duration).negate();
    return clone2(this, adjustTime(this, dur));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(unit, { useLocaleWeeks = false } = {}) {
    if (!this.isValid) return this;
    const o = {}, normalizedUnit = Duration.normalizeUnit(unit);
    switch (normalizedUnit) {
      case "years":
        o.month = 1;
      // falls through
      case "quarters":
      case "months":
        o.day = 1;
      // falls through
      case "weeks":
      case "days":
        o.hour = 0;
      // falls through
      case "hours":
        o.minute = 0;
      // falls through
      case "minutes":
        o.second = 0;
      // falls through
      case "seconds":
        o.millisecond = 0;
        break;
      case "milliseconds":
        break;
    }
    if (normalizedUnit === "weeks") {
      if (useLocaleWeeks) {
        const startOfWeek = this.loc.getStartOfWeek();
        const { weekday } = this;
        if (weekday < startOfWeek) {
          o.weekNumber = this.weekNumber - 1;
        }
        o.weekday = startOfWeek;
      } else {
        o.weekday = 1;
      }
    }
    if (normalizedUnit === "quarters") {
      const q = Math.ceil(this.month / 3);
      o.month = (q - 1) * 3 + 1;
    }
    return this.set(o);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(unit, opts) {
    return this.isValid ? this.plus({ [unit]: 1 }).startOf(unit, opts).minus(1) : this;
  }
  // OUTPUT
  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID3;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @param {Object} opts - opts to override the configuration options on this DateTime
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
   * @return {string}
   */
  toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID3;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  toLocaleParts(opts = {}) {
    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'years', 'months', 'days', 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
   * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @example DateTime.now().toISO({ precision: 'day' }) //=> '2017-04-22Z'
   * @example DateTime.now().toISO({ precision: 'minute' }) //=> '2017-04-22T20:47Z'
   * @return {string|null}
   */
  toISO({
    format = "extended",
    suppressSeconds = false,
    suppressMilliseconds = false,
    includeOffset = true,
    extendedZone = false,
    precision = "milliseconds"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    precision = normalizeUnit(precision);
    const ext = format === "extended";
    let c = toISODate(this, ext, precision);
    if (orderedUnits2.indexOf(precision) >= 3) c += "T";
    c += toISOTime(
      this,
      ext,
      suppressSeconds,
      suppressMilliseconds,
      includeOffset,
      extendedZone,
      precision
    );
    return c;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='day'] - truncate output to desired precision: 'years', 'months', or 'days'.
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @example DateTime.utc(1982, 5, 25).toISODate({ precision: 'month' }) //=> '1982-05'
   * @return {string|null}
   */
  toISODate({ format = "extended", precision = "day" } = {}) {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, format === "extended", normalizeUnit(precision));
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, second: 56 }).toISOTime({ precision: 'minute' }) //=> '07:34Z'
   * @return {string}
   */
  toISOTime({
    suppressMilliseconds = false,
    suppressSeconds = false,
    includeOffset = true,
    includePrefix = false,
    extendedZone = false,
    format = "extended",
    precision = "milliseconds"
  } = {}) {
    if (!this.isValid) {
      return null;
    }
    precision = normalizeUnit(precision);
    let c = includePrefix && orderedUnits2.indexOf(precision) >= 3 ? "T" : "";
    return c + toISOTime(
      this,
      format === "extended",
      suppressSeconds,
      suppressMilliseconds,
      includeOffset,
      extendedZone,
      precision
    );
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string|null}
   */
  toSQLDate() {
    if (!this.isValid) {
      return null;
    }
    return toISODate(this, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  toSQLTime({ includeOffset = true, includeZone = false, includeOffsetSpace = true } = {}) {
    let fmt = "HH:mm:ss.SSS";
    if (includeZone || includeOffset) {
      if (includeOffsetSpace) {
        fmt += " ";
      }
      if (includeZone) {
        fmt += "z";
      } else if (includeOffset) {
        fmt += "ZZ";
      }
    }
    return toTechFormat(this, fmt, true);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  toSQL(opts = {}) {
    if (!this.isValid) {
      return null;
    }
    return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.isValid ? this.toISO() : INVALID3;
  }
  /**
   * Returns a string representation of this DateTime appropriate for the REPL.
   * @return {string}
   */
  [Symbol.for("nodejs.util.inspect.custom")]() {
    if (this.isValid) {
      return `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`;
    } else {
      return `DateTime { Invalid, reason: ${this.invalidReason} }`;
    }
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
   * @return {number}
   */
  valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds (including milliseconds in the fractional part) of this DateTime.
   * @return {number}
   */
  toSeconds() {
    return this.isValid ? this.ts / 1e3 : NaN;
  }
  /**
   * Returns the epoch seconds (as a whole number) of this DateTime.
   * @return {number}
   */
  toUnixInteger() {
    return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  toObject(opts = {}) {
    if (!this.isValid) return {};
    const base = { ...this.c };
    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }
    return base;
  }
  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  }
  // COMPARE
  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  diff(otherDateTime, unit = "milliseconds", opts = {}) {
    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid("created by diffing an invalid DateTime");
    }
    const durOpts = { locale: this.locale, numberingSystem: this.numberingSystem, ...opts };
    const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff_default(earlier, later, units, durOpts);
    return otherIsLater ? diffed.negate() : diffed;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link DateTime#diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  diffNow(unit = "milliseconds", opts = {}) {
    return this.diff(_DateTime.now(), unit, opts);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval|DateTime}
   */
  until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @param {Object} opts - options
   * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; only the locale of this DateTime is used
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  hasSame(otherDateTime, unit, opts) {
    if (!this.isValid) return false;
    const inputMs = otherDateTime.valueOf();
    const adjustedToZone = this.setZone(otherDateTime.zone, { keepLocalTime: true });
    return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
  }
  /**
   * Equality check
   * Two DateTimes are equal if and only if they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds towards zero by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {string} [options.rounding="trunc"] - rounding method to use when rounding the numbers in the output. Can be "trunc" (toward zero), "expand" (away from zero), "round", "floor", or "ceil".
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  toRelative(options = {}) {
    if (!this.isValid) return null;
    const base = options.base || _DateTime.fromObject({}, { zone: this.zone }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
    let units = ["years", "months", "days", "hours", "minutes", "seconds"];
    let unit = options.unit;
    if (Array.isArray(options.unit)) {
      units = options.unit;
      unit = void 0;
    }
    return diffRelative(base, this.plus(padding), {
      ...options,
      numeric: "always",
      units,
      unit
    });
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  toRelativeCalendar(options = {}) {
    if (!this.isValid) return null;
    return diffRelative(options.base || _DateTime.fromObject({}, { zone: this.zone }), this, {
      ...options,
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    });
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  static min(...dateTimes) {
    if (!dateTimes.every(_DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  static max(...dateTimes) {
    if (!dateTimes.every(_DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }
    return bestBy(dateTimes, (i) => i.valueOf(), Math.max);
  }
  // MISC
  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  static fromFormatExplain(text, fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  static fromStringExplain(text, fmt, options = {}) {
    return _DateTime.fromFormatExplain(text, fmt, options);
  }
  /**
   * Build a parser for `fmt` using the given locale. This parser can be passed
   * to {@link DateTime.fromFormatParser} to a parse a date in this format. This
   * can be used to optimize cases where many dates need to be parsed in a
   * specific format.
   *
   * @param {String} fmt - the format the string is expected to be in (see
   * description)
   * @param {Object} options - options used to set locale and numberingSystem
   * for parser
   * @returns {TokenParser} - opaque object to be used
   */
  static buildFormatParser(fmt, options = {}) {
    const { locale = null, numberingSystem = null } = options, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    return new TokenParser(localeToUse, fmt);
  }
  /**
   * Create a DateTime from an input string and format parser.
   *
   * The format parser must have been created with the same locale as this call.
   *
   * @param {String} text - the string to parse
   * @param {TokenParser} formatParser - parser from {@link DateTime.buildFormatParser}
   * @param {Object} opts - options taken by fromFormat()
   * @returns {DateTime}
   */
  static fromFormatParser(text, formatParser, opts = {}) {
    if (isUndefined2(text) || isUndefined2(formatParser)) {
      throw new InvalidArgumentError(
        "fromFormatParser requires an input string and a format parser"
      );
    }
    const { locale = null, numberingSystem = null } = opts, localeToUse = Locale.fromOpts({
      locale,
      numberingSystem,
      defaultToEN: true
    });
    if (!localeToUse.equals(formatParser.locale)) {
      throw new InvalidArgumentError(
        `fromFormatParser called with a locale of ${localeToUse}, but the format parser was created for ${formatParser.locale}`
      );
    }
    const { result, zone, specificOffset, invalidReason } = formatParser.explainFromTokens(text);
    if (invalidReason) {
      return _DateTime.invalid(invalidReason);
    } else {
      return parseDataToDateTime(
        result,
        zone,
        opts,
        `format ${formatParser.format}`,
        text,
        specificOffset
      );
    }
  }
  // FORMAT PRESETS
  /**
   * {@link DateTime#toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  static get DATE_SHORT() {
    return DATE_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED() {
    return DATE_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
   * @type {Object}
   */
  static get DATE_MED_WITH_WEEKDAY() {
    return DATE_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983'
   * @type {Object}
   */
  static get DATE_FULL() {
    return DATE_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
   * @type {Object}
   */
  static get DATE_HUGE() {
    return DATE_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_SIMPLE() {
    return TIME_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SECONDS() {
    return TIME_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_SHORT_OFFSET() {
    return TIME_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get TIME_WITH_LONG_OFFSET() {
    return TIME_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_SIMPLE() {
    return TIME_24_SIMPLE;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SECONDS() {
    return TIME_24_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_SHORT_OFFSET() {
    return TIME_24_WITH_SHORT_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
   * @type {Object}
   */
  static get TIME_24_WITH_LONG_OFFSET() {
    return TIME_24_WITH_LONG_OFFSET;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT() {
    return DATETIME_SHORT;
  }
  /**
   * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_SHORT_WITH_SECONDS() {
    return DATETIME_SHORT_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED() {
    return DATETIME_MED;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_SECONDS() {
    return DATETIME_MED_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_MED_WITH_WEEKDAY() {
    return DATETIME_MED_WITH_WEEKDAY;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL() {
    return DATETIME_FULL;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_FULL_WITH_SECONDS() {
    return DATETIME_FULL_WITH_SECONDS;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE() {
    return DATETIME_HUGE;
  }
  /**
   * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
   * @type {Object}
   */
  static get DATETIME_HUGE_WITH_SECONDS() {
    return DATETIME_HUGE_WITH_SECONDS;
  }
};
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber2(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError(
      `Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`
    );
  }
}

// packages/mdui-admin/src/resizeObserver.ts
var listeners = /* @__PURE__ */ new WeakMap();
var debounces = /* @__PURE__ */ new WeakMap();
var resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    if (debounces.has(entry.target)) clearTimeout(debounces.get(entry.target));
    debounces.set(entry.target, setTimeout(() => {
      debounces.delete(entry.target);
      const listenArr = listeners.get(entry.target) || [];
      listenArr.forEach((e) => e.requestUpdate());
    }, 100));
  });
});
var observeResize2 = (target, listener) => {
  const listenSet = listeners.get(target) ?? listeners.set(target, /* @__PURE__ */ new Set()).get(target);
  listenSet.add(listener);
  resizeObserver.observe(target);
};
var unobserveResize = (target, listener) => {
  const listenSet = listeners.get(target);
  if (!listenSet) return;
  listenSet.delete(listener);
  if (listenSet.size === 0) {
    resizeObserver.unobserve(target);
    listeners.delete(target);
  }
};

// packages/mdui-admin/src/my-list.tsx
var _showDetail_dec, _a4, _MyList_decorators, _init4, _showDetail;
_MyList_decorators = [customElement("my-list")];
var MyList = class extends (_a4 = JSXElement, _showDetail_dec = [state()], _a4) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _showDetail, __runInitializers(_init4, 8, this, "")), __runInitializers(_init4, 11, this);
    __publicField(this, "pageTitle", "Tracking stats");
  }
  connectedCallback() {
    super.connectedCallback();
    observeResize2(document.body, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unobserveResize(document.body, this);
  }
  openDetail(day, el) {
    console.log(day, el);
    this.dispatchEvent(new CustomEvent("switchWindow", {
      detail: { from: el, to: "detail" },
      bubbles: true,
      composed: true
    }));
  }
  renderItemWithProgress(date, value) {
    const max = 35;
    const reffer = { current: null };
    return /* @__PURE__ */ jsxs(
      "mdui-list-item",
      {
        ref: reffer,
        onclick: () => {
          this.openDetail(date.toISO().slice(0, 10), reffer.current);
        },
        children: [
          /* @__PURE__ */ jsxs("div", { class: "progress", slot: "icon", children: [
            /* @__PURE__ */ jsx(
              "mdui-circular-progress",
              {
                value: 1,
                max: 1,
                class: "progress-background",
                style: "stroke: rgb(var(--mdui-color-surface-container-high));"
              }
            ),
            /* @__PURE__ */ jsx(
              "mdui-circular-progress",
              {
                value,
                max,
                class: "progress-background",
                style: "stroke: rgb(var(--mdui-color-primary));"
              }
            ),
            value === max ? /* @__PURE__ */ jsx("mdui-icon", { name: "check" }) : /* @__PURE__ */ jsx("div", { class: "progress-number", children: value })
          ] }),
          /* @__PURE__ */ jsx("span", { children: date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY) }),
          /* @__PURE__ */ jsx("span", { slot: "end-icon", children: date.hasSame(DateTime.now(), "day") ? "today" : "" })
        ]
      }
    );
  }
  render() {
    const bp = breakpoint();
    const mobile = bp.down("sm");
    const tablet = bp.down("md");
    const desktop = bp.down("lg");
    const bpclass = mobile ? "bp-mobile" : tablet ? "bp-tablet" : desktop ? "bp-desktop" : "bp-wide";
    function* dater() {
      let start = DateTime.now();
      while (true) {
        yield start;
        start = start.minus({ days: 1 });
      }
      return start;
    }
    const d1 = dater();
    let d2;
    return /* @__PURE__ */ jsx("div", { class: `page ${bpclass}`, children: /* @__PURE__ */ jsx("mdui-card", { variant: "filled", class: tablet ? "page-list" : "page-list fixed", children: /* @__PURE__ */ jsxs("mdui-list", { class: tablet ? "list-column" : "list-column fixed", children: [
      /* @__PURE__ */ jsx("mdui-list-item", { children: bpclass }),
      this.renderItemWithProgress(d1.next().value, 25),
      this.renderItemWithProgress(d1.next().value, 15),
      this.renderItemWithProgress(d1.next().value, 30),
      this.renderItemWithProgress(d1.next().value, 10),
      this.renderItemWithProgress(d1.next().value, 20),
      this.renderItemWithProgress(d1.next().value, 35)
    ] }) }) });
  }
};
_init4 = __decoratorStart(_a4);
_showDetail = new WeakMap();
__decorateElement(_init4, 4, "showDetail", _showDetail_dec, MyList, _showDetail);
MyList = __decorateElement(_init4, 0, "MyList", _MyList_decorators, MyList);
__publicField(MyList, "styles", css`
    :host {
      display: flex;
      flex-direction: column;
      flex:1;
    }
    .progress {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
      display:flex;
      align-items: center;
      justify-content: center;
    }
    .progress-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 2.5rem;
      height: 2.5rem;
      /* stroke: rgb(var(--mdui-color-surface-container)) */
    }
    .progress-number {
      font-size: 1rem;
      font-weight: bold;
    }

    .page {
      display:flex;
      flex-direction:row;
      flex:1;
    }
    .page-list {
      width:100%;
      background-color: rgb(var(--mdui-color-surface));
    }
    .bp-desktop .page-list, .bp-wide .page-list {
      max-width: 25rem;
      margin-right:2rem;
    }
    .bp-tablet .page-list {
      max-width: 25rem;
      margin-right:1rem;
    }
    .bp-mobile .page-list {
      /* margin-left: 1rem; */
      /* margin-right: 1rem; */
    }
    .list-column, .detail-column {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .list-completed-check {
      border-width:.25rem;
      border-color: rgb(var(--mdui-color-primary));
      color: rgb(var(--mdui-color-primary));
    }
    
  `);
__runInitializers(_init4, 1, MyList);

// packages/mdui-admin/src/MainPage.tsx
var _current_dec, _showFAB_dec, _title_dec, _page_dec, _a5, _MainPage_decorators, _init5, _page, _title, _showFAB, _current;
_MainPage_decorators = [customElement("main-page")];
var MainPage = class extends (_a5 = JSXElement, _page_dec = [state()], _title_dec = [state()], _showFAB_dec = [state()], _current_dec = [state()], _a5) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _page, __runInitializers(_init5, 8, this, "list")), __runInitializers(_init5, 11, this);
    __privateAdd(this, _title, __runInitializers(_init5, 12, this, "")), __runInitializers(_init5, 15, this);
    __privateAdd(this, _showFAB, __runInitializers(_init5, 16, this, "")), __runInitializers(_init5, 19, this);
    __publicField(this, "navevent", ({ target }) => {
      this.setPage(target.value);
    });
    __privateAdd(this, _current, __runInitializers(_init5, 20, this, null)), __runInitializers(_init5, 23, this);
    __publicField(this, "setCurrent", (e) => {
      console.log("set current", e);
      if (e === this.current) return;
      this.current = e;
    });
    __publicField(this, "navs", [
      { icon: "leaderboard--outlined", value: "list", label: "List" },
      { icon: "image--outlined", value: "images", label: "Images" },
      { icon: "library_music--outlined", value: "library", label: "Library" },
      { icon: "place", value: "item-1", label: "Item 1" },
      { icon: "commute", value: "item-2", label: "Item 2" },
      { icon: "people", value: "item-3", label: "Item 3" }
    ]);
  }
  connectedCallback() {
    super.connectedCallback();
    observeResize2(document.body, this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    unobserveResize(document.body, this);
  }
  firstUpdated() {
    const page = location.pathname.slice(1);
    const nav = this.navs.find((e) => e.value === page);
    if (nav) this.setPage(page);
    else this.setPage(this.page);
  }
  setPage(page) {
    this.page = page;
    this.title = this.navs.find((nav) => nav.value === page)?.label || "MWS";
  }
  render() {
    const bp = breakpoint();
    console.log("render", this.page, this.title, bp);
    const showBar = bp.down("sm");
    const tablet = bp.down("md");
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      showBar ? /* @__PURE__ */ jsx(
        "mdui-navigation-bar",
        {
          onchange: this.navevent,
          value: this.page,
          labelVisibility: "labeled",
          children: this.navs.map((nav) => /* @__PURE__ */ jsx(
            "mdui-navigation-bar-item",
            {
              icon: nav.icon,
              value: nav.value,
              active: this.page === nav.value,
              children: nav.label
            }
          ))
        }
      ) : /* @__PURE__ */ jsxs(
        "mdui-navigation-rail",
        {
          onchange: this.navevent,
          value: this.page,
          children: [
            this.showFAB ? /* @__PURE__ */ jsx(
              "mdui-fab",
              {
                icon: this.showFAB,
                style: tablet ? `position: fixed; bottom: ${showBar ? "6rem" : "2rem"} ; right: 2rem;` : "margin:1rem 0;"
              }
            ) : /* @__PURE__ */ jsx("div", { style: "height:5.5rem;" }),
            this.navs.map((nav) => /* @__PURE__ */ jsx(
              "mdui-navigation-rail-item",
              {
                icon: nav.icon,
                value: nav.value,
                active: this.page === nav.value,
                children: nav.label
              }
            ))
          ]
        }
      ),
      /* @__PURE__ */ jsx("mdui-top-app-bar", { variant: "small", scrolling: window.scrollY > 0, children: /* @__PURE__ */ jsx("mdui-top-app-bar-title", { children: this.current?.pageTitle }) }),
      /* @__PURE__ */ jsx("mdui-layout-main", { children: this.page === "list" && /* @__PURE__ */ jsx("my-list", { ref: this.setCurrent }) })
    ] });
  }
};
_init5 = __decoratorStart(_a5);
_page = new WeakMap();
_title = new WeakMap();
_showFAB = new WeakMap();
_current = new WeakMap();
__decorateElement(_init5, 4, "page", _page_dec, MainPage, _page);
__decorateElement(_init5, 4, "title", _title_dec, MainPage, _title);
__decorateElement(_init5, 4, "showFAB", _showFAB_dec, MainPage, _showFAB);
__decorateElement(_init5, 4, "current", _current_dec, MainPage, _current);
MainPage = __decorateElement(_init5, 0, "MainPage", _MainPage_decorators, MainPage);
__publicField(MainPage, "styles", css`
    :host {
      display:contents;
    }
    mdui-top-app-bar {
      background-color: rgb(var(--mdui-color-surface-container));
      color: rgb(var(--mdui-color-on-surface-container));
    }
    mdui-navigation-rail + mdui-top-app-bar {
      margin-left:5.0625rem;
    }
    mdui-navigation-bar, mdui-navigation-rail {
      background-color: rgb(var(--mdui-color-surface-container));
      color: rgb(var(--mdui-color-on-surface-container));
      border: none;
      box-shadow:none;
    }
    mdui-layout-main {
      position: relative; 
      height:100%;
      display:flex;
      flex-direction:row;
      flex:1;
    }

    my-list {
      flex:1;
    }
  `);
__runInitializers(_init5, 1, MainPage);

// packages/mdui-admin/src/animate.tsx
function openDetail(detail, item) {
  detail.hidden = false;
  detail.classList.add("active");
  const itemRect = item.getBoundingClientRect();
  const detailRect = detail.getBoundingClientRect();
  const dx = itemRect.left - detailRect.left - detailRect.width / 2 + itemRect.width / 2;
  const dy = itemRect.top - detailRect.top - detailRect.height / 2 + itemRect.height / 2;
  const sx = itemRect.width / detailRect.width;
  const sy = itemRect.height / detailRect.height;
  console.log(dx, itemRect.left, detailRect.left);
  console.log(dy, itemRect.top, detailRect.top);
  console.log(sx, itemRect.width, detailRect.width);
  console.log(sy, itemRect.height, detailRect.height);
  const itemStyle = getComputedStyle(item);
  const detailStyle = getComputedStyle(detail);
  const anim = detail.animate(
    [
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: itemStyle.borderRadius,
        opacity: 0.6
      },
      {
        // transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transform: "none",
        borderRadius: detailStyle.borderRadius,
        opacity: 1
      }
    ],
    {
      duration: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--mdui-motion-duration-medium2")),
      // ~300ms
      easing: getComputedStyle(document.documentElement).getPropertyValue("--mdui-motion-easing-emphasized-decelerate"),
      fill: "both"
    }
  );
  return anim;
}
function closeDetail(detail, originatingItem) {
  const itemRect = originatingItem.getBoundingClientRect();
  const detailRect = detail.getBoundingClientRect();
  const dx = itemRect.left - detailRect.left;
  const dy = itemRect.top - detailRect.top;
  const sx = itemRect.width / detailRect.width;
  const sy = itemRect.height / detailRect.height;
  const anim = detail.animate(
    [
      {
        transform: "none",
        borderRadius: getComputedStyle(detail).borderRadius,
        opacity: 1
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: getComputedStyle(originatingItem).borderRadius,
        opacity: 0
      }
    ],
    {
      duration: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--mdui-motion-duration-short4")),
      // ~200ms
      easing: getComputedStyle(document.documentElement).getPropertyValue("--mdui-motion-easing-emphasized-accelerate"),
      fill: "forwards"
    }
  );
  return anim;
}

// packages/mdui-admin/src/main.tsx
setColorScheme("#a45b89");
var themes = "mdui-theme-auto";
document.documentElement.classList.add(themes);
document.documentElement.classList.add("loaded");
var _page_dec2, _a6, _App_decorators, _init6, _page2;
_App_decorators = [customElement("my-app")];
var App = class extends (_a6 = JSXElement, _page_dec2 = [state()], _a6) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _page2, __runInitializers(_init6, 8, this, "home")), __runInitializers(_init6, 11, this);
    __publicField(this, "mainref", { current: null });
    __publicField(this, "ghostref", { current: null });
    __publicField(this, "switchWindow", (event) => {
      const { from, to } = event.detail;
      this.switchDetailView(from, to);
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("switchWindow", this.switchWindow);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("switchWindow", this.switchWindow);
  }
  switchDetailView(from, to) {
    if (from === "detail" && to !== "detail") {
      const anim = closeDetail(this.ghostref.current, to);
      anim.onfinish = () => {
      };
    } else if (to === "detail" && from !== "detail") {
      const anim = openDetail(this.ghostref.current, from);
      anim.onfinish = () => {
        this.page = "detail";
      };
    } else {
      throw new Error("One must be detail.");
    }
  }
  render() {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      this.page === "home" && /* @__PURE__ */ jsx("main-page", { style: this.page === "home" ? "" : "display:none" }),
      this.page === "home" && /* @__PURE__ */ jsx("div", { ref: this.ghostref, class: "detail-ghost" }),
      this.page === "detail" && /* @__PURE__ */ jsx("my-form", {})
    ] });
  }
};
_init6 = __decoratorStart(_a6);
_page2 = new WeakMap();
__decorateElement(_init6, 4, "page", _page_dec2, App, _page2);
App = __decorateElement(_init6, 0, "App", _App_decorators, App);
__publicField(App, "styles", css`
    :host {
      display:contents;
    }
    .detail-ghost {
      display:none;
      position:fixed;
      background: rgb(var(--mdui-color-surface));
      top:0;
      left:0;
      bottom:0;
      right:0;
      opacity:1;
      border:solid black thin;
      z-index:10000;
    }
    .detail-ghost.active {
      display:block;
    }
  `);
__runInitializers(_init6, 1, App);
document.body.appendChild(new App());
var _title_dec2, _a7, _DetailPane_decorators, _init7, _title2;
_DetailPane_decorators = [customElement("detail-pane")];
var DetailPane = class extends (_a7 = JSXElement, _title_dec2 = [state()], _a7) {
  constructor() {
    super(...arguments);
    __privateAdd(this, _title2, __runInitializers(_init7, 8, this, "Detail Pane")), __runInitializers(_init7, 11, this);
    __publicField(this, "onback", () => {
      this.dispatchEvent(new CustomEvent("back", { bubbles: true }));
    });
  }
  render() {
    return /* @__PURE__ */ jsxs("mdui-layout", { children: [
      /* @__PURE__ */ jsxs("mdui-top-app-bar", { "scroll-behavior": "elevate", scrolling: window.scrollY > 0, children: [
        /* @__PURE__ */ jsx("mdui-button-icon", { icon: "arrow_back", onclick: this.onback }),
        /* @__PURE__ */ jsx("mdui-top-app-bar-title", { style: "margin-left:1rem;", children: this.title })
      ] }),
      /* @__PURE__ */ jsx("mdui-layout-main", { children: /* @__PURE__ */ jsx("slot", {}) })
    ] });
  }
};
_init7 = __decoratorStart(_a7);
_title2 = new WeakMap();
__decorateElement(_init7, 4, "title", _title_dec2, DetailPane, _title2);
DetailPane = __decorateElement(_init7, 0, "DetailPane", _DetailPane_decorators, DetailPane);
__publicField(DetailPane, "styles", css`
    :host {
      display: flex;
      flex-direction: column;
    }
  `);
__runInitializers(_init7, 1, DetailPane);
export {
  DetailPane
};
/*! Bundled license information:

@lit/reactive-element/development/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/development/reactive-element.js:
lit-html/development/lit-html.js:
lit-element/development/lit-element.js:
@lit/reactive-element/development/decorators/custom-element.js:
@lit/reactive-element/development/decorators/property.js:
@lit/reactive-element/development/decorators/state.js:
@lit/reactive-element/development/decorators/event-options.js:
@lit/reactive-element/development/decorators/base.js:
@lit/reactive-element/development/decorators/query.js:
@lit/reactive-element/development/decorators/query-all.js:
@lit/reactive-element/development/decorators/query-async.js:
@lit/reactive-element/development/decorators/query-assigned-nodes.js:
lit-html/development/directive.js:
lit-html/development/directives/unsafe-html.js:
lit-html/development/directives/unsafe-svg.js:
lit-html/development/async-directive.js:
lit-html/development/directives/until.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/development/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/development/decorators/query-assigned-elements.js:
lit-html/development/directives/private-async-helpers.js:
lit-html/development/directives/when.js:
@lit/localize/internal/locale-status-event.js:
@lit/localize/internal/str-tag.js:
@lit/localize/internal/types.js:
@lit/localize/internal/default-msg.js:
@lit/localize/internal/localized-controller.js:
@lit/localize/internal/localized-decorator.js:
@lit/localize/internal/runtime-msg.js:
@lit/localize/init/runtime.js:
@lit/localize/init/transform.js:
lit-html/development/directives/map.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/development/directives/if-defined.js:
lit-html/development/directives/style-map.js:
lit-html/development/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/development/directive-helpers.js:
lit-html/development/directives/ref.js:
lit-html/development/directives/live.js:
@lit/localize/internal/deferred.js:
@lit/localize/internal/id-generation.js:
@lit/localize/lit-localize.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/localize/internal/fnv1a64.js:
  (**
   * @license
   * Copyright 2014 Travis Webb
   * SPDX-License-Identifier: MIT
   *)

@material/material-color-utilities/utils/math_utils.js:
@material/material-color-utilities/utils/color_utils.js:
@material/material-color-utilities/hct/viewing_conditions.js:
@material/material-color-utilities/hct/cam16.js:
@material/material-color-utilities/hct/hct_solver.js:
@material/material-color-utilities/hct/hct.js:
@material/material-color-utilities/blend/blend.js:
@material/material-color-utilities/palettes/tonal_palette.js:
@material/material-color-utilities/palettes/core_palette.js:
@material/material-color-utilities/quantize/lab_point_provider.js:
@material/material-color-utilities/quantize/quantizer_wsmeans.js:
@material/material-color-utilities/quantize/quantizer_map.js:
@material/material-color-utilities/quantize/quantizer_wu.js:
@material/material-color-utilities/quantize/quantizer_celebi.js:
@material/material-color-utilities/scheme/scheme.js:
@material/material-color-utilities/scheme/scheme_android.js:
@material/material-color-utilities/score/score.js:
@material/material-color-utilities/utils/string_utils.js:
@material/material-color-utilities/utils/image_utils.js:
@material/material-color-utilities/utils/theme_utils.js:
@material/material-color-utilities/index.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@material/material-color-utilities/contrast/contrast.js:
@material/material-color-utilities/dynamiccolor/dynamic_color.js:
@material/material-color-utilities/dynamiccolor/variant.js:
@material/material-color-utilities/dynamiccolor/material_dynamic_colors.js:
@material/material-color-utilities/dynamiccolor/dynamic_scheme.js:
@material/material-color-utilities/scheme/scheme_expressive.js:
@material/material-color-utilities/scheme/scheme_fruit_salad.js:
@material/material-color-utilities/scheme/scheme_monochrome.js:
@material/material-color-utilities/scheme/scheme_neutral.js:
@material/material-color-utilities/scheme/scheme_rainbow.js:
@material/material-color-utilities/scheme/scheme_tonal_spot.js:
@material/material-color-utilities/scheme/scheme_vibrant.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@material/material-color-utilities/dislike/dislike_analyzer.js:
@material/material-color-utilities/dynamiccolor/contrast_curve.js:
@material/material-color-utilities/dynamiccolor/tone_delta_pair.js:
@material/material-color-utilities/temperature/temperature_cache.js:
@material/material-color-utilities/scheme/scheme_content.js:
@material/material-color-utilities/scheme/scheme_fidelity.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=main.js.map
