Internal notes by core developers

## Prisma

- Migration path might be only for development
- Add other database types

## Web 

- Referer enforcement (wiki UI cannot access admin api)
- All the headers 
- CORS

## CLI

- Save and load archive (for backup purposes)
- Export recipe or bag to wiki folder (file system sync adapter).
- Import wiki folder to recipe or bag (tw boot node).
- Support includeWikis
- Automated export.

## Admin

- Some kind of URL mapping menu
- Forbidden characters in recipe and bag names
- All the settings
- 

## Wiki

- Storing large binary tiddlers on the file system
- Guest access to wiki
- Very tempted to remove READ privilege and just allow everyone to read because of the imsurmountable security issues that come with it otherwise.
- When you visit a page, you visit with page permissions only, and the page has to ask permission before it can read or write to any other wiki or bag you have access to. It would be like a GitHub app requesting permission to access one of your repos on Github. This can be enforced with the referer header. API keys could also be used for similar restricted access. 

## other

- Not planed, but https://crates.io/crates/indradb

## planning for a publicized release (sometime in september)

- make a note about wikis not being able to talk to each other
- verify all of the authentication and security
- make sure the getting started doc is correct
- put site restrictions in a file
- sell people on contributing to the project

## some ideas

- webdav or samba for importing or editing tiddlers
  - multiple folder views (flat, folder, tag)
- active node server for a specific folder (also a massive security bypass)
- instructions for process users on different platforms (e.g. linux permission users)


