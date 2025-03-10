import startServer, { SessionManager } from "./src/server.ts";

startServer({
  https: {
    key: "./localhost.key",
    cert: "./localhost.crt",
  },
  // passwordMaster: false,
  port: 5000,
  host: "::",
  config: {
    wikiPath: "./editions/mws",
    allowAnonReads: false,
    allowAnonWrites: false,
    allowUnreadableBags: false,
  },
  SessionManager,
});
