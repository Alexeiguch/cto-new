export class TokenLimitError extends Error {
  constructor(limit, actual) {
    super(`Request exceeds token budget of ${limit} tokens (received ~${actual}).`);
    this.name = "TokenLimitError";
    this.limit = limit;
    this.actual = actual;
    this.statusCode = 422;
  }
}
