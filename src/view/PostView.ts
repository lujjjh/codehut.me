import { Expose } from "class-transformer";
import { DateTime } from "luxon";
import { Post } from "../entity/Post";
import { Cursor } from "../trait/Cursor";

export class PostView {
  public static from(post?: Partial<Post>) {
    if (!post) {
      return undefined;
    }
    return new this(post);
  }

  constructor(private post: Partial<Post>) {}

  @Expose()
  get id() {
    return this.post.id;
  }

  @Expose()
  get title() {
    return this.post.title;
  }

  @Expose()
  get content() {
    return this.post.contentRendered;
  }

  @Expose()
  get rawContent() {
    return this.post.content;
  }

  @Expose()
  get url() {
    const cursor = new Cursor(this.id);
    return "/posts/" + cursor.cursor;
  }

  @Expose()
  get date() {
    return DateTime.fromJSDate(this.post.publishedAt!).toLocaleString(
      DateTime.DATE_SHORT
    );
  }

  @Expose()
  get datetime() {
    return DateTime.fromJSDate(this.post.publishedAt!).toISO();
  }
}
