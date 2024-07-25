export class CreateResourceError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CreateResourceError';
  }
}
