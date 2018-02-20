import { DateTime } from "luxon";
import * as marked from "marked";
import memorize from "memorize-decorator";
import { han } from "../han";
import { Post } from "../service/PostService";

export class PostView {
  public static from(post: Partial<Post>) {
    return new this(post);
  }

  private constructor(private post: Partial<Post>) {}

  get id() {
    return this.post.id;
  }

  get tags() {
    return (this.post.tags || []).slice();
  }

  get title() {
    return this.post.title;
  }

  @memorize()
  get content() {
    return han.render(marked(this.post.content));
  }

  @memorize()
  get url() {
    return "/posts/" + Buffer.from("cursor:" + this.id).toString("base64");
  }

  @memorize()
  get date() {
    return DateTime.fromJSDate(this.post.published_at!)
      .setLocale("zh")
      .toLocaleString(DateTime.DATE_FULL);
  }
}
