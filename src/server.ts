import "./StateObject"; // <- load this first so it waits for streamer to be defined
import "./streamer";
import "./router";
import "./global"; 
import * as http2 from 'node:http2';
import * as opaque from "@serenity-kit/opaque";
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { Streamer } from "./streamer";
import { Router } from './router';


interface ListenerOptions {
  key?: Buffer
  cert?: Buffer
  port: number
  hostname?: string
}

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

async function setupServers(useHTTPS: boolean, port: number) {
  // await lazy-loaded or async models
  await opaque.ready;

  const router = await Router.makeRouter("./editions/mws").catch(e => {
    console.log(e.stack);
    throw "Router failed to load";
  });

  const { server } = useHTTPS
    ? new ListenerHTTPS(router,
      readFileSync("./localhost.key"),
      readFileSync("./localhost.crt")
    ) : new ListenerHTTP(router);
  server.on('error', errorHandler(server, port));
  server.on('listening', listenHandler(server));
  server.listen(port, "::");
}

setupServers(true, 5000);