import * as config from "config";
import { join } from "path";
import { Container } from "typedi";
import { createConnection, useContainer } from "typeorm";

useContainer(Container);

createConnection({
  type: "mysql",
  host: config.get("database.host"),
  port: config.get("database.port"),
  database: config.get("database.database"),
  username: config.get("database.user"),
  password: config.get("database.password"),
  entities: [
    join(__dirname, "entity", "*.js"),
    join(__dirname, "entity", "*.ts")
  ]
});
