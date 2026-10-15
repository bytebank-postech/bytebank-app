export class ApplicationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApplicationError'
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor(message = 'E-mail ou senha incorretos.') {
    super(message)
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailAlreadyInUseError extends ApplicationError {
  constructor(message = 'Este e-mail já está em uso.') {
    super(message)
    this.name = 'EmailAlreadyInUseError'
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
