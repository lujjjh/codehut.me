import autobind from "autobind-decorator";
import { Inject, Service } from "typedi";
import { Cache } from "../cache/Cache";
import { Database } from "./Database";

export interface Post {
  id: number;
  tags: string[];
  title: string;
  content: string;
  published_at: Date;
}

@Service()
export class PostService {
  @Inject() private database: Database;

  @Cache({ ttl: 60 })
  public async findAll({ limit, offset }: { limit?: number; offset?: number }) {
    limit = Math.floor(limit || 10);
    offset = Math.floor(offset || 0);
    limit = Math.min(Math.max(1, limit), 20);
    offset = Math.max(0, offset);
    const rows = await this.database.client.query(
      `
      SELECT
        posts.id,
        GROUP_CONCAT(tags.name ORDER BY tags.id) AS tags,
        posts.title,
        posts.published_at
      FROM posts
      LEFT OUTER JOIN post_tags ON posts.id = post_tags.post_id
      LEFT OUTER JOIN tags ON tags.id = post_tags.tag_id
      WHERE posts.published_at <= NOW()
      GROUP BY posts.published_at DESC, posts.id DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );
    return rows.map(this.postFromRow) as Array<Partial<Post>>;
  }

  @Cache({ ttl: 60 })
  public async countAll() {
    const rows = await this.database.client.query(`
      SELECT COUNT(id) AS count
      FROM posts
    `);
    if (rows.length === 0) {
      return 0;
    }
    return +rows[0].count;
  }

  @Cache({ ttl: 120 })
  public async find(id: number) {
    const rows = await this.database.client.query(
      `
      SELECT
        posts.id,
        GROUP_CONCAT(tags.name ORDER BY tags.id) AS tags,
        posts.title,
        posts.content,
        posts.published_at
      FROM posts
      LEFT OUTER JOIN post_tags ON posts.id = post_tags.post_id
      LEFT OUTER JOIN tags ON tags.id = post_tags.tag_id
      WHERE posts.id = ?
      GROUP BY posts.id
      `,
      [id]
    );
    if (rows.length === 0) {
      return undefined;
    }
    return this.postFromRow(rows[0]);
  }

  private tagsFromCommaSepList(commaList: string | null) {
    return commaList === null ? [] : String(commaList).split(",");
  }

  @autobind
  private postFromRow({ id, tags, title, content, published_at }) {
    if (content !== undefined) {
      content = String(content);
    }

    return {
      id,
      tags: this.tagsFromCommaSepList(tags),
      title,
      content,
      published_at
    } as Post;
  }
}
