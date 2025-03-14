# MultiWikiServer

MultiWikiServer for TiddlyWiki. 

### How to run

- Clone the repo
- `npm install`
- `npm start`

The server runs on port 5000, wildcard host. The entry point is at the end of `src/server.ts`.

## The current project

At the moment, we're in the process of converting the code in the TiddlyWiki5:multi-wiki-support branch. It's close to complete. 

- Converting to TypeScript
- Converting to Prisma
- Converting to async concurrency.
- Bug fixes and deduplication.

The `react-user-mgmt` folder is getting all the UI code for now so we can work on the server API. It's possible that we could add a view engine back in later, but it's more likely we'll move it all to a TiddlyWiki based client at some point. 


### Status Update

#### The Admin UI

I work with React in most of my projects so it's something I'm familiar with and can easily keep in sync with the server as I make changes. The MUI component library abstracts away the details of HTML and CSS making it easy to declaritively make UI changes. There is a form library which makes simple forms quite intuitive. The data goes between server and client using standardized POST requests and TypeScript interfaces to keep everything typed correctly. The server uses zod to validate incoming data and the routing system is flexible and hopefully intuitive.

I don't have the ACL management page implemented yet.

#### The wiki API

The wiki routes follow a similar pattern, but the existing tiddlyweb API is still being used for now. Zod is used to validate all the path and query parameters. POST bodies can be parsed from multiple different formats. 

The tiddler store functions which handle a lot of the heavy lifting have been rewritten to use Prisma. I don't really understand what exactly those functions are all trying to do yet, but I tried to preserve the existing behavior, such as deleting and creating tiddlers so there's a new tiddler_id. The attachment functions have also been preserved, even though I don't entirely understand them yet either. 

#### What's next

What's next is probably going to be several different attempts at improving or replacing the current syncer setup. The tiddler store in the browser is actually part of a synchronous rendering engine. The async components which keep that store updated with outside changes could be completely replaced. All that's required is that a consistent view of the store is available at any given moment for the rendering engine (the widget tree) to use. 
