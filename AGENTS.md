When the user changes subject or goes on a side tangant about something, assume first that they are making a comment and respond, rather than being too quick to edit files related to the side tangent before they tell you what they want. 

## Workspace instructions

- Prefer the following tools: get_errors, vscode_listCodeUsages, vscode_renameSymbol, lsp_code_actions, lsp_completion, lsp_definition, lsp_document_symbols, lsp_format_document, lsp_hover, lsp_references, lsp_rename_symbol, lsp_signature_help, lsp_workspace_symbols.

## JSXElement conventions

- Declare required props with `@state() accessor props!: PropsType;` without a default initializer. Props are assigned before the first render.
- Do not wrap JSX fragments in parentheses unless required by syntax. Use `() => <>...</>` and `return <>...</>;` directly, including for multiline fragments.

### Rendering and composition

- `JSXElement` extends Lit's `ReactiveElement` and is an actual custom element in the DOM, not a React component. Lit provides reactive scheduling and lifecycle; JSX is rendered by `@tiddlywiki/jsx-runtime`, not React or `lit-html`.
- Register subclasses with `@customElement("element-name")` and implement `protected render()` to return `JSX.Node`.
- When rendering `<SomeElement ... />`, the JSX runtime constructs or reuses the element and assigns the complete JSX props object to its `.props` property. Objects and callbacks remain JavaScript values, not serialized attributes.
- Use render-function props for composition, for example `renderContent: () => JSX.Node`. The receiving element explicitly calls `this.props.renderContent()`. These callbacks are not React function components.
- Keep layout components independent of domain data: accept render functions for content rather than imposing a universal field schema.
- Use DOM event props such as `onclick` and `oninput`; handlers receive native events, not React synthetic events.
- For class-element JSX, `class`, `className`, `style`, `slot`, `id`, and `webjsx-*` props are also applied to the host. Other props, including event callbacks, are only assigned through `.props` and must be used by the component. `ref` receives the actual element.

### JSX runtime directives

- `webjsx-attr-NAME`: forward a value to the host's `NAME` attribute, including on class elements, for example `webjsx-attr-open={true}`. Uses normal attribute handling: `true` becomes an empty attribute; `false`, `null`, and `undefined` remove it. This is not DOM property assignment.
- `webjsx-watch-NAME`: supply `{ get?, set? }` to watch a DOM attribute. `get()` supplies its value during rendering; `set(value)` receives the current attribute string or `null` through a MutationObserver. Any observed attribute mutation can invoke the setter, not just changes to `NAME`.
- `webjsx-on-EVENT`: attach a native event listener to the host, including on class elements, for example `webjsx-on-click={handler}`. The event name is lowercased; the runtime replaces changed handlers and removes omitted ones.
- `webjsx-donotdescend`: skip reconciliation of the element's children while still updating its props and attributes. A truthy JSX prop or host property enables it; light-DOM `JSXElement` hosts expose it automatically.
- `webjsx-debugger`: trigger a JavaScript `debugger` statement when the runtime creates or replaces an element whose incoming or previous props have this flag enabled. It is not applied as a DOM attribute and does not pause ordinary reuse updates.

### Light DOM and styling

- Use `useLightDOM = true` for admin components so their rendered content inherits the shared styles in `packages/admin-vanilla/src/main.css`. The default is shadow DOM.
- In light DOM, the element renders into itself. The parent JSX renderer does not descend into its children; the element owns that subtree. Pass content through render props rather than expecting native shadow-slot behavior.
- The host is already a DOM element. Use host properties such as `this.hidden` instead of adding a child wrapper solely to hide the component. Host elements also participate in layout; account for them in grid, flex, and direct-child selectors. Use `display:contents;` if their presence is undesired.
- Styles supplied through Lit's element styles are installed globally in light DOM and reference-counted when useLightDOM is true.
- Returning `null` clears rendered children but does not remove the host from its parent. Returning `JSXElement.DO_NOT_RENDER` leaves the existing rendered children untouched.
- Keep components that need persistent lifecycle or animation state mounted; change their props instead of conditionally creating and removing them.

### Reactive updates and lifecycle

- `@state()` accessors schedule updates when assigned changed values. Replace draft objects and arrays rather than relying on nested mutation to trigger rendering.
- Call `requestUpdate()` when changing non-reactive state. Mutating an object captured by a render callback does not automatically update the element that invokes it.
- With plain `@state() accessor props`, each parent render supplies a fresh JSX props object. Lit compares the object by identity, so assigning it schedules a child update even when all individual prop values and callback references are unchanged. This cascades through rendered descendants and invokes their render callbacks again; stable callbacks do not block this update path.
- Call `super.connectedCallback()` and `super.disconnectedCallback()` when overriding them. Connection requests an update; disconnection cleans up subscriptions and resets hook state.
- Use `this.subs.add(...)` for subscriptions and teardown functions. The base class unsubscribes and creates a fresh subscription container on disconnection.
- `willUpdate`, `updated`, and `firstUpdated` follow Lit's lifecycle. Preserve the base implementation when overriding these methods.

### Built-in hooks

- Hooks are protected methods on the element, such as `this.useState(...)`, not React imports. Call them during rendering in a stable order and count; conditional hook calls or early returns that skip hooks cause runtime errors.
- `useState` retains a value and provides a setter that requests an update when the value changes.
- `useMemo` retains a computed value until its dependency array changes. Dependencies use `Object.is` comparisons.
- `useEffect` runs synchronously during rendering when dependencies change, not as a React post-render effect. It accepts a cleanup function or `Subscription`; cleanup runs before replacement and on disconnection.
- `useAsyncMemo` exposes `value`, `loading`, and `error` and requests an update when its promise settles. It does not cancel requests or launch a replacement while already loading; do not assume stale-result protection.
- `useEventListener` manages DOM or EventEmitter listeners; `useObserveResize` manages resize observation and requests updates.
- `useWillUpdate`, `useUpdated`, and `useFirstUpdated` register lifecycle listeners.
- If used, `useKey` must be the first hook. A changed key resets hook state and subscriptions, not the rendered children or instance properties. This is distinct from JSX's element `key` prop.

Implementation references: [JSXElement](packages/jsx-lit/src/JSXElement.tsx) and [JSX DOM renderer](packages/jsx-runtime/jsx-render.ts).


