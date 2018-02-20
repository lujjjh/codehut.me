import { Context } from "koa";
import {
  Ctx,
  CurrentUser,
  Get,
  JsonController,
  OnUndefined,
  Session,
  UnauthorizedError
} from "routing-controllers";
import { Inject } from "typedi";
import { UserService } from "../service/UserService";

@JsonController()
export class UserController {
  @Inject() private userService: UserService;

  @Get("/user")
  public getUser(
    @CurrentUser({ required: true })
    user
  ) {
    return user;
  }

  @Get("/auth")
  public auth(@Ctx() ctx: Context) {
    ctx.redirect(this.userService.getUri());
    return "Redirecting to GitHub...";
  }

  @Get("/auth/callback")
  @OnUndefined(UnauthorizedError)
  public async login(@Ctx() ctx: Context, @Session() session) {
    const user = await this.userService.findUserByUri(ctx.originalUrl);
    if (user) {
      session.user_id = user.id;
      ctx.redirect("/");
    }
    return "";
  }
}
