import * as config from "config";
import * as mysql from "promise-mysql";
import { Service } from "typedi";

@Service()
export class Database {
  public client: mysql.Pool;

  constructor() {
    this.client = mysql.createPool(config.get("database"));
  }
}
