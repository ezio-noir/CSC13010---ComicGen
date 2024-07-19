export class IsNotAdminError extends Error {
  constructor() {
    super();
    this.name = 'IsNotAdminError';
  }
}
