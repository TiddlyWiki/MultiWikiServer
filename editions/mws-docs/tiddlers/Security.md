## Use Cases

The primary use cases for MWS are 

- Internal corporate information tools
- Public TiddlyWiki hosting
- Classroom scenarios
- Unrestricted trusted collaboration

## Still in Development

While these are the goals of MWS, it is still in early development, so none of these security restraints have actually been put in place yet. This is a work in progress, and the direction we're headed. 

## [[Data Exfiltration]]

Allow me to introduce you to Alice and Bob. They are users on an MWS site. Alice likes to make cookies, and wants to keep the cookie recipe a secret, so she creates a new bag which she only gives herself access to and then creates a wiki which writes to that bag. 

Bob knows this, so he creates his own bag and wiki. He puts some interesting curiosities in it, like a JavaScript timer in the upper right corner of the wiki page that goes ding when the time is up. He shows Alice the cool timer he made. Alice loves it and she adds Bob's bag as a read-only bag in her wiki. 

What she doesn't realize is that by adding his bag to her wiki, Bob can add code to the timer start button that sends her special cookie recipe to a server he controls. 

''So don't add untrusted bags from other users as a read-only bag in your important wikis.''

## [[Deny Cross-Page Scripting Attacks]]

Users can write JavaScript in one wiki that waits for an admin to come along and load the page and then uses the admin's session to access the `/admin` endpoints to give themself access to some other recipe the attacker wants access to. The easiest solution requires HTTPS.

## Protection strategies

### `Referer` header

- Same origin requests can set the Referer header, making it useless for our purposes. 

### `Content-Security-Policy` header

- Able to block the page from making network requests, putting it in mostly read-only mode. This doesn't stop JavaScript from setting `location.href` nor prevent the user from clicking on `a href` links. This is more of a quick and dirty read-only, since it prevents ALL requests, including requests that might not actually change anything on the server. 

### Cookies

Cookies are sent based on the path of the individual request, not the path of the requesting page. Cookie path params are useless for segregating pages. 

### `Sec-Fetch-*` headers (this requires HTTPS)

The `Sec-Fetch-Dest` header tells the server what the browser intends to do with the request. `Sec-Fetch-Mode` tells it what type of request this is. The server generates a signed token and only returns it in the HTML of document navigate requests. If JavaScript tries to retrieve the HTML using `fetch`, the server refuses to send the token, or refuses the request entirely.

### Other headers that tighten up security on the pages

- `Cross-Origin-Opener-Policy: noopener-allow-popups`
  - This is required to prevent pages from using `window.open` to trigger a document navigate request while retaining access to it. 
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `Cache-Control: private, no-store`
  - Prevents certain kinds of caching attacks between fetch and document.


