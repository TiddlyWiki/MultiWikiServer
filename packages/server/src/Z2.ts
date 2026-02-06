import * as z4 from "zod/v4";
export type FieldTypeGroups = "STRING" | "JSON";

export type _zod = typeof z4;

export interface Z2<T extends FieldTypeGroups> extends _zod { }

export { z4 as zod };

export const Z2: Z2<any> = Object.create(z4);
