import { Request, Response } from "express";
import {
  CurrentUser,
  Get,
  JsonController,
  OnUndefined,
  Req,
  Res,
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
  public auth(@Res() res: Response) {
    res.redirect(this.userService.getUri());
    return res;
  }

  @Get("/auth/callback")
  @OnUndefined(UnauthorizedError)
  public async login(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session
  ) {
    const user = await this.userService.findUserByUri(req.originalUrl);
    if (!user) {
      return undefined;
    }
    session.user_id = user.id;
    res.redirect("/");
    return res;
  }
}
