import * as fs from "fs";
import * as path from "path";
import { Service } from "typedi";
import { promisify } from "util";

const STATIC_ROOT = path.resolve(__dirname, "..", "..", "static");

const readFile = promisify(fs.readFile);

@Service()
export class StaticService {
  public async get(relativePath: string) {
    const [, hash] = /\.([^.]+)\.[^.]+$/.exec(relativePath) || [, ""];
    if (!hash) {
      return undefined;
    }
    relativePath = relativePath.replace(/\.[^.]+(\.[^.]+)$/, "$1");
    const filepath = path.resolve(STATIC_ROOT, relativePath);
    if (!this.pathInStaticRoot(filepath)) {
      return undefined;
    }
    try {
      return await readFile(filepath, "utf-8");
    } catch (error) {
      if (error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  private pathInStaticRoot(filepath) {
    filepath = path.normalize(filepath);
    return filepath.indexOf(STATIC_ROOT + path.sep) === 0;
  }
}
