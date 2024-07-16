export class UserNotFoundError extends Error {
  constructor() {
    super();
    this.name = 'UserNotFoundError';
  }
}
