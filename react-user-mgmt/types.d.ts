

import * as server from "../src/routes/api/api";


declare global {
  declare module "*.css";
  type ServerMap = server.ServerMap;
  type ServerMapKeys = server.ServerMapKeys;
  type ServerMapRequest = server.ServerMapRequest;
  type ServerMapResponse = server.ServerMapResponse;
}