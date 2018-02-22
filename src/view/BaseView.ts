import * as config from "config";
import * as fs from "fs";
import * as path from "path";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf-8")
);
const version = String(pkg.version);
const hash = Buffer.from(version).toString("base64");

export class BaseView {
  public static from(args) {
    return new this(args);
  }

  protected constructor(args?) {
    if (typeof args === "object") {
      Object.assign(this, args);
    }
  }

  public asset() {
    return (text, render) => {
      return "/static/" + text.replace(/\.[^\.]+$/, `.${hash}$&`);
    };
  }

  get ga() {
    return config.has("ga") ? config.get("ga") : undefined;
  }
}
