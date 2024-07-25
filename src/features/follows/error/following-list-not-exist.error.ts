export class FollowingListNotExistError extends Error {
  constructor() {
    super();
    this.name = 'FollowingListNotExistError';
  }
}
