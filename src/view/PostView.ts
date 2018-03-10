import { DateTime } from "luxon";
import { Post } from "../service/PostService";

export class PostView {
  public id: number;
  public tags: string[];
  public title: string;
  public content: string;
  public url: string;
  public date: string;
  public datetime: string;

  constructor({
    id,
    tags,
    title,
    content_rendered,
    published_at
  }: Partial<Post>) {
    this.id = id;
    this.tags = (tags || []).slice();
    this.title = title;
    this.content = content_rendered;
    this.url = "/posts/" + Buffer.from("cursor:" + this.id).toString("base64");
    this.date = DateTime.fromJSDate(published_at!).toLocaleString(
      DateTime.DATE_FULL
    );
    this.datetime = DateTime.fromJSDate(published_at!).toISO();
  }
}
