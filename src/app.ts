import "reflect-metadata";

import * as config from "config";
import session = require("cookie-session");
import * as express from "express";
import * as highlightjs from "highlight.js";
import { Settings } from "luxon";
import * as marked from "marked";
import { Renderer } from "marked";
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

  const renderer = new Renderer();

  renderer.code = (code, language) => {
    const validLang = !!(language && highlightjs.getLanguage(language));
    const highlighted = validLang
      ? highlightjs.highlight(language, code).value
      : code;
    return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
  };

  marked.setOptions({ renderer });

  useContainer(Container);

  const app = express();

  app.set("trust proxy", 1);

  app.get(
    "/favicon.ico",
    express.static(path.join(__dirname, "..", "static"), {
      maxAge: 24 * 3600 * 1000
    })
  );

  app.engine("mustache", mustacheExpress());
  app.set("view engine", "mustache");
  app.set("views", path.join(__dirname, "..", "views"));

  app.use(
    session({
      name: "lujjjh:session",
      keys: config.get("keys"),
      maxAge: 30 * 24 * 3600 * 1000,
      secure: app.get("env") === "production"
    })
  );

  useExpressServer(app, {
    authorizationChecker(action: Action, rules: string[]) {
      return !!action.request.session.user_id;
    },
    currentUserChecker(action: Action) {
      const { user_id: id } = action.request.session;
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

  server.keepAliveTimeout = 120e3;
}

start();
