import { Expose } from "class-transformer";
import { DateTime } from "luxon";
import { Post } from "../service/PostService";

export class PostView {
  constructor(private post: Partial<Post>) {}

  @Expose()
  get id() {
    return this.post.id;
  }

  @Expose()
  get tags() {
    return (this.post.tags || []).slice();
  }

  @Expose()
  get title() {
    return this.post.title;
  }

  @Expose()
  get content() {
    return this.post.content_rendered;
  }

  @Expose()
  get url() {
    return "/posts/" + Buffer.from("cursor:" + this.id).toString("base64");
  }

  @Expose()
  get date() {
    return DateTime.fromJSDate(this.post.published_at!).toLocaleString(
      DateTime.DATE_FULL
    );
  }

  @Expose()
  get datetime() {
    return DateTime.fromJSDate(this.post.published_at!).toISO();
  }
}
