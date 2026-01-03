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
- possibly make material design 3 ui with web commponents
- make sure the getting started doc is correct
- put site restrictions in a file
- sell people on contributing to the project

## some ideas

- webdav or samba for importing or editing tiddlers
  - multiple folder views (flat, folder, tag)
- active node server for a specific folder (also a massive security bypass)
- instructions for process users on different platforms (e.g. linux permission users)
- Recipe templates, which have a simple list of plugins and readonly bags, and are assigned to the writable bag.


- Let everyone see when someone is editing a tiddler and how long since last keystroke.
- Auth and Admin needs to be fully user aware and swappable for different situations. 
- API endpoints need to be clean and understandable.
- 


## list of current routes

```js
[ 'POST' ] ^\/login\/1$ 
[ 'POST' ] ^\/login\/2$ 
[ 'POST' ] ^\/logout$
[ 'GET', 'HEAD' ] ^\/\$cache\/(?<plugin>._)\/plugin\.js$ 
[ 'POST' ] ^\/admin\/bag_create_or_update$ +0ms
[ 'POST' ] ^\/admin\/bag_delete$ +0ms
[ 'POST' ] ^\/admin\/bag_acl_update$ +0ms
[ 'POST' ] ^\/admin\/recipe_create_or_update$ +1ms
[ 'POST' ] ^\/admin\/recipe_delete$ +0ms
[ 'POST' ] ^\/admin\/recipe_acl_update$ +0ms
[ 'POST' ] ^\/admin\/user_edit_data$ +0ms
[ 'POST' ] ^\/admin\/user_create$ +0ms
[ 'POST' ] ^\/admin\/user_delete$ +0ms
[ 'POST' ] ^\/admin\/user_list$ +0ms
[ 'POST' ] ^\/admin\/user_update$ +0ms
[ 'POST' ] ^\/admin\/user_update_password$ +1ms
[ 'POST' ] ^\/admin\/role_create$ +0ms
[ 'POST' ] ^\/admin\/role_update$ +0ms
[ 'POST' ] ^\/admin\/settings_read$ +0ms
[ 'POST' ] ^\/admin\/settings_update$ +0ms
[] ^(?=\/recipe\/) +0ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/all-bags-state$ +0ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/bags\/(?<bag_name>[^/]+)\/state$ +0ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/status$ +0ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/events$ +0ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/bags$ +0ms
[ 'DELETE' ] ^\/recipe\/(?<recipe_name>[^/]+)\/tiddlers\/(?<title>.+)$ +1ms
[ 'GET', 'HEAD' ] ^\/recipe\/(?<recipe_name>[^/]+)\/tiddlers\/(?<title>.+)$ +0ms
[ 'PUT' ] ^\/recipe\/(?<recipe_name>[^/]+)\/tiddlers\/(?<title>.+)$ +0ms
[ 'PUT' ] ^\/recipe\/(?<recipe_name>[^/]+)\/rpc\/rpcDeleteRecipeTiddlerList$ +0ms
[ 'PUT' ] ^\/recipe\/(?<recipe_name>[^/]+)\/rpc\/rpcLoadRecipeTiddlerList$ +0ms
[ 'PUT' ] ^\/recipe\/(?<recipe_name>[^/]+)\/rpc\/rpcSaveRecipeTiddlerList$ +0ms
[ 'GET', 'HEAD', 'OPTIONS' ] ^\/wiki\/(?<recipe_name>._)$ +0ms
[ 'GET', 'HEAD' ] ^\/user\/status$ +0ms
[ 'POST' ] ^\/admin\/index_json$ +0ms
[ 'GET', 'HEAD' ] ^\/stats\/(?<folder>[^\/]+)\/(?<file>._) +0ms
[ 'GET' ] ^\/._ +1ms
```