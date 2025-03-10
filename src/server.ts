import "./StateObject"; // <- load this first so it waits for streamer to be defined
import "./streamer";
import "./router";
import "./global";
import * as http2 from 'node:http2';
import * as opaque from "@serenity-kit/opaque";
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { Streamer } from "./streamer";
import { Router } from './router';
import * as sessions from "./sessions";
import { resolve } from "node:path";

export * from "./sessions";

declare module 'node:net' {
  interface Socket {
    /** Not defined on net.Socket instances. 
     * 
     * On tls.Socket instances,  */
    encrypted?: boolean;
  }
}


class ListenerHTTPS {
  server: http2.Http2SecureServer;
  constructor(router: Router, key: Buffer, cert: Buffer) {
    this.server = http2.createSecureServer({ key, cert, allowHTTP1: true, });
    this.server.on("request", (
      req: IncomingMessage | http2.Http2ServerRequest,
      res: ServerResponse | http2.Http2ServerResponse
    ) => {
      const streamer = new Streamer(req, res, router);
      router.handle(streamer).catch(streamer.catcher);
    });
  }

}

class ListenerHTTP {
  server: Server;
  /** Create an http1 server */
  constructor(router: Router) {
    this.server = createServer((req, res) => {
      const streamer = new Streamer(req, res, router);
      router.handle(streamer).catch(streamer.catcher);
    });
  }
}


function listenHandler(server: http2.Http2SecureServer | Server) {
  return () => {
    process.exitCode = 2;

    var addr = server.address();
    var bind = !addr ? "unknown" : typeof addr === 'string' ? 'pipe ' + addr : addr.address + ":" + addr.port;

    console.log('Server listening on ' + bind + ' 🚀');
    process.exitCode = 0;

  }
}

function errorHandler(server: http2.Http2SecureServer | Server, port: any) {
  return (error: NodeJS.ErrnoException) => {
    process.exitCode = 1;

    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = "";

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit();
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit();
        break;
      default:
        throw error;
    }
  }
}

export default async function startServer(config: MWSConfig) {
  // await lazy-loaded or async models
  await opaque.ready;

  const router = await Router.makeRouter(
    config.config,
    config.passwordMasterKey
      ? readFileSync(config.passwordMasterKey, "utf8")
      : opaque.server.createSetup(),
    config.SessionManager,
  ).catch(e => {
    console.log(e.stack);
    throw "Router failed to load";
  });

  const { host, port } = config;

  const { server } = config.https
    ? new ListenerHTTPS(router,
      readFileSync(config.https.key),
      readFileSync(config.https.cert)
    ) : new ListenerHTTP(router);
  server.on('error', errorHandler(server, port));
  server.on('listening', listenHandler(server));
  server.listen(port, host);

}

export interface MWSConfig {
  https?: {
    /** The key file for the HTTPS server */
    key: string
    /** The cert file for the HTTPS server */
    cert: string
  };
  /** The port to listen on */
  port: number
  /** The hostname to listen on */
  host?: string
  /** The key file for the password encryption. If this key changes, passwords will need to be reset. */
  passwordMasterKey?: string
  config: {
    /** Path to the mws datafolder. */
    readonly wikiPath: string
    /** If true, allow users that aren't logged in to read. */
    readonly allowAnonReads?: boolean
    /** If true, allow users that aren't logged in to write. */
    readonly allowAnonWrites?: boolean
    /** If true, recipes will allow access to a user who does not have read access to all its bags. */
    readonly allowUnreadableBags?: boolean
    contentTypeInfo?: any;
  }
  /** 
   * The session manager class registers the login handler routes and sets the auth user 
   */
  SessionManager: typeof sessions.SessionManager;
}
