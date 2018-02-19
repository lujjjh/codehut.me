import { Service } from 'typedi'

const pkg = require('../../package.json')

@Service()
export class VersionService {
  getVersion () {
    return String(pkg.version)
  }
}
