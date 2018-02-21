import "reflect-metadata";

import * as config from "config";
import * as express from "express";
import * as session from "express-session";
import { Settings } from "luxon";
import * as mustacheExpress from "mustache-express";
import * as path from "path";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { Container } from "typedi";
import { PostController } from "./controller/PostController";
import { StaticController } from "./controller/StaticController";
import { UserController } from "./controller/UserController";
import { han } from "./han";
import { UserService } from "./service/UserService";

async function start() {
  await han.ready();

  Settings.defaultLocale = "zh";

  useContainer(Container);

  const app = express();

  app.set("trust proxy", 1);

  app.engine("mustache", mustacheExpress());
  app.set("view engine", "mustache");
  app.set("views", path.join(__dirname, "..", "views"));

  app.use(
    session({
      secret: config.get("secret"),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 3600 * 1000,
        secure: app.get("env") === "production"
      }
    })
  );

  useExpressServer(app, {
    authorizationChecker(action: Action, rules: string[]) {
      return !!action.context.session.user_id;
    },
    currentUserChecker(action: Action) {
      const { user_id: id } = action.context.session;
      return Container.get(UserService).findUserById(id);
    },
    classTransformer: false,
    controllers: [StaticController, UserController, PostController]
  });

  const port = (process.env.PORT && +process.env.PORT) || 3000;
  const host = process.env.HOST || "127.0.0.1";
  const server = app.listen(port, host, () => {
    const address = server.address();
    process.stdout.write(
      `listening at http://${address.address}:${address.port}\n`
    );
  });
}

start();
