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

At this commit, the server is running with the new routes, store, and prisma. 

This is a map of the current database layout.

![prisma-editor (1)](https://github.com/user-attachments/assets/607868ac-5f5c-4e83-b1fe-4b1d37fdb3b4)
