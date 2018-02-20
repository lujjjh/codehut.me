import 'reflect-metadata'

import * as Koa from 'koa'
import * as session from 'koa-session'
import { useContainer, Action, useKoaServer } from 'routing-controllers'
import { Container } from 'typedi'
import { VersionController } from './controller/VersionController'
import { PostController } from './controller/PostController'
import * as config from 'config'
import { UserController } from './controller/UserController'
import { UserService } from './service/UserService'

useContainer(Container)

const app = new Koa()

app.keys = config.get('keys')

app.use(session({
  key: 'lujjjh:session',
  maxAge: 30 * 24 * 3600 * 1000
}, app))

useKoaServer(app, {
  authorizationChecker (action: Action, rules: string[]) {
    return !!action.context.session.user_id
  },
  currentUserChecker (action: Action) {
    const { user_id: id } = action.context.session
    return Container.get(UserService).findUserById(id)
  },
  controllers: [
    VersionController,
    UserController,
    PostController
  ]
})

const port = process.env.PORT && +process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'
const server = app.listen(port, host, () => {
  const { address, port } = server.address()
  console.log(`listening at http://${address}:${port}`)
})
