import {
  Authorized,
  BodyParam,
  Controller,
  Get,
  HeaderParam,
  OnUndefined,
  Params,
  Post,
  QueryParam,
  Redirect,
  Render
} from "routing-controllers";
import { Inject } from "typedi";
import { PostNotFoundError } from "../error/PostNotFoundError";
import { PostService } from "../service/PostService";
import { Cursor } from "../trait/Cursor";
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
    const postViews = posts.map(post => new PostView(post));
    const prev =
      page === 2
        ? { url: "/" }
        : page > 1 ? { url: `/?page=${page - 1}` } : null;
    const next =
      offset + posts.length < count ? { url: `/?page=${page + 1}` } : null;
    return { prev, next, posts: postViews };
  }

  @Get("/posts/:cursor")
  @Render("post")
  @OnUndefined(PostNotFoundError)
  public async find(
    @Params() cursor: Cursor,
    @HeaderParam("User-Agent") ua: string
  ) {
    const post = await this.postService.find(cursor.id);
    if (!post) {
      return undefined;
    }
    if (/bot|googlebot|crawler|spider|robot|crawling/i.test(ua)) {
      post.contentRendered = this.stripHanzi(post.contentRendered);
    }
    return new PostView(post);
  }

  @Get("/create")
  @Authorized()
  @Render("edit")
  public create() {
    return PostView.from({ publishedAt: new Date() });
  }

  @Post("/create")
  @Authorized()
  @Redirect("/posts/:cursor/edit")
  public async createAction(
    @BodyParam("title") title: string,
    @BodyParam("published_at") publishedAt: Date,
    @BodyParam("content") content: string
  ) {
    const post = await this.postService.save({
      title,
      publishedAt,
      content,
      contentRendered: ""
    });
    return { cursor: new Cursor(post.id).cursor };
  }

  @Get("/posts/:cursor/edit")
  @Authorized()
  @Render("edit")
  @OnUndefined(PostNotFoundError)
  public async edit(@Params() cursor: Cursor) {
    return PostView.from(await this.postService.find(cursor.id));
  }

  @Post("/posts/:cursor/edit")
  @Authorized()
  @Render("edit")
  @OnUndefined(PostNotFoundError)
  public async editAction(
    @Params() cursor: Cursor,
    @BodyParam("title") title: string,
    @BodyParam("published_at") publishedAt: Date,
    @BodyParam("content") content: string
  ) {
    return PostView.from(
      await this.postService.save({
        id: cursor.id,
        title,
        publishedAt,
        content,
        contentRendered: ""
      })
    );
  }

  private stripHanzi(content: string) {
    while (/<(h-[^>\s]+)[^>]*>([\s\S]*?)<\/\1>/.test(content)) {
      content = content.replace(/<(h-[^>\s]+)[^>]*>([\s\S]*?)<\/\1>/g, "$2");
    }
    return content;
  }
}
