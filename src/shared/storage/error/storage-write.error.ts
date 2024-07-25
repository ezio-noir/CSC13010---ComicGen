export class StorageWriteError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'StorageWriteError';
  }
}
