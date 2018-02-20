import { NotFoundError } from "routing-controllers";

export class PostNotFoundError extends NotFoundError {
  constructor() {
    super("Post not found.");
  }
}
