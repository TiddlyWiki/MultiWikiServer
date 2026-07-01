# Multi-Wiki Multi-User Model

## Purpose

This document defines the behavioral design for the new wiki model under `packages/mws/src/new-managers`. It is intended to be more stable than the current implementation and more concrete than the earlier sketch in `NEW-DESIGN.md`.

It does not attempt to fully document every schema field. The schema is an implementation snapshot. This document defines the model, invariants, routing rules, permission rules, and endpoint contracts that the code should satisfy.

## Goals

- Replace the old recipe-centric bag resolution logic with a single explicit model.
- Keep the external wiki endpoint surface uniform even when routing rules differ by wiki type.
- Ensure single-item, batch, list, and update endpoints all see the same effective wiki view.
- Make read and write resolution predictable enough for the client to explain behavior to users.
- Keep request-time resolution cheap by compiling wiki definitions into derived tables at save time.
- Support future wiki types without changing the endpoint contract.

## Non-Goals

- This document does not define the admin/editor UI in detail.
- This document does not fully specify plugin authoring or publication workflows.
- This document does not require all future routing logic to be expressible in SQL today.
- This document does not require the schema names to match user-facing terminology forever.

## Core Model

There are three conceptual layers:

- Type: a hardcoded routing strategy implemented by server code.
- Template: a partially bound definition for one type.
- Wiki: a fully usable page built from a template plus per-wiki parameters.

Current storage maps the final wiki to `Recipe`, while derived bag routing is stored in `RecipeBag`.

### Why These Layers Exist

- Types let routing semantics evolve by adding new handlers instead of mutating old behavior in place.
- Templates let many wikis share the same routing structure.
- Wikis let the final page differ only in the parameters left open by the template.

## Definitions

### Type

A type declares:

- which parameters exist
- which of those parameters may remain open on the template
- how the merged template and wiki parameters compile into derived rows
- how writes are resolved for a title
- which routing facts the client needs in status responses

Types are immutable in behavior once shipped. If routing semantics change materially, a new type name should be introduced.

### Template

A template is a reusable partial definition of a wiki.

A template contains:

- a `type`
- a `definition` JSON document with bound parameter values

Template invariants:

- A template's parameter set is fixed when the template is created.
- Parameter values may change.
- Saving a template triggers recompilation of all dependent wikis.

### Wiki

A wiki is the final addressable page.

A wiki contains:

- a reference to a template
- `parameters` JSON supplying the remaining values

Wiki invariants:

- The merged template definition plus wiki parameters must fully determine routing.
- A wiki has one effective ordered bag view.
- All endpoints operate in the scope of exactly one wiki.

## Parameter Model

Parameter values are authored in JSON but consumed through compiled derived rows.

### Source of Truth

- Template `definition` JSON is the source of truth for template-bound values.
- Wiki `parameters` JSON is the source of truth for wiki-bound values.

### Derived State

Compiled state exists so reads do not need to interpret JSON at request time.

At minimum, compilation may derive:

- `RecipeBag`
- `RecipePlugin`

Compilation must validate referenced bags and plugins before derived rows are committed.

### Merge Rules

The effective wiki definition is formed by merging template-bound values with wiki parameters.

Rules:

- The template may pre-bind any subset allowed by the type.
- The wiki may only supply parameters the template left open.
- The merged result must satisfy the full parameter set declared by the type.

## Routing Model

Routing is title-based. Tiddler content never determines which bag a request reads from or writes to.

There are two routing functions:

- `readFrom(title)`: the highest-priority readable bag in the wiki that currently contains that title.
- `writeTo(title)`: the writable bag chosen by the wiki's type rules for that title, or `null` if writes are not allowed.

These functions are shared across all endpoint forms.

### Read Semantics

- Reads resolve to the first bag in effective priority order that contains the title.
- A title may exist in multiple bags.
- The user sees the topmost readable value, not a merge of field values across bags.

### Write Semantics

- Saves and deletes are both writes.
- Writes target the bag chosen by `writeTo(title)`.
- If `writeTo(title)` is `null`, the title is read-only for that wiki.
- The write target does not depend on whether the title currently exists.

### Shadowing and Uncovering

- If a writable bag contains a title that is also present in lower-priority bags, the writable copy shadows the others.
- Deleting the writable copy may uncover a lower-priority readable copy.
- Delete therefore returns post-delete resolution state, not just write success.

## TiddlerInfo Contract

The user-facing routing contract is:

```ts
interface TiddlerInfo {
  title: string;
  writeTo: string | null;
  readFrom: string | null;
  existsIn: string[];
  canWrite: boolean;
}
```

### Meaning

- `title`: the logical tiddler identity.
- `writeTo`: the bag name that would receive a save or delete.
- `readFrom`: the bag name currently supplying the visible value.
- `existsIn`: every bag that currently contains the title, in display order.
- `canWrite`: whether the requesting principal may write to the resolved target.

### Invariants

- `readFrom === null` if and only if `existsIn.length === 0`.
- If `readFrom` is non-null, it appears in `existsIn`.
- `writeTo` may be non-null even when `existsIn` is empty.
- `writeTo` does not need to equal `readFrom`.
- `canWrite` is false whenever `writeTo` is null.

### Client Division of Responsibility

The server computes both the read half and write half consistently.

The client may cache write posture from status if the type exposes enough structure, but server responses remain authoritative.

## Supported Type Shapes

This section defines the intended behavior of the initial type family. Names may differ in code, but the behavior should match.

### Ordered Bags

- The wiki has an ordered list of bags.
- The top bag is writable.
- Reads search bags in priority order.
- Writes always target the top bag.

### Prefix Bags With Default

- The wiki has zero or more writable prefix rules and one default target.
- The longest matching prefix wins.
- Read-only bags may still appear in the stack beneath writable targets.
- Reads only consider bags that are part of the compiled effective ordering.

### User-Partitioned Variants

Some future types may map a title to a user-specific partition or write area.

If this is supported, the type must define:

- how the partition key is derived
- whether other users can detect existence in that partition
- whether list endpoints expose partitioned titles globally or only to the owning principal

This behavior is intentionally left as a type-specific extension, not a global default.

## Permissions

Permissions are role-based.

- Bag permissions govern access to stored tiddlers.
- Recipe permissions govern access to the wiki definition and endpoint surface.

### Levels

- Bag levels: `A_read`, `B_write`, `C_admin`
- Recipe levels: `A_read`, `B_write`

The prefixed enum ordering is intentional. Descending lexical order yields the highest held privilege.

### Read Gate

To access a wiki, a requester must have:

- read access to the recipe definition
- read access to every bag in the effective wiki ordering

This is a hard gate. The system does not produce a partially filtered wiki view when a bag is unreadable.

Reasoning:

- A filtered view would make routing and shadowing inconsistent.
- Two endpoints could disagree about visible state if some bags were silently hidden.
- The client must treat the wiki as a single coherent page.

### Write Authorization

Write permission is evaluated against the resolved `writeTo` bag.

Rules:

- Admin users bypass normal bag-level write checks.
- If the title has no writable target, writes are denied even if the user has write on some bag.
- If the title has a writable target but the user lacks bag write access, writes are denied.

### Page-Level Writable Posture

The status response may include enough information for the client to decide whether the page should be presented as generally writable.

That page-level posture must never contradict per-title write results.

## Compilation Model

Compilation converts the authored template/wiki JSON into derived rows used by the request path.

### When Compilation Runs

- on template create
- on template update
- on wiki create
- on wiki update

### What Compilation Produces

At minimum:

- ordered `RecipeBag` rows
- `is_writable` markers
- `info` metadata needed by routing, such as prefix strings
- `RecipePlugin` rows after plugin resolution

### Atomicity

Compilation for one wiki should be transactional.

Effects:

- old derived rows are replaced as one unit
- request-time reads never observe a half-compiled wiki
- template-driven fanout recompilation should update each affected wiki atomically, even if the full batch is processed incrementally

### Validation Failures

Compilation must fail if:

- a referenced bag does not exist
- a referenced plugin or version does not exist
- the merged parameters do not satisfy the type
- a type-specific invariant is violated, such as a missing default writable bag for a prefix-based type

## Endpoint Surface

Every wiki exposes the same endpoint families regardless of type.

The type changes routing behavior, not the public route layout.

### Status

Returns wiki-level context needed by the client, including at least:

- user identity and login posture
- template type
- merged or mergeable routing inputs relevant to the client
- bag ordering metadata
- writable posture hints

### List

Returns one entry per visible title for the wiki.

Each entry includes at least:

- `title`
- `readFrom`
- `existsIn` where shadow awareness matters

Including `writeTo` and `canWrite` on every list row is allowed, but not required if status already provides enough information for the client.

### Single Read

Returns:

- the resolved tiddler fields
- `TiddlerInfo`

If the title is not present in any readable bag, this returns not found.

### Save

Input:

- a tiddler field map including `title`

Behavior:

- resolve `writeTo(title)`
- upsert into the target bag
- append a `save` event
- return the post-save `TiddlerInfo`

### Delete

Input:

- a `title`

Behavior:

- resolve `writeTo(title)`
- remove that bag's copy if present
- append a `delete` event
- return the post-delete `TiddlerInfo`

Delete is valid even when lower bags still contain the title. In that case the title remains readable after deletion.

### Batch

Batch operations succeed or fail as a whole.

The request is treated as one operation at the API contract level. If any item in the batch is invalid or denied, the batch fails rather than returning a mixed per-item result set.

Atomicity of the underlying writes is not yet defined.

Reasons:

- callers should not have to reconcile mixed success and failure outcomes inside one batch response
- the server contract is simpler if batch validation and authorization failures abort the batch response
- routing may still differ per title, but that no longer implies partial success is part of the public contract

## Change Log and Sync

Incremental sync is event-based.

### Event Model

Each successful save or delete appends one `TiddlerEvent` row.

The event log is authoritative for incremental polling. The content table is authoritative for current value resolution.

### Polling Contract

Clients poll with a watermark sequence and receive:

- titles whose last event since that watermark is `save`
- titles whose last event since that watermark is `delete`
- the new watermark

Deduplication rule:

- if a title changes multiple times during the interval, only the last event for that title is returned

### Consistency Expectation

After receiving updates, the client may re-read affected titles or reload list views. The resolver guarantees those reads use the same routing rules as the list view and batch operations.

## Plugin Model

Plugins are not bags and should stay separate.

Baseline design:

- a plugin is identified by name and version
- draft versions may exist
- wiki/plugin relationships are compiled into derived `RecipePlugin` rows

Open implementation choice:

- whether template definitions pin exact versions or symbolic channels before compile time

The design requirement is only that the resolved plugin set for a wiki be explicit and reproducible.

## Index Rendering

The wiki HTML endpoint serves one page per wiki.

It is responsible for:

- validating read access to the whole wiki
- injecting preload or external plugin references
- injecting initial store tiddlers for the effective resolved wiki view
- emitting a stable cache validator that changes when relevant wiki content changes

### Cache Inputs

The HTML cache key should incorporate at least:

- the base template file
- effective bag ordering
- resolved plugin assets
- latest relevant tiddler event or equivalent change watermark

The exact digest algorithm is not important; the invalidation behavior is.

## Operational Invariants

These are the most important invariants for implementation and tests.

- All endpoint forms for the same wiki must agree on `readFrom(title)`.
- All endpoint forms for the same wiki must agree on `writeTo(title)`.
- The list endpoint must never show a title as visible if single-read would fail for that same title.
- Save followed by read must return the saved tiddler from the write target.
- Delete followed by read must either uncover a lower bag or return not found.
- Update polling must eventually report every successful save and delete.
- Missing read access on any bag in the wiki must block all wiki endpoints.
- Derived rows must be sufficient for request-time routing without reparsing template/wiki JSON.

## Recommended Test Matrix

Minimum coverage should include:

- ordered-bag read shadowing
- ordered-bag delete uncovering
- prefix longest-match write routing
- titles with no existing copy but a valid write target
- titles with existing read copies but no writable target
- a user with recipe read but missing one bag read permission
- a user with bag read but no bag write on the resolved target
- batch save with mixed allowed and denied items
- updates polling with multiple events for one title
- template recompilation affecting multiple wikis

## Open Questions

These should be resolved before treating the design as final.

- Should single-item endpoints exist separately from batch endpoints, or is batch with one item sufficient?
- Should list responses always include `existsIn`, or only when requested?
- Should delete append an event when the writable bag did not contain the title?
- How should partitioned or user-scoped types expose list semantics?
- Should wiki routes eventually address pages by slug while API routes stay on stable ids?
- How much of type-specific routing metadata should the status endpoint expose directly to the client?

## Migration Guidance

The old system and the new system use similar words differently. During migration:

- treat old recipe behavior as an implementation predecessor, not the source of truth
- keep new routing logic centralized in a resolver layer
- avoid duplicating bag-selection logic in route handlers
- prefer compiling wiki structure into derived rows instead of embedding resolution rules in ad hoc queries

## Implementation Guidance

The implementation should keep a strict separation between:

- authored state: template definition and wiki parameters
- compiled state: recipe bags and recipe plugins
- resolved state: tiddler reads and write targets for a given title and principal

If the code preserves that split, the model remains understandable as new wiki types are added.

## Structure Lockdown

The current code is close enough to a stable shape that the next work should not be more exploratory refactoring. It should be convergence work against a fixed set of module responsibilities.

This section defines the intended ownership boundaries.

### Module Responsibilities

#### `wiki-contract.ts`

This file owns transport and persistence input contracts only.

It should contain:

- import and upsert DTOs
- compiled row DTOs
- no Prisma reads
- no normalization logic
- no routing logic

#### `wiki-actions.ts`

This file is the admin-facing translation boundary.

It should contain:

- conversion between admin tab rows and domain input DTOs
- normalization of user-edited arrays and mapping rows
- orchestration of save operations through import writers
- projection from persisted state back into admin datastore rows

It should not contain:

- request-time routing logic
- bag selection rules
- direct write logic that bypasses import writers

#### `wiki-import.ts`

This file owns authored-state persistence and compilation.

It should contain:

- upsert behavior for roles, users, bags, templates, and wikis
- rename propagation rules for authored definitions
- compilation from authored JSON into derived recipe rows
- validation that referenced bags and plugins exist before commit

It should not contain:

- route handling
- request-time tiddler reads and writes
- ad hoc resolver behavior

#### `RecipeResolver.ts`

This file is the only authority for request-time wiki resolution.

It should contain:

- wiki access gating for runtime endpoints
- read resolution for one title and many titles
- write target resolution for one title and many titles
- list, read, save, delete, and update semantics derived from one shared routing model
- index-page data assembly for an already-compiled wiki view

It should not contain:

- admin save orchestration
- compilation from template/wiki definitions into derived recipe rows
- direct knowledge of UI tab storage shapes

#### `wiki-store.ts`

This file owns low-level tiddler persistence and event emission.

It should contain:

- upsert and delete against the concrete bag target
- append-only event creation

It should not contain:

- permission decisions
- bag routing decisions
- admin data transformations

#### `wiki-routes.ts`

This file is a transport shell.

It should contain:

- HTTP route declarations
- request validation
- auth preconditions delegated to resolver methods
- transaction boundaries
- translation between HTTP payloads and resolver calls

It should not contain:

- title routing rules
- bag selection logic
- duplicated permission policy

#### `wiki-utils.ts`

This file should stay narrowly generic.

It should contain only helpers that are:

- domain-neutral
- side-effect free unless their name makes the side effect obvious
- too small to deserve their own module

### Enforcement Rules

These rules are the practical way to keep the structure from drifting again.

- Only `RecipeResolver` may decide `readFrom(title)` and `writeTo(title)`.
- Only the import layer may compile authored JSON into `RecipeBag` and related derived rows.
- Route handlers may validate inputs and start transactions, but may not implement wiki behavior.
- `WikiStore` receives a concrete `bag_id`; it never figures out which bag to touch.
- Admin save paths must go through the import writers; they should not issue parallel ad hoc Prisma updates elsewhere.
- Authored JSON should be treated as immutable input. Any normalization or merge should produce new values rather than mutating caller-owned objects in place.
- Runtime failures that cross module boundaries should be structured errors, not strings.
- When a rule exists in both comments and code, tests should be written against the rule and the comment should be treated as a contract, not decoration.

## Remaining Convergence Work

The remaining work is not random cleanup. It is a short list of places where the implementation still violates the structure above or leaves the behavior under-specified.

### 1. Unify the Permission Model in One Runtime Contract

This is the highest-priority inconsistency.

Today the code has two overlapping gates:

- `assertRecipe(...)`
- `assertRecipeAccess(...)`

Those functions are close in purpose but not identical in behavior. They should either collapse into one runtime access contract or be split into clearly different responsibilities with names that reflect the split.

Required outcome:

- one definition of wiki read eligibility
- one definition of wiki write eligibility
- one consistent interpretation of permission hierarchy
- no route that can pass one gate and fail another for the same reason

### 2. Remove Policy Duplication From the Route Layer

The route file is still doing repeated access choreography before every resolver call. That is a maintainability smell even if the logic is correct.

Required outcome:

- route handlers become thin wrappers
- shared authorization and wiki-loading flow moves behind resolver-facing helpers
- route code stops repeating the same state mutations and access calls

### 3. Normalize Batch Error Semantics

The design now says batch operations fail as a whole, while storage-level atomicity remains undefined. The implementation should reflect that explicitly rather than accidentally through whatever exception happens to escape.

Required outcome:

- resolver batch methods have one clear failure contract for validation, authorization, and routing errors
- expected batch rejection uses structured errors, not raw thrown strings
- transport code does not have to infer whether a thrown failure means full rejection or partial success
- the code and docs do not imply transactionality unless the implementation actually guarantees it

### 4. Separate Pure Compilation From Persistence Side Effects

The compiler shape is good, but the layer is still too coupled to persistence concerns.

Required outcome:

- compilation logic can be reasoned about as a pure authored-definition to compiled-definition transform except for referenced-row lookup
- persistence code applies the compiled result transactionally
- rename propagation and recompilation rules are explicit about whether they edit authored definitions, compiled rows, or both

### 5. Replace Type-System Escape Hatches With Domain Types

Some of the remaining roughness comes from generic importer machinery and `any`-style escape hatches. Those shortcuts were useful during scaffolding, but they now obscure the domain model.

Required outcome:

- reduce mutation-through-casts patterns
- reduce generic Prisma indirection where concrete model-specific logic is clearer
- prefer explicit domain return types when a module is part of the core wiki model

This does not mean removing every abstraction. It means keeping only the abstractions that make the rules easier to audit.

### 6. Make Status, List, Read, and Update Contracts Explicitly Coherent

The system goal is that all endpoint forms expose the same wiki view. That is mostly true structurally, but the exact payload contract is still partly implied by the code.

Required outcome:

- document which routing facts appear in status
- document which routing facts appear in list and read responses
- document which events count as meaningful updates for a wiki view
- write tests that assert those surfaces agree on the same underlying resolution rules

### 7. Define Rename and Recompile Guarantees

Bag and template edits can affect many dependent rows. The code already attempts to keep that consistent, but the guarantees are not yet stated strongly enough.

Required outcome:

- define when authored definitions are rewritten during rename
- define when dependent wikis are fully recompiled versus lightly rewritten
- define whether partial completion is acceptable during fanout operations

### 8. Add Structural Tests Before Further Feature Work

The next productive step is not more feature branching. It is locking the existing model with tests around the invariants already claimed in this document.

Minimum priority tests:

- permission hierarchy and gating
- resolver agreement across list, read, save, delete, and updates
- prefix longest-match routing
- delete uncover semantics
- template-save recompilation of dependent wikis
- batch rejection on one denied or invalid item
- batch behavior under partial-write risk until atomicity is explicitly defined

## Practical Plan

If the goal is to lock the structure down without you manually rewriting everything first, the realistic sequence is:

1. Treat this document as the contract for the current subsystem.
2. Refactor only where the code violates one of the module boundaries or invariants above.
3. Add tests for the runtime invariants before adding another wiki type or more admin behavior.
4. After the tests are in place, simplify internals aggressively where they are still carrying scaffolding-era compromises.

That is enough to move the subsystem from "partially stabilized" to "owned by a design" without pretending the remaining cleanup is trivial.