export class RetryableError extends Error {
  constructor() {
    super();
    this.name = "RetryableError";
  }
}
