import { Get, Param, NotFoundError, JsonController, OnUndefined, QueryParam, Post, Authorized, HttpError } from 'routing-controllers'
import { Inject } from 'typedi'
import { PostService } from '../service/PostService'
import { Cache } from '../cache/Cache'

export class PostNotFoundError extends NotFoundError {
  constructor () {
    super('Post not found.')
  }
}

@JsonController('/posts')
export class PostController {
  @Inject() private postService: PostService

  @Get('/')
  @Cache({ ttl: 60 })
  findAll (@QueryParam('limit') limit: number, @QueryParam('offset') offset: number) {
    return this.postService.findAll({ limit, offset })
  }

  @Get('/:id')
  @Cache({ ttl: 10 })
  @OnUndefined(PostNotFoundError)
  find (@Param('id') id: number) {
    if (id !== id) {
      return undefined
    }
    return this.postService.find(id)
  }

  @Post('/')
  @Authorized()
  create () {
    throw new HttpError(501, 'Not implemented.')
  }
}
