# MWS Server Architecture Explained

## Overview

The system treats a public wiki as a named, database-backed resource addressed by a slug. Internally that wiki is backed by a recipe, but for most developer-facing purposes it is simplest to think in terms of a wiki assembled from three things: a template, a set of bags, and a plugin set.

A template provides shared defaults such as HTML behavior, default bags, and plugin configuration. A wiki adds its own bag mappings, plugins, and access rules. At runtime, requests use the wiki's effective configuration rather than raw admin input.

## Core Concepts

A bag is a named tiddler store. Bags hold content and carry their own read and write permissions.

A template is a reusable definition that can be shared across many wikis. It supplies default bag structure, plugin settings, and HTML behavior.

A wiki is the public-facing site. It is addressed by slug and resolves to an effective set of bags and plugins.

Plugins extend the client runtime. The server prepares and serves the plugin assets needed to bootstrap the wiki in the browser.

Users, roles, and sessions determine who can see a wiki, who can edit it, and which bags they can read or write.

## How A Wiki Is Assembled

Each wiki is built from a template plus wiki-specific configuration. Together they determine which bags participate in the wiki, which of those bags are writable, which plugins are loaded, and what HTML shell the client receives.

Writes are routed by title prefix. In practice, the most specific matching writable prefix determines where a title is saved. Readonly bags act as fallback content layers beneath the writable part of the wiki. This gives each wiki a predictable namespace model: a title is written to one resolved writable location and read from the first applicable source in the wiki's effective bag stack.

Deleting follows the same model as writing. A delete applies to the resolved writable location for that title rather than removing the title from every bag that might contain it.

## Runtime Surface

The main runtime entry point is the wiki page itself:

- `GET /wiki/:recipe_slug` returns the HTML bootstrap for the wiki.

The recipe-scoped API provides the supporting runtime data:

- `GET /recipe/:recipe_slug/status` returns the caller's view of the wiki's bag layout and writeability.
- `GET /recipe/:recipe_slug/list.json` lists visible titles together with routing information.
- `GET /recipe/:recipe_slug/store.js` returns the store payload used to bootstrap the client.
- `GET /recipe/:recipe_slug/updates?since=` returns recipe-scoped changes since a known revision.
- `PUT /recipe/:recipe_slug/batch/:op` performs batch list, read, save, and delete operations.

The runtime surface is designed so that list, read, save, delete, updates, and store generation all describe the same wiki view.

## Store And Client Bootstrap

The client is bootstrapped from two pieces: HTML and store data.

The HTML comes either from the default TiddlyWiki shell or from template-defined custom HTML. The store contains the resolved tiddlers for the wiki plus the metadata the client needs to understand the current recipe, bag ownership, host, and revision state.

Depending on server and template configuration, plugin assets and store data may be delivered as external resources or injected into the HTML response. That delivery choice changes how the browser receives the data, but not what wiki content the client sees.

## Administration

The admin surface manages wikis, templates, bags, users, and roles. In this model, a wiki is the editable public resource, a template is the reusable shared definition, and a bag is the underlying storage unit.

Saving a wiki or template changes the configuration that future runtime requests use. Template changes affect every wiki that depends on that template. Bag changes affect where titles are stored and resolved.

Plugin entries are exposed through the admin load path so they can be selected and inspected, but this path does not treat plugins as editable database rows in the same way as wikis, templates, bags, users, and roles.

User administration covers profile-like data and role membership. Password creation, login, reset, and password change belong to the session and password subsystem rather than to admin row saves.

## Permissions

Access is role-based.

Recipe permissions determine whether a wiki is available to a user at all. Bag permissions determine whether the user can read from or write to the bags that make up that wiki. Template permissions govern template management rather than live wiki access.

The runtime presents a wiki as a coherent whole rather than a partially filtered bag set. If a user does not have the required access to the bags that define a wiki, the wiki request is denied. A user can also have access to a wiki while still being unable to modify a specific title if that title resolves to a writable bag they cannot edit.

## Sessions And Identity

Sessions resolve the current user and that user's roles for every request. Those roles are then used consistently across wiki access checks, bag write checks, and admin operations.

The public identifier for a wiki is its slug. Developers working on the runtime surface should treat that slug as the stable address of the wiki.

## Repository Layout

This is a monorepo divided into separate projects. The entry point is in `packages/mws/src/index.ts`. The entry point imports the `server`, `commander`, and `events` projects.

The entire server uses Promises and async functions for pretty much everything. Synchronous file system calls should be avoided as much as possible.

The `events` project is the foundation of MWS. It contains an `EventEmitter` instance that everything else subscribes to.

Events are emitted asyncly. Event listeners are awaited with `Promise.all`, and rejections throw back to the event emit call. This is intentional because it is the heart of the entire server, not just a public event bus, and errors shouldn't be ignored. Errors that come from things like attempting to send SSE events to other clients, however, should not be thrown because they aren't relevent to the source of the event.

There should be no singleton references other than the event emitter and event handlers should be as pure as possible, so that in theory it would be possible to run multiple completely separate MWS servers in the same process.

The `commander` project handles the CLI parsing code. It exports a default function which MWS calls to execute the CLI. Commander emits several events during execution, which MWS hooks into to scaffold the rest of the server.

It also exports the base class for commands to inherit from, and because it instantiates the commands, commands should not specify their own constructor. Additional instance properties may be added to commands in the `cli.execute.before` event.

The `server` project handles all web related stuff, but in an MWS-agnostic way. It only requires the `events` project, so it could be used as the foundation for unrelated webservers. Its internal API is directly inspired by the TiddlyWiki server API, with routing and centralized handling of the request body.

The `mws` project is the application layer of MWS and ties everything else together. It defines all the commands and web server routes and handles the database connection.

## Server Events

These are the hooks that run on startup. The listen command starts the server and returns, finishing the command run.

```
├ cli.register: 0.101ms
├ cli.commander: 0.021ms
├ Command: listen: --------
├ ├ cli.execute.before: --------
├ ├ ├ mws.cache.init.before: 0.012ms
├ ├ ├ mws.cache.init.after: 0.016ms
├ ├ ├ mws.adapter.init.before: 0.013ms
├ ├ ├ mws.adapter.init.after: 0.007ms
├ ├ ├ mws.config.init.before: 0.008ms
├ ├ ├ mws.config.init.after: 0.013ms
├ ├ cli.execute.before: 1.175s
├ ├ listen.router.init: --------
├ ├ ├ mws.router.init: 0.017ms
├ ├ ├ mws.routes.important: 0.004ms
├ ├ ├ mws.routes: 1.054ms
├ ├ ├ mws.routes.fallback: 0.039ms
├ ├ listen.router.init: 111.665ms
├ ├ cli.execute.after: 0.008ms
├ Command: listen: 1.296s
```

## Todo

- server input validation: all the pieces are there, I just need to wire it up.
- make commands easier to extend, probably just by making it easier to specify a list of commands via javascript. 
- clean up my spaghetti code into nice straight rows of pasta.
