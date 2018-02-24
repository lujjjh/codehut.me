import { DateTime } from "luxon";
import memorize from "memorize-decorator";
import { Post } from "../service/PostService";
import { BaseView } from "./BaseView";

export class PostView extends BaseView {
  private constructor(private post: Partial<Post>) {
    super();
  }

  get id() {
    return this.post.id;
  }

  get tags() {
    return (this.post.tags || []).slice();
  }

  get title() {
    return this.post.title;
  }

  get content() {
    return this.post.content_rendered;
  }

  @memorize()
  get url() {
    return "/posts/" + Buffer.from("cursor:" + this.id).toString("base64");
  }

  @memorize()
  get date() {
    return DateTime.fromJSDate(this.post.published_at!).toLocaleString(
      DateTime.DATE_FULL
    );
  }

  @memorize()
  get datetime() {
    return DateTime.fromJSDate(this.post.published_at!).toISO();
  }
}
