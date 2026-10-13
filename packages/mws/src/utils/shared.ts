export class IdString extends String {
  static cast(val: IdString): string { return val.toString(); }
  static prefix = "IdString____";
  name = "IdString" as const;
  constructor(value: string) { super(value); }
  toJSON() { return IdString.prefix + this.valueOf(); }
}
