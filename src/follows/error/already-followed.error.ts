export class AlreadyFollowedError extends Error {
  constructor() {
    super();
    this.name = 'AlreadyFollowedError';
  }
}
