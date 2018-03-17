import * as highlightjs from "highlight.js";
import * as MarkdownIt from "markdown-it";
import * as MarkdownItFootnote from "markdown-it-footnote";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Post } from "../entity/Post";
import { han } from "../han";

const md = new MarkdownIt({
  html: true,
  highlight: (code, language) => {
    const validLang = !!(language && highlightjs.getLanguage(language));
    const highlighted = validLang
      ? highlightjs.highlight(language, code).value
      : code;
    return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
  }
}).use(MarkdownItFootnote);

@Service()
export class PostService {
  @OrmRepository(Post) public repository: Repository<Post>;

  public findAll({ limit, offset }: { limit?: number; offset?: number }) {
    limit = Math.floor(limit || 10);
    offset = Math.floor(offset || 0);
    limit = Math.min(Math.max(1, limit), 20);
    offset = Math.max(0, offset);
    return this.repository.find({
      where: "published_at <= NOW()",
      order: { publishedAt: "DESC" },
      take: limit,
      skip: offset
    });
  }

  public countAll() {
    return this.repository.count();
  }

  public async find(id: number) {
    const post = await this.repository.findOneById(id);
    if (!post) {
      return undefined;
    }
    if (!post.contentRendered) {
      post.contentRendered = (await han.ready()).render(
        md.render(post.content)
      );
      return this.repository.save(post);
    }
    return post;
  }

  public save(post: Partial<Post>) {
    return this.repository.save(post);
  }
}
