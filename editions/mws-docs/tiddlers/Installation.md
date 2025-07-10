These instructions require minimal knowledge of the terminal and require NodeJS to be installed.

- Open a terminal window and set the current directory to the folder you want to create the project folder in. 
- The init command creates the project folder and installs the required dependencies and config files. You can change the name to whatever you like. <<.copy-code-to-clipboard """npm init @tiddlywiki/mws@latest "new_folder_name" """>>
- Set the current directory to the project folder that was just created: <<.copy-code-to-clipboard """cd "new_folder_name" """>>
- Initialize the database <<.copy-code-to-clipboard "npx mws init-store">>
- Start MWS: <<.copy-code-to-clipboard "npx mws init-store">>
- Visit http://localhost:8080 in a browser on the same computer. 
- When you have finished using MWS, stop the server with <kbd>ctrl-C</kbd>

See [[Troubleshooting]] if you encounter any errors.

### Updating MWS

To update your copy of MWS in the future with newer changes will require re-downloading the code, taking care not to lose any changes you might have made.

- Make a backup: Copy or zip your project folder to a safe backup folder.  <<.copy-code-to-clipboard """tar -cf archive.tar "new_folder_name" """>>
- Get the latest version. Notice that the second word is `install` instead of `init`. This pulls the latest version from NPM and installs it. <<.copy-code-to-clipboard "npm install @tiddlywiki/mws@latest --save-exact">>
- Run MWS. On startup, MWS checks the database schema and updates it automatically if there are changes. Normally this works just fine, but it can fail, which is why it's important to save a backup first. 

### Git repo

It is recommended to save a history of your project configuration using git, 

- On Windows you can use [[GitHub Desktop|https://github.com/apps/desktop]]. 
- On Linux, git is usually preinstalled or available via the default package manager for your distro. 

