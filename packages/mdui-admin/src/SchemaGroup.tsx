export class SchemaGroup {
  protected assignNames() {
    Object.keys(this).forEach(key => {
      if (this[key] instanceof SchemaField) {
        this[key].name = key;
      }
    });
  }
}
export class SchemaField {
  static order = 1;

  name: string;
  type: "text" | "number";
  order: number;

  constructor(public options: { label: string; }) {
    this.order = SchemaField.order++;
  }
}
export class SchemaText extends SchemaField {
  type: "text" = "text";
}
export class SchemaNumber extends SchemaField {
  type: "number" = "number";
}

export function getFields(schema: SchemaGroup) {
  return Object.values(schema)
    .filter(e => e instanceof SchemaField)
    .sort((a, b) => a.order - b.order);
}
