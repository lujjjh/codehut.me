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
  Render
} from "routing-controllers";
import { Inject } from "typedi";
import { Cache } from "../cache/Cache";
import { PostNotFoundError } from "../error/PostNotFoundError";
import { PostService } from "../service/PostService";

@Controller("/posts")
export class PostController {
  @Inject() private postService: PostService;

  @Get("/")
  @Cache({ ttl: 60 })
  @Render("posts")
  public async listPosts(
    @QueryParam("limit") limit: number,
    @QueryParam("offset") offset: number
  ) {
    const [posts, count] = await Promise.all([
      this.postService.findAll({ limit, offset }),
      this.postService.countAll()
    ]);
    return { total_count: count, posts };
  }

  @Get("/:id")
  @Cache({ ttl: 10 })
  @OnUndefined(PostNotFoundError)
  public find(@Param("id") id: number) {
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
