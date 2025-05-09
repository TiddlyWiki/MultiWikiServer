Installation may fail with errors related to `gyp` or `prebuild`. These errors are caused by missing dependencies or incorrect versions of dependencies.

Note that in most cases, these errors occur because of the use of the npm module [[better-sqlite3|https://www.npmjs.com/package/better-sqlite3]]. This module is mostly written in C, and thus requires compilation for the target platform. MWS supports switchable database engines, and also supports the use of the [[node-sqlite3-wasm|https://www.npmjs.com/package/node-sqlite3-wasm]] module which is written in ~JavaScript and does not require compilation and so may avoid these errors. See [[Database Engines]] for more details of how to switch between engines.

The following steps may help resolve errors involving `gyp` or `prebuild`:

- Ensure that you have the latest version of Node.js installed. You can download the latest version from the [[Node.js website|https://nodejs.org/]].
- Update npm to the latest version by running the following command in your terminal: 
  <<.copy-code-to-clipboard "npm install -g npm@latest">>
- Clear the npm cache by running the following command in your terminal: <<.copy-code-to-clipboard "npm cache clean --force">>
- Delete the `node_modules` folder in your project by running the following command in your terminal: 
  <<.copy-code-to-clipboard "rm -rf node_modules">>
- Reinstall the dependencies by running the following command in your terminal: 
  <<.copy-code-to-clipboard "npm install">>
- If you continue to encounter errors, try running the following command in your terminal: 
  <<.copy-code-to-clipboard "npm rebuild">>
- If you are still experiencing issues, you may need to manually install the `gyp` and `prebuild` dependencies. You can do this by running the following commands in your terminal: 
  <<.copy-code-to-clipboard "npm install -g node-gyp">> 
  <<.copy-code-to-clipboard "npm install -g prebuild">>
- Once you have installed the dependencies, try reinstalling the TiddlyWiki dependencies by running the following command in your terminal: 
  <<.copy-code-to-clipboard "npm install">>
