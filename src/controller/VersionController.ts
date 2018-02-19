import { Controller, Get } from 'routing-controllers'
import { VersionService } from '../service/VersionService'

@Controller()
export class VersionController {
  constructor (private versionService: VersionService) {
  }

  @Get('/')
  getVersion () {
    return {
      version: this.versionService.getVersion()
    }
  }
}
