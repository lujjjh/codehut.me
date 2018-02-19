import * as ClientOAuth2 from 'client-oauth2'
import { Service, Inject } from 'typedi';
import * as config from 'config'
import { Database } from './Database';

type User = {
  name: string
  displayName: string
}

@Service()
export class UserService {
  private auth: ClientOAuth2;

  @Inject()
  private database: Database;

  constructor () {
    this.auth = new ClientOAuth2({
      clientId: config.get('oauth.client_id'),
      clientSecret: config.get('oauth.client_secret'),
      accessTokenUri: 'https://github.com/login/oauth/access_token',
      authorizationUri: 'https://github.com/login/oauth/authorize',
      redirectUri: config.get('oauth.redirect_uri'),
      scopes: ['read:user']
    })
  }

  getUri () {
    return this.auth.code.getUri()
  }

  getToken (uri: string) {
    return this.auth.code.getToken(uri)
  }

  async findUserByUri (uri: string) {
    const token = await this.getToken(uri)
    const { login } = await token.client['_request'](token.sign({ url: 'https://api.github.com/user' }))
    if (typeof login !== 'string') {
      return undefined
    }
    return this.findUserByName(login)
  }

  async findUserByName (name: string) {
    const rows = await this.database.client.query(`
      SELECT name, display_name FROM users
      WHERE name = ?
    `, name)
    if (rows.length === 0) {
      return undefined
    }
    return {
      name: rows[0].name,
      displayName: rows[0].display_name
    } as User
  }
}
