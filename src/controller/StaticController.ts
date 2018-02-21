import { Request, Response } from "express";
import * as mime from "mime-types";
import { Controller, Get, Header, Req, Res } from "routing-controllers";
import { Inject } from "typedi";
import { StaticService } from "../service/StaticService";

@Controller()
export class StaticController {
  @Inject() private staticService: StaticService;

  @Get(/^\/static\//)
  @Header("cache-control", "max-age=31536000")
  public get(@Req() req: Request, @Res() res: Response) {
    const filename = decodeURI(req.path.replace(/^\/static\//, ""));
    const contentType = mime.contentType(filename);
    if (contentType) {
      res.contentType(contentType);
    }
    return this.staticService.get(filename);
  }
}
