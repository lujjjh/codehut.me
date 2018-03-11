import { Expose } from "class-transformer";

export class Cursor {
  public id: number;

  constructor(id?: number) {
    if (id) {
      this.id = +id;
    }
  }

  set cursor(value) {
    const match = /^cursor:(\d+)$/.exec(
      Buffer.from(value, "base64").toString()
    );
    if (!match) {
      return;
    }
    const id = parseInt(match[1], 10);
    if (id !== id) {
      return;
    }
    this.id = id;
  }

  @Expose()
  get cursor() {
    return Buffer.from("cursor:" + this.id).toString("base64");
  }
}
