import { BaseError } from "./BaseError";

export class ConflictError extends BaseError {
  constructor(message: string = "Identifier already declared") {
    super(409, message);
  }
}