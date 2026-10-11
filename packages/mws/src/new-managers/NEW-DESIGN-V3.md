# New Design V3

This document describes the developer-facing behavior of the `new-managers` system. It explains what the system models, what it serves, and how developers should think about wikis, templates, bags, and permissions. It does not try to document every internal class or maintenance detail.

## Overview

The system treats a public wiki as a named, database-backed resource addressed by a slug. Internally that wiki is backed by a recipe, but for most developer-facing purposes it is simplest to think in terms of a wiki assembled from three things: a template, a set of bags, and a plugin set.

A template provides shared defaults such as HTML behavior, default bags, and plugin configuration. A wiki adds its own bag mappings, plugins, and access rules. At runtime, requests use the wiki's effective configuration rather than raw admin input.

The authored wiki and template definitions are compiled into the recipe's effective bag ordering and plugin list when the wiki is saved. Saving a non-default template recompiles the wikis that use it. HTML and delivery settings remain template settings and are read when a wiki is served.

## Core Concepts

A bag is a named tiddler store. Bags hold content and carry their own read and write permissions.

A template is a reusable definition that can be shared across many wikis. It supplies default bag structure, plugin settings, and HTML behavior.

A wiki is the public-facing site. It is addressed by slug and resolves to an effective set of bags and plugins.

Plugins extend the client runtime. The server prepares and serves the plugin assets needed to bootstrap the wiki in the browser.

Users, roles, and sessions determine who can see a wiki, who can edit it, and which bags they can read or write.

TiddlyWiki versions are downloaded and extracted into the wiki folder. Plugins are extracted and cached from it at startup. 

## How A Wiki Is Assembled

Each wiki is built from a template plus wiki-specific configuration. Together they determine which bags participate in the wiki, which of those bags are writable, which plugins are loaded, and what HTML shell the client receives.

The current `simpleV1` merge rules are deterministic:

- Wiki plugins come before template plugins, with duplicate titles removed.
- Wiki readonly bags come before template readonly bags, with duplicate names removed.
- Wiki writable mappings override template mappings that use the same prefix.
- Writable mappings are ordered from longest prefix to shortest, followed by readonly bags in their effective order.

Writes are routed by title prefix. The most specific matching writable prefix determines where a title is saved. A title with no matching writable prefix has no write target and cannot be saved through the recipe API. An empty prefix can provide a default writable bag by matching everything. 

For reads, only the writable bag selected for that title is eligible as a source. Copies in other writable bags are reported as existing but cannot become the visible copy. Readonly bags act as fallback content layers beneath the selected writable bag, and the first applicable bag in effective priority order supplies the visible tiddler. This gives each wiki a predictable namespace model: a title is written to one resolved writable location and read from one resolved source.

Deleting follows the same model as writing. A delete applies to the resolved writable location for that title rather than removing the title from every bag that might contain it. Deleting the writable copy can therefore reveal a readonly fallback copy with the same title. Deleting a title that is not present in its writable target is a no-op.

## Runtime Surface

The main runtime entry point is the wiki page itself:

- `GET /wiki/:recipe_slug` returns the HTML bootstrap for the wiki.

The recipe-scoped API provides the supporting runtime data:

- `GET /recipe/:recipe_slug/status` returns the caller's view of the wiki's bag layout and writeability.
- `GET /recipe/:recipe_slug/list.json` lists visible titles together with routing information.
- `GET /recipe/:recipe_slug/store.js` returns the store payload used to bootstrap the client if it isn't sent in the HTML itself.
- `GET /recipe/:recipe_slug/store.json` returns the same resolved store in JSON form.
- `GET /recipe/:recipe_slug/updates?since=` returns recipe-scoped changes since a known revision.
- `PUT /recipe/:recipe_slug/batch/:op` performs batch list, read, save, and delete operations.

The runtime surface is designed so that list, read, save, delete, updates, and store generation all describe the same wiki view.

List and mutation responses include routing metadata: the selected read bag, selected write bag, all recipe bags containing the title, and whether the caller can write to the selected target. Reads also include the stored revision. Saves and successful deletes create monotonically increasing tiddler events, and saved tiddlers use the event sequence as their revision.

The updates endpoint reads events from every bag in the recipe after the supplied sequence, coalesces them to the latest relevant save or delete for each title, and returns separate modification and deletion title lists. Events from readonly bags are relevant, while events from writable bags are relevant only when that bag is the title's current write target. The returned sequence advances to the latest recipe-bag event examined.

## Store And Client Bootstrap

The client is bootstrapped from two pieces: HTML and store data.

The HTML comes either from the default TiddlyWiki shell or from template-defined custom HTML. The store contains the resolved tiddlers for the wiki plus the metadata the client needs to understand the current recipe, bag ownership, host, and revision state.

Depending on server and template configuration, plugin assets and store data may be delivered as external resources or injected into the HTML response. That delivery choice changes how the browser receives the data, but not what wiki content the client sees.

For the default TiddlyWiki shell, the server adds `$:/core` automatically. It can also add the server's required plugin set when the template enables it. Those bootstrap plugins are followed by the effective recipe plugin list with duplicate titles removed. Custom HTML does not receive `$:/core` automatically and must provide a compatible injection location and preload function.

External plugin assets are preloaded and served with integrity hashes. The external store is linked from the HTML and may reuse the short-lived data prepared for the matching page request. Inline stores are either emitted through the configured preload function for custom HTML or spliced into the default TiddlyWiki JSON store.

Wiki HTML and store responses use private, revalidation-oriented caching with ETags. `HEAD` requests perform authorization and metadata generation without streaming bag tiddlers. The server also exposes `GET /tw5/:version` to serve the cached documentation wiki for an installed TiddlyWiki version.

## Administration

The admin surface manages wikis, templates, bags, users, and roles. In this model, a wiki is the editable public resource, a template is the reusable shared definition, and a bag is the underlying storage unit.

`GET /admin/load` returns the records visible to the caller plus the plugin catalog. `PUT /admin/save/:tab` validates and saves one wiki, template, bag, user, or role row. Wiki slugs may not begin with `$`, and every wiki must reference an existing template.

Saving a wiki recompiles its effective bags and plugins. Saving a non-default template recompiles every wiki that depends on it while preserving each wiki's authored definition and permissions. The built-in blank template is restricted: the admin save path preserves its existing definition and only updates external plugin delivery, external store delivery, and template permissions.

Renaming a bag updates bag-name references embedded in affected wiki and template definitions before renaming the bag itself. Saving a recipe, template, or bag replaces its compiled links or permission rows rather than merging individual relation rows.

Plugin entries are exposed through the admin load path so they can be selected and inspected, but this path does not treat plugins as editable database rows in the same way as wikis, templates, bags, users, and roles.

TiddlyWiki versions are updated through the CLI at the moment.

User administration covers profile-like data and role membership. Password creation, login, reset, and password change belong to the session and password subsystem rather than to admin row saves.

Non-admin admin views are filtered to recipes, templates, and bags on which one of the caller's roles has a permission row. User lists are available only to site administrators, while role names remain available for resolving permission and membership controls. The built-in `ADMIN` and `USER` roles cannot be modified through ordinary admin saves.

## Permissions

Access is role-based.

Permission levels are hierarchical: read, write, and admin. A higher level includes the lower capabilities. Recipe permissions determine whether a wiki is available to a user at all. Bag permissions determine whether the user can read from or write to the bags that make up that wiki. Template permissions govern template management rather than live wiki access.

The runtime presents a wiki as a coherent whole rather than a partially filtered bag set. A non-admin caller must have a permission row on the recipe and on every bag in its effective ordering, including empty bags; otherwise the entire wiki request is denied. A caller can have access to a wiki while still being unable to modify a specific title if that title has no writable target or resolves to a bag on which the caller lacks write permission.

Site administrators bypass the recipe and bag read gate. They normally bypass bag write restrictions as well, but an explicit permission for the built-in admin role can keep a bag readonly for administrators. Admin management uses separate gates: modifying recipes and templates requires their admin-level management permission, modifying bags requires bag-admin permission, non-admin users may edit only their own user row, and roles require site-administrator access. Non-admin callers cannot create permission-managed records.

## Sessions And Identity

Sessions resolve the current user and that user's roles for every request. A valid session supplies the user identity, role memberships, and site-administrator flag. Requests without a valid session use an anonymous identity with no roles. Those roles are then used consistently across wiki access checks, bag write checks, and admin operations.

Login is a two-step password-service exchange. Successful login creates a database session and normally sets an HTTP-only cookie. Logout can remove the current cookie-backed session or verify a signed session request when cookie handling is intentionally skipped. Password reset and password change use the password service rather than accepting a plaintext password in admin data. Automated forgot-password email delivery is not implemented.

The public identifier for a wiki is its slug. Developers working on the runtime surface should treat that slug as the stable address of the wiki.

## Scope

This document is intentionally about behavior, not internals. It describes what the system does and how developers should use it. Detailed implementation notes, internal data flow, and maintenance quirks belong in a separate engineering document if they need to be captured.