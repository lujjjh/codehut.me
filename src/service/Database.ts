import * as mysql from 'promise-mysql'
import * as config from 'config'
import { Service } from 'typedi'

@Service()
export class Database {
  client: mysql.Pool

  constructor () {
    this.client = mysql.createPool(config.get('database'))
  }
}
