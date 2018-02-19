import { JsonController, Get, CurrentUser, Ctx, Session, OnUndefined, UnauthorizedError } from 'routing-controllers'
import { Inject } from 'typedi'
import { Context } from 'koa'
import { UserService } from '../service/UserService'

@JsonController()
export class UserController {
  @Inject()
  private userService: UserService

  @Get('/user')
  getUser (@CurrentUser({ required: true }) user) {
    return user
  }

  @Get('/auth')
  auth (@Ctx() ctx: Context) {
    ctx.redirect(this.userService.getUri())
    return 'Redirecting to GitHub...'
  }

  @Get('/auth/callback')
  @OnUndefined(UnauthorizedError)
  async login (@Ctx() ctx: Context, @Session() session) {
    const user = await this.userService.findUserByUri(ctx.originalUrl)
    if (user) {
      session.user = user
      ctx.redirect('/')
    }
    return user
  }
}
