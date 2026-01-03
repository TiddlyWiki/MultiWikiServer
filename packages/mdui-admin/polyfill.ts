((origDefine) => {
  const customElementsLookup = new Map<CustomElementConstructor, string>();
  const customElementsNames = new Map<string, CustomElementConstructor>();
  customElements.define = (name, constructor, options) => {
    origDefine.call(customElements, name, constructor, options);
    customElementsLookup.set(constructor, name);
    customElementsNames.set(name, constructor);
  };
  customElements.getName = (constructor) => {
    return customElementsLookup.get(constructor) ?? null;
  };
  customElements.get = (name) => {
    return customElementsNames.get(name);
  };
})(customElements.define);
