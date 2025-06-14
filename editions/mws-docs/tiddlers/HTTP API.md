The MultiWikiServer HTTP API provides management and tiddler endpoints. 

The design goals of the API are:

 - Connect the client and server as transparently as possible. 
 - Be easy to understand and use via JavaScript. 
 - Have strict validation of incoming requests.

## Management

- On the client, most request paths are defined by a single adaptor function which accepts the input for the server and returns a promise which resolves to the server's parsed response.  
- The server may throw a user error (or a string), which is expected to return to the client. It should give them an actionable understanding of what went wrong. 

## Tiddler

The tiddler API was based on [the API of TiddlyWeb](https://tank.peermore.com/tanks/tiddlyweb/HTTP%20API), first developed in 2008 by Chris Dent, but is more oriented around JSON and Typescript. 

The concept of resources is central to the API and in the future it will hopefully be adapted to serve static versions of tiddlers. 