export class UpdateResourceError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UpdateResourceError';
  }
}
