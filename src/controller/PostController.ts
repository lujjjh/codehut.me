import { Response } from "express";
import {
  Authorized,
  Controller,
  Get,
  HttpError,
  NotFoundError,
  OnUndefined,
  Param,
  Post,
  QueryParam,
  Render,
  Res
} from "routing-controllers";
import { Inject } from "typedi";
import { PostNotFoundError } from "../error/PostNotFoundError";
import { PostService } from "../service/PostService";

@Controller()
export class PostController {
  @Inject() private postService: PostService;

  @Get("/")
  @Render("posts")
  public async listPosts(
    @QueryParam("page") page: number,
    @Res() res: Response
  ) {
    if (!page || page !== page) {
      page = 1;
    } else if (page === 1) {
      res.redirect("/");
      return res;
    }
    const offset = 5 * (page - 1);
    const [posts, count] = await Promise.all([
      this.postService.findAll({ limit: 5, offset }),
      this.postService.countAll()
    ]);
    const postsWithURL = posts.map(post => ({
      ...post,
      url: "/posts/" + Buffer.from("cursor:" + post.id).toString("base64")
    }));
    return { total_count: count, posts: postsWithURL };
  }

  @Get("/posts/:cursor")
  @Render("post")
  @OnUndefined(PostNotFoundError)
  public find(@Param("cursor") cursor: string) {
    const cursorId = Buffer.from(cursor, "base64").toString("utf-8");
    const match = /^cursor:(\d+)$/.exec(cursorId);
    if (!match) {
      return undefined;
    }
    const id = parseInt(match[1], 10);
    if (id !== id) {
      return undefined;
    }
    return this.postService.find(id);
  }

  @Post("/")
  @Authorized()
  public create() {
    throw new HttpError(501, "Not implemented.");
  }
}
