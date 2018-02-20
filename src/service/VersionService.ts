import * as fs from "fs";
import { join } from "path";
import { Service } from "typedi";

const pkg = JSON.parse(
  fs.readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8")
);

@Service()
export class VersionService {
  public getVersion() {
    return String(pkg.version);
  }
}
