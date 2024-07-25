export class FollowedNotExistError extends Error {
  constructor() {
    super();
    this.name = 'FollowedNotExistError';
  }
}
