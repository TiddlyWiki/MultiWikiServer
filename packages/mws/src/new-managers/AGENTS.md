# New Managers Editing Guide

Use this guide when editing files in this folder. The system has two main paths:

- Runtime wiki requests flow through route adapters into `RecipeResolver`, with `RecipeIndexSender` handling HTML and store delivery.
- Admin requests flow through `TabDataAdapter` into the typed contracts and persistence writers in `TabUpserts`.

Preserve the central invariant that list, read, save, delete, updates, and generated stores agree about which bag owns and exposes each title. `RecipeResolver.ts` is the authority for runtime title routing and visibility. Route and sender code should consume its decisions instead of implementing competing rules.

## File Responsibilities

### `index.ts`

Treat this as the registration and public-export entry point.

- Register recipe, wiki, admin, API, and TW5 documentation routes here.
- Delegate typed recipe routes to `RecipeRoutes.ts`.
- Delegate admin routes to `TabDataAdapter.ts`.
- Delegate wiki and documentation HTML responses to `RecipeIndexSender.ts`.
- Add public module exports here when another package needs them.
- Keep business rules out of this file.

### `NEW-DESIGN-V3.md`

Treat this as the behavioral specification for the folder.

- A public wiki is represented by a recipe and addressed by recipe slug.
- A template supplies reusable defaults.
- A recipe overlays wiki-specific bags, plugins, and access rules.
- The longest matching title prefix selects the writable bag.
- Read-only bags provide fallback content layers.
- A delete affects only the resolved writable bag.
- Recipe and bag permissions jointly determine access.
- Runtime operations must expose a consistent view of the wiki.

Update this document when externally observable behavior changes. Keep implementation and maintenance details in code or a separate engineering document.

### `RecipeResolver.ts`

Treat this as the core runtime domain layer.

- `assertRecipe` loads a recipe, its ordered bags, and relevant permissions, then enforces recipe and bag read access.
- Resolver construction precomputes writable-prefix ordering and read-only bag membership.
- `getWriteTarget` selects the longest matching writable prefix.
- `getReadInfo` and `mapResolveInfo` determine the visible copy, all containing bags, write target, and user writeability.
- List, read, save, and delete operations must share these rules.
- `getIndexData` provides template, plugin, revision, ETag, and bag data to `RecipeIndexSender.ts`.
- `WikiStore` performs low-level tiddler persistence, creates event rows, and emits server events.

Put title routing, bag precedence, runtime permissions, visible-copy behavior, and runtime plugin composition here. Check changes against both `RecipeRoutes.ts` and `RecipeIndexSender.ts`.

### `RecipeRoutes.ts`

Treat this as the HTTP adapter for recipe-scoped runtime operations.

- Define request paths, request schemas, response shapes, and transaction boundaries here.
- Resolve and authorize recipes through `RecipeResolver.assertRecipe`.
- Delegate list, read, save, and delete behavior to a `RecipeResolver` instance.
- Delegate store generation to `RecipeIndexSender.ts`.
- Interpret update events through current resolver routing so hidden or irrelevant bag changes do not become visible wiki changes.
- Do not duplicate title-routing policy here.

The runtime endpoints cover status, title listing, JS and JSON stores, incremental updates, and batch operations.

### `RecipeIndexSender.ts`

Treat this as the streaming HTML and store-delivery layer.

- Resolve and authorize recipes before generating output.
- Obtain wiki state through `RecipeResolver.getIndexData`.
- Choose the default or custom TiddlyWiki HTML shell.
- Initialize plugin cache data before writing plugin assets.
- Handle ETags, conditional requests, preload tags, script tags, and HTML injection points.
- Support external and inline plugin delivery.
- Support external and inline store delivery.
- Stream resolved tiddlers and client metadata without creating a second routing policy.

`WikiStoreWriter` must produce the same visible title set as resolver list and read operations. Client metadata includes bag ownership, revisions, recipe slug, host, and last event ID.

### `TabDataAdapter.ts`

Treat this as the admin-facing translation layer.

- Convert admin `DataSave` rows into normalized inputs for `TabUpserts.ts`.
- Convert persisted records back into `DataStore` rows for the admin client.
- Normalize lists, writable-prefix rows, and permission rows at this boundary.
- Resolve human-readable role, template, and bag names to typed IDs before persistence.
- Keep direct persistence details in `TabUpserts.ts`.

The recipe adapter compiles authored recipe and template definitions into effective bags and plugins. The template adapter recompiles dependent recipes after relevant template changes. Bag, role, and user adapters perform equivalent UI-to-database translation for their domains.

The admin load and save routes belong here because they validate UI data, select the correct adapter, and validate response data.

### `TabUpserts.ts`

Treat this as the reusable persistence, import, rename, and compilation layer.

- Use `PerClassImportWriter` for shared permission assertions, existing-row validation, renaming, and ID/name mappers.
- Keep protected role rules in the role writer.
- Keep user-role relation updates in the user writer.
- Keep bag permission replacement and bag-reference rename propagation in the bag writer.
- Keep template definition and permission replacement in the template writer.
- Keep compiled bag links, recipe permissions, and nested relation validation in the recipe writer.

`compileRecipeSimpleV1` is the authority for combining authored recipe and template configuration:

- Recipe plugins precede template plugins, with duplicates removed.
- Recipe read-only bags precede template read-only bags, with duplicates removed.
- Recipe writable-prefix mappings override template mappings for identical prefixes.
- Writable mappings are ordered from longest prefix to shortest.
- Writable bags precede read-only bags in compiled priority order.

Changes to compilation affect admin responses and future runtime resolution.

### `wiki-contract.ts`

Treat this as the typed boundary between adapters and persistence writers.

- Define normalized upsert inputs here.
- Keep authored recipe definitions distinct from compiled runtime bags and plugins.
- When changing an input, update its producer in `TabDataAdapter.ts` and its consumer in `TabUpserts.ts` together.
- Prefer typed IDs over unvalidated strings for database relations.

### `sessions.ts`

Treat this as the identity, session, login, and password subsystem.

- `AuthUser` is the identity contract consumed by runtime and admin permission checks.
- `parseIncomingRequest` resolves session cookies into a user, role set, and built-in role IDs.
- Session routes handle login, logout, password reset, and password changes.
- Be careful when changing anonymous roles, admin detection, or built-in role semantics because those changes affect `RecipeResolver.ts` and `TabUpserts.ts`.

### `wiki-utils.ts`

Keep only small, policy-free shared helpers here.

- `mapGetInit` supports map-based indexes used by resolver and rename code.
- `thrower` supports expression-oriented lookup failures.

Do not move domain decisions into this utility module.

## Common Editing Paths

For title routing or visible-tiddler behavior, edit and verify this path:

`RecipeResolver.ts` -> `RecipeRoutes.ts` -> `RecipeIndexSender.ts`

For admin schema or form changes, edit and verify this path:

admin tab definitions -> `TabDataAdapter.ts` -> `wiki-contract.ts` -> `TabUpserts.ts`

For template inheritance or recipe compilation, edit and verify this path:

`TabUpserts.ts` -> `TabDataAdapter.ts` -> `RecipeResolver.ts`

For permission changes, trace this path:

`sessions.ts` identity -> resolver and admin permission checks -> Prisma permission levels

For bootstrap or plugin delivery, trace this path:

`RecipeIndexSender.ts` -> resolver index data -> plugin cache APIs

## Editing Rules

- Preserve existing module ownership instead of adding parallel implementations.
- Keep route handlers focused on validation, authorization entry points, and transport concerns.
- Keep runtime routing decisions centralized in `RecipeResolver.ts`.
- Keep admin normalization in `TabDataAdapter.ts` and persistence in `TabUpserts.ts`.
- Update contracts, producers, and consumers together.
- Recompile dependent recipes when template changes alter effective runtime configuration.
- Preserve longest-prefix-first writable routing.
- Preserve coherent all-or-nothing wiki read access unless the behavioral specification is intentionally changed.
- Verify that store generation and API reads expose the same winning tiddler copy.
- Avoid unrelated cleanup in these files; several modules contain transitional types and comments that may be intentionally retained.
