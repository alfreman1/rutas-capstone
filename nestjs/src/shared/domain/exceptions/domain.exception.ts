export class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, code, 404);
  }
}

export class ConflictDomainException extends DomainException {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, code, 409);
  }
}

export class ValidationDomainException extends DomainException {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 422);
  }
}

export class BusinessRuleException extends DomainException {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
    super(message, code, 400);
  }
}
