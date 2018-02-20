import "reflect-metadata";

import * as config from "config";
import * as Koa from "koa";
import * as session from "koa-session";
import * as views from "koa-views";
import { Action, useContainer, useKoaServer } from "routing-controllers";
import { Container } from "typedi";
import { PostController } from "./controller/PostController";
import { UserController } from "./controller/UserController";
import { VersionController } from "./controller/VersionController";
import { UserService } from "./service/UserService";

useContainer(Container);

const app = new Koa();

app.keys = config.get("keys");

app.use(
  session(
    {
      key: "lujjjh:session",
      maxAge: 30 * 24 * 3600 * 1000
    },
    app
  )
);

app.use(
  views(__dirname + "/view", {
    extension: "mustache",
    map: {
      mustache: "mustache"
    }
  })
);

useKoaServer(app, {
  authorizationChecker(action: Action, rules: string[]) {
    return !!action.context.session.user_id;
  },
  currentUserChecker(action: Action) {
    const { user_id: id } = action.context.session;
    return Container.get(UserService).findUserById(id);
  },
  controllers: [VersionController, UserController, PostController]
});

const port = (process.env.PORT && +process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";
const server = app.listen(port, host, () => {
  const address = server.address();
  process.stdout.write(
    `listening at http://${address.address}:${address.port}\n`
  );
});
