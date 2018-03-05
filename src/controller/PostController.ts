import {
  Authorized,
  Controller,
  Get,
  HttpError,
  OnUndefined,
  Param,
  Post,
  QueryParam,
  Render
} from "routing-controllers";
import { Inject } from "typedi";
import { PostNotFoundError } from "../error/PostNotFoundError";
import { PostService } from "../service/PostService";
import { BaseView } from "../view/BaseView";
import { PostView } from "../view/PostView";

const POSTS_PER_PAGE = 10;

@Controller()
export class PostController {
  @Inject() private postService: PostService;

  @Get("/")
  @Render("posts")
  public async listPosts(@QueryParam("page") page: number) {
    if (!page || page !== page) {
      page = 1;
    }
    const offset = POSTS_PER_PAGE * (page - 1);
    const [posts, count] = await Promise.all([
      this.postService.findAll({ limit: POSTS_PER_PAGE, offset }),
      this.postService.countAll()
    ]);
    const postViews = posts.map(PostView.from.bind(PostView));
    const prev =
      page === 2
        ? { url: "/" }
        : page > 1 ? { url: `/?page=${page - 1}` } : null;
    const next =
      offset + posts.length < count ? { url: `/?page=${page + 1}` } : null;
    return BaseView.from({ prev, next, posts: postViews });
  }

  @Get("/posts/:cursor")
  @Render("post")
  @OnUndefined(PostNotFoundError)
  public async find(@Param("cursor") cursor: string) {
    const cursorId = Buffer.from(cursor, "base64").toString("utf-8");
    const match = /^cursor:(\d+)$/.exec(cursorId);
    if (!match) {
      return undefined;
    }
    const id = parseInt(match[1], 10);
    if (id !== id) {
      return undefined;
    }
    const post = await this.postService.find(id);
    if (!post) {
      return undefined;
    }
    return PostView.from(post) as PostView;
  }

  @Post("/")
  @Authorized()
  public create() {
    throw new HttpError(501, "Not implemented.");
  }
}
