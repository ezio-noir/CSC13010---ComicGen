export class UserAlreadyExistsError extends Error {
  constructor() {
    super();
    this.name = 'UserAlreadyExists';
  }
}
