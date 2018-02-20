import * as cluster from 'cluster'
import * as os from 'os'
import * as path from 'path'

if (cluster.isMaster) {
  cluster.setupMaster({
    exec: path.join(__dirname, 'app')
  })
  os.cpus().forEach(() => cluster.fork())
  cluster.on('exit', () => cluster.fork())
}
