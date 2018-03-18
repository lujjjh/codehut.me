import "reflect-metadata";

import * as bodyParser from "body-parser";
import * as config from "config";
import session = require("cookie-session");
import * as express from "express";
import * as fs from "fs";
import { Settings } from "luxon";
import * as mustacheExpress from "mustache-express";
import * as path from "path";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { Container } from "typedi";
import "./database";
import { UserService } from "./service/UserService";

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8")
);
const version = String(pkg.version);
const hash = Buffer.from(version).toString("base64");

Settings.defaultLocale = "zh";

useContainer(Container);

const app = express();

app.set("trust proxy", 1);

app.get(
  "/favicon.ico",
  express.static(path.join(__dirname, "..", "static"), {
    maxAge: 24 * 3600 * 1000
  })
);

const mustache = mustacheExpress();
if (process.env.NODE_ENV !== "production") {
  delete mustache.cache;
}
app.engine("mustache", mustache);
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "..", "views"));

app.set("asset", () => (text, render) => {
  return "/static/" + text.replace(/\.[^\.]+$/, `.${hash}$&`);
});
app.set("ga", () => (config.has("ga") ? config.get("ga") : undefined));

app.use(
  session({
    name: "lujjjh:session",
    keys: config.get("keys"),
    maxAge: 30 * 24 * 3600 * 1000,
    secure: app.get("env") === "production"
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

useExpressServer(app, {
  authorizationChecker(action: Action, rules: string[]) {
    return !!action.request.session.user_id;
  },
  currentUserChecker(action: Action) {
    const { user_id: id } = action.request.session;
    return Container.get(UserService).findById(id);
  },
  controllers: [
    path.join(__dirname, "controller", "*.js"),
    path.join(__dirname, "controller", "*.ts")
  ]
});

const port = (process.env.PORT && +process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";
const server = app.listen(port, host, () => {
  const address = server.address();
  process.stdout.write(
    `listening at http://${address.address}:${address.port}\n`
  );
});

server.keepAliveTimeout = 120e3;
