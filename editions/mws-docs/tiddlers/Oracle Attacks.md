Oracles are clues that give information about a response without revealing the actual response.

Obviously none of this matters if your data isn't encrypted with HTTPS, since it's all open for everyone to read. But if it's encrypted, there are still ways of determining content. 

## Compression Oracles

A compression oracle is when an attack takes advantage of the deduplication that compression attempts to do by somehow managing to get their own plaintext inserted into the compression stream and then checking whether the compressed output increases in size or not. If it doesn't, then obviously that particularly plaintext was already in the response for that request. 

## Length Oracle

A similar attack involves inspecting the request length to determine whether a request returned any results. This is especially true of search features. A very big response implies returned results and a very tiny response implies no results. But there are also other ways to use the length which can come down to determining the exact number of bytes returned. 

### Mitigations for normal oracles

The attacks are usually done based on the timing of the response, so even if the response itself is opaque, the timing can usually still be inferred. 

- Disable compression (ultimate mitigation but there are better solutions)
- Disable third-party cookies (SameSite=strict) so cookies are only sent for requests that originate from a loaded webpage. However, this prevents the cookie from being sent to the initial page load. 
- We could set two cookies and only enable compression if the cookie with SameSite=strict is present. Any code which can make a SameSite=strict request is normally considered privelaged code anyway, so we have bigger problems if an attacker can do that. 

## MWS-specific oracles

A cross-bag compression oracle would allow an attacker with write access in one bag to infer the contents of a different bag in the recipe which they do not have access to by somehow attacking someone who does have access to that recipe and watching how the browser compresses various things. Without directly reading the bag's contents, they can write to the bag they have access to and watch the responses being sent to the other user to infer the contents of the recipe overall. 

If batching is enabled, and if updates have side effects which trigger a save which is then loaded by other browsers, and if the attacker manages to add a second save with the correct timing to load in the same batch as the update of the side effect, an oracle attack can occur.

## MWS mitigations

- The simplest mitigation is to never compress the contents of two bags together. 
