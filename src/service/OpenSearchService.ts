import * as ALI from "aliyun-sdk";
import * as config from "config";
import { Service } from "typedi";
import { Post } from "../entity/Post";

@Service()
export class OpenSearchService {
  private opensearch: any;
  private appName: string;

  constructor() {
    this.opensearch = new ALI.OpenSearch({
      accessKeyId: config.get("opensearch.access_key"),
      secretAccessKey: config.get("opensearch.secret_key"),
      endpoint: config.get("opensearch.endpoint"),
      apiVersion: "2015-01-01"
    });
    this.appName = config.get("opensearch.app_name");
  }

  public uploadPosts(posts: Post[]) {
    const items = posts.map(({ id, title, content, publishedAt }) => ({
      cmd: "add",
      fields: {
        id: String(id),
        title,
        content,
        published_at: String(+publishedAt)
      }
    }));
    return new Promise((resolve, reject) => {
      this.opensearch.uploadDoc(
        {
          app_name: this.appName,
          action: "push",
          table_name: "posts",
          items
        },
        (err, res) => {
          if (err) {
            return reject(err);
          }
          resolve(res);
        }
      );
    });
  }
}
