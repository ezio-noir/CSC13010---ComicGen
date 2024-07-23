export class CreateComicError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CreateComicError';
  }
}
