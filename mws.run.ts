import startServer from "./src/server.ts";

startServer({
  https: {
    key: "./localhost.key",
    cert: "./localhost.crt",
  },
  passwordMasterKey: "./localpass.key",
  port: 5000,
  host: "::",
  config: {
    wikiPath: "./editions/mws",
    allowAnonReads: false,
    allowAnonWrites: false,
    allowUnreadableBags: false,
  },
});
