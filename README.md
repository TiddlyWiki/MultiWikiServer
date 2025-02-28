# MultiWikiServer

MultiWikiServer for TiddlyWiki. 

At the moment, we're in the process of converting the code in the TiddlyWiki5:multi-wiki-support branch

- Converting to TypeScript
- Converting to Prisma
- Converting to async concurrency.
- Bug fixes and deduplication.

### How to run

- Clone the repo
- `npm install`
- `npm start`

The server runs on port 5000, wildcard host. The entry point is at the end of `src/server.ts`.

I'm working on transferring all the user management stuff into a react app for the time being. The main reason for this is the amount of view engine stuff that's mixed in on the server-side, which makes it much harder to architect the core API. 

I work with React in most of my projects so it's also something I'm familiar with and can easily keep in sync with the server as I make changes.

### Server route handlers

The routes serve dual purpose. 

- For endpoints which represent a page url, they fallback to the dev server. 
- Otherwise they serve as a REST API for the client. 

We are working on consolidating the REST api into a consistent form. The react-user-mgmt project is replacing the server-side view engine for now. 

We are working on moving as much as possible into the client, especially validation and rendering, unless it is required by the server for security or consistency. 

We need to find the best way to implement client-side rendering logic in TiddlyWiki similar to how the React app works now. It's actually quite simple:
- Replacing the root render tiddler with a custom tiddler that changes based on `location.pathname`. 
- Loading the variables required by each render tiddler from the server via a Javascript tiddler.
- Capturing form submissions and handing them off to a Javascript tiddler.

### This is a map of the current database layout.

![prisma-editor (3)](https://github.com/user-attachments/assets/295e243a-a1f4-4e2a-8ed8-7b05110703b2)

