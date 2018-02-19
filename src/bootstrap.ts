import * as cluster from 'cluster'
import * as path from 'path'
import * as os from 'os'

if (cluster.isMaster) {
  cluster.setupMaster({
    exec: path.join(__dirname, 'app')
  })
  os.cpus().forEach(() => cluster.fork())
  cluster.on('exit', () => cluster.fork())
}
