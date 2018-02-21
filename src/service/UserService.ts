import * as ClientOAuth2 from "client-oauth2";
import * as config from "config";
import { Inject, Service } from "typedi";
import { Database } from "./Database";

interface User {
  id: number;
  name: string;
  display_name: string;
}

@Service()
export class UserService {
  private auth: ClientOAuth2;

  @Inject() private database: Database;

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
    return this.findUserByName(login);
  }

  public async findUserByName(name: string) {
    const rows = await this.database.client.query(
      `
      SELECT id, name, display_name FROM users
      WHERE name = ?
    `,
      name
    );
    if (rows.length === 0) {
      return undefined;
    }
    return rows[0] as User;
  }

  public async findUserById(id: number) {
    if (!id || +id !== +id) {
      return undefined;
    }
    const rows = await this.database.client.query(
      `
      SELECT id, name, display_name FROM users
      WHERE id = ?
    `,
      id
    );
    if (rows.length === 0) {
      return undefined;
    }
    return rows[0] as User;
  }
}
