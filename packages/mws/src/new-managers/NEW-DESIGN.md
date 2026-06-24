# Multi-Wiki Multi-User Model — Spec

## Overview

A multi-wiki, multi-user model for TiddlyWiki. Tiddlers are stored in **bags**; tiddlers are routed and composed into wikis by a three-level hierarchy of **wikis → templates → types**. This replaces the recipe model.

Title is the identity of a tiddler and is non-negotiable.

### Hierarchy

- **Type** — a hardcoded kind, built into the software. A type defines how a definition compiles to SQL and declares the **parameter set** it accepts. The types differ only in their routing logic; the endpoint surface above them is uniform. Types are **immutable**: rather than versioning a type, the software adds new types as things change.
- **Template** — a *partially defined wiki*: a type with some of its parameters bound. A template is related to many wikis. **When a template's definition is saved, all of its wikis update automatically** (see Propagation). A template's **parameter set is fixed at creation and can never change**, because the wikis built against it depend on that set; changing it would break them. The bound *values* may be edited freely.
- **Wiki** — the final, fully defined unit, stored as a recipe. A wiki references a template and supplies the **remaining parameters** the template left open. There is **one page per wiki**.

A wiki's effective definition is the template's parameter values merged with the wiki's own. Most templates carry at least one **bag** parameter — typically the writable bag — and a wiki commonly supplies that per-wiki.

### Parameters

- Parameter **values live in JSON** on the template and the wiki. This JSON is the authoritative source for storage, editing, and re-derivation.
- Parameter **effects are derived into other tables** (e.g. `recipe_bag`, `recipe_plugin`), which are queried against directly. Reads do not consult the JSON; they hit the derived tables.
- There are at least three parameter types: **bag**, **plugin**, **string**.
- Bag and plugin parameters become real foreign-key references when derived; the derivation step validates them.

### Propagation

- Derivation happens **at save time**, not at request time.
- Saving a template's definition regenerates `recipe_bag` (and other derived tables) for **every wiki under that template**. The affected wikis are found by template reference. The read path stays a plain query against already-generated rows.

## Types

Each type differs only in how its definition compiles; routing depends only on the definition and the title, never on tiddler content. Each type must be understood by the UI separately, since the client interprets the writability constraints in that type's shape to give the user editing feedback.

- **Ordered list of bags** — bags in priority order; the top bag is writable.
- **Prefix bags + default** — titles starting with a given string route to specified bags; everything else routes to a default bag.
- **Filter expression** — a more powerful filter expression over the title determines routing.

Filters are **client-first**: the canonical filter language is the client's, and server filters use only a subset of it. Reconciling that subset is deferred.

## Plugins

- **Plugins are a separate, version-controlled system**, not bags.
- Some plugins can be **edited**, which creates a **draft version**. A **new version can be published from the draft** for use in wikis.

## Resolution

Resolution is performed by a shared set of filters that all endpoints go through, so single, batch, and list operations always present the **same view of the recipe** and can never disagree about where a title routes.

Two routing rules back everything:

- **Reads** resolve to the top bag containing the title (`readFrom`).
- **Writes** resolve to the writable bag (`writeTo`). Both save and delete are writes and use this same rule.

### `TiddlerInfo` — two halves

`TiddlerInfo` is sourced from two different places:

- **Read half** (`readFrom`, `existsIn`) — a property of the *data*: it depends on which bags actually contain the title, so it is computed by the query. Every read and every list entry gets it directly.
- **Write half** (`writeTo`, `canWrite`) — a property of the *rules*, not the data: it is determined by the wiki's writability rules, which are fixed for the wiki and independent of bag contents. It is communicated to the client once via the status; the client computes write targets per title itself.

### Fields

- `writeTo` — target bag for edits; `null` means read-only / write-prohibited.
- `readFrom` — bag the displayed value comes from; `null` means the title exists nowhere readable.
- `existsIn` — every bag holding the title, in user-facing display order.
- `canWrite` — write access for the requesting user.
- The routing fields are independent: `readFrom` and `writeTo` need not be `existsIn[0]`, and need not equal each other.

### Invariants

- `readFrom`, if non-null, is in `existsIn`.
- `writeTo` need not be in `existsIn` (first edit of a not-yet-existing title).
- Empty `existsIn` implies `readFrom` is null; `writeTo` may still be non-null.

## Endpoints

The server exposes the same set of endpoints for every page (wiki), regardless of type. Type-specific logic is hidden behind the uniform surface. Everything is addressed by **title**, scoped to a wiki; the server resolves the bag.

### RSD — single, by title

- **Read** — returns the resolved tiddler plus its `TiddlerInfo`; the routing comes from the same lookup.
- **Save** — upsert into the writable bag. Create and update are one operation, since title is identity. Denied when there is no writable target.
- **Delete** — a write that removes the writable-bag copy. Deleting from a read-only bag is denied. Deleting from the writable bag **uncovers** whatever read-only bag sits beneath, so the title may still resolve afterward. Delete therefore returns the title's resolved state *after* the operation, so the caller can tell whether the title is gone or merely uncovered.

### Batch

- The same RSD operations over a set of titles. Each title routes independently through the same rules.
- Batches are **per-tiddler**: each item returns its own success or failure. They are not atomic — a denied (e.g. read-only) item does not fail the rest, since denial is a routine outcome in this model, not an error.

### Lists

- The aggregated path over all titles, presenting the same view as RSD.
- Each entry carries **title plus the read half of `TiddlerInfo`** (`readFrom`, and `existsIn` where shadow awareness is needed), since that is already produced by the query. The write half is **not** carried per entry; the client derives it from the write rules in the status.

## Permissions

- **Bags** carry `read`, `write`, `admin`.
- **Recipes (wikis)** carry `read`, `write` for the definition.

- **Principals** are roles. Permission rows reference a `role_id`; there are no per-user or per-group permission rows. Permission levels are stored as prefixed enum values (`A_read`, `B_write`, `C_admin`) so that alphabetical ordering is equivalent to privilege ordering — useful for `ORDER BY level DESC` to get the highest held level in one query.

### Read Gate

To access a wiki's endpoints, a user must have read on *every* bag in the wiki's ordering — including currently empty bags — plus read on the definition. Lacking read on any one bag yields an error page, not a filtered view.

### Write Posture

- Per-tiddler write capability is given by the wiki's write rules (`writeTo` / `canWrite`), communicated to the client via the status.
- Separately, if the wiki determines the user lacks write capability on the page, it may set `writable: false` in the status, causing TiddlyWiki to present the whole page as read-only.

### Change log

Every tiddler save and delete appends a row in `tiddler_event`. Clients poll `/updates?since={seq}` and receive the set of titles changed since their last known `seq`. The server deduplicates using last-event-wins: if a title appears multiple times, only the most recent event type counts. The `tiddler` table itself is never soft-deleted; the event log is the authoritative source for incremental sync.

---

## Interfaces

```typescript
interface TiddlerInfo {
  title: string;
  writeTo: string | null;
  readFrom: string | null;
  existsIn: string[];
  canWrite: boolean;
}
```

---

## Database Layout

### `tiddler` — content

- `bag` (FK → bag) — part of composite PK
- `title` (text) — part of composite PK
- `fields` (json) — tiddler fields / body
- **PK:** (`bag`, `title`)
- index on (`title`) for cross-bag existence / shadow lookups

### `bag` — storage containers

- `id` (PK)
- `name` (text)
- bag-level metadata (TBD)

### `template` — a partially defined wiki

- `id` (PK)
- `type` (text) — which hardcoded, immutable type
- `definition` (json) — bound parameter values; parameter *set* fixed at creation, values editable
- saving this row regenerates the derived tables for every wiki referencing it

### `recipe` — a wiki (final, fully defined)

- `id` (PK)
- `template_id` (FK → template)
- `parameters` (json) — the wiki-level parameter values supplying what the template left open

### `recipe_bag` — derived projection of a wiki's merged definition

- `recipe_id` (FK → recipe) — part of composite PK
- `bag_id` (FK → bag) — part of composite PK
- `priority` (int) — display / read order
- `is_writable` (bool) — marks a write target
- `info` (json, optional) — per-bag metadata used by routing; currently carries a `prefix` string for prefix-bag types, which determines which titles this writable bag accepts
- **PK:** (`recipe_id`, `bag_id`)
- regenerated on template save and on wiki save

### `plugin` — separate versioned plugin system

- `id` (PK)
- `name` (text)
- `version` (text)
- `is_draft` (bool) — true when this is an unpublished draft
- `draft_of` (text, optional) — version string this draft was branched from
- unique on (`name`, `version`)
- supports draft versions created by editing, from which a new version can be published

### `recipe_plugin` — plugins referenced by a wiki (derived)

- `recipe_id` (FK → recipe) — part of composite PK
- `plugin_id` (FK → plugin) — part of composite PK
- `resolved_version` (text)
- **PK:** (`recipe_id`, `plugin_id`)

### `bag_permission`

- `bag_id` (FK → bag) — part of composite PK
- `role_id` (text, references auth module) — part of composite PK
- `level` (enum: `A_read` | `B_write` | `C_admin`)
- **PK:** (`bag_id`, `role_id`)
- no FK declared into the auth module; the two are separately owned

### `recipe_permission`

- `recipe_id` (FK → recipe) — part of composite PK
- `role_id` (text, references auth module) — part of composite PK
- `level` (enum: `A_read` | `B_write`)
- **PK:** (`recipe_id`, `role_id`)

### `tiddler_event` — append-only change log

- `seq` (bigint, autoincrement) — PK; monotonically increasing, used as a polling watermark
- `bag_id` (FK → bag)
- `title` (text)
- `type` (enum: `save` | `delete`)
- index on (`bag_id`, `seq`)
