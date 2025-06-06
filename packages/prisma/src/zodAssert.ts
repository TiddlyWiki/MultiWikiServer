
import { Prisma } from "@prisma/client";
import { zod } from "@tiddlywiki/server";


type _zod = typeof zod;

type ExtraFieldType = "string" | "number" | "parse-number" | "boolean" | "parse-boolean";
type FieldTypeGroups = "STRING" | "JSON";
type FieldTypeStringSelector<T extends FieldTypeGroups> = T extends "STRING" ? "string" : "string";
type FieldTypeNumberSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-number" : "number";
type FieldTypeBooleanSelector<T extends FieldTypeGroups> = T extends "STRING" ? "parse-boolean" : "boolean";

declare module "@tiddlywiki/server" {

  interface Z2<T extends FieldTypeGroups> extends _zod {
    /** 
     * Tags the resulting value as being from the specified table field.
     * 
     * The third argument is a string literal that specifies the field type based on the selected field.
     * 
     * "string" and "parse-number" 
     * - will use decodeURIComponent on the value. 
     * - Require a string length at least one
     * 
     * You can use .optional(), .nullable(), .nulish() after this to make the field optional.
     */
    prismaField<Table extends Prisma.ModelName, Field extends keyof PrismaPayloadScalars<Table>>(
      table: Table, field: Field,
      fieldtype:
        string extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeStringSelector<T> :
        number extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeNumberSelector<T> :
        boolean extends (PrismaPayloadScalars<Table>[Field]) ? FieldTypeBooleanSelector<T> :
        never,
      nullable?: null extends PrismaPayloadScalars<Table>[Field] ? true : false
    ): zod.ZodEffects<any, PrismaField<Table, Field>, PrismaPayloadScalars<Table>[Field]>;


  }
}



export function prismaField(table: any, field: any, fieldtype: ExtraFieldType, nullable?: boolean): any {
  const z = zod;
  const check = (() => {
    switch (fieldtype) {
      case "string":
        return z.string()
          .refine(x => x.length, { message: "String must have length" });
      case "parse-number":
        return z.string().min(1)
          .pipe(z.bigint({ coerce: true }))
          .pipe(z.number({ coerce: true }).finite())
          .refine(x => !isNaN(x), { message: "Invalid number" });
      case "parse-boolean":
        return z.enum(["true", "false", "null"]).transform(x => x === "null" ? null : x === "true");
      case "boolean":
        return z.boolean();
      case "number":
        return z.number().finite().int();
      default:
        throw new Error("Invalid field type");
    }
  })();
  return nullable ? check.nullable() : check;

}

