export class ComicCreationListNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ComicCreationListNotFoundError';
  }
}
