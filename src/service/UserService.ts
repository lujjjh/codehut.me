import * as ClientOAuth2 from "client-oauth2";
import * as config from "config";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { User } from "../entity/User";

@Service()
export class UserService {
  private auth: ClientOAuth2;

  @OrmRepository(User) private repository: Repository<User>;

  constructor() {
    this.auth = new ClientOAuth2({
      clientId: config.get("oauth.client_id"),
      clientSecret: config.get("oauth.client_secret"),
      accessTokenUri: "https://github.com/login/oauth/access_token",
      authorizationUri: "https://github.com/login/oauth/authorize",
      scopes: ["read:user"]
    });
  }

  public getUri() {
    return this.auth.code.getUri();
  }

  public getToken(uri: string) {
    return this.auth.code.getToken(uri);
  }

  public async findUserByUri(uri: string) {
    const token = await this.getToken(uri);
    const { login } = await (token.client as any)._request(
      token.sign({ url: "https://api.github.com/user" })
    );
    if (typeof login !== "string") {
      return undefined;
    }
    return this.repository.findOne({ where: { name: login } });
  }

  public async findById(id: number) {
    if (!id || +id !== +id) {
      return undefined;
    }
    return this.repository.findOneById(id);
  }
}
