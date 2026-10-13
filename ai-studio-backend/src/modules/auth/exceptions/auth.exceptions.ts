import { ConflictException, UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'The refresh token is invalid or expired',
    });
  }
}

export class AuthSessionNotFoundException extends UnauthorizedException {
  constructor() {
    super({
      code: 'AUTH_SESSION_NOT_FOUND',
      message: 'The authentication session is no longer valid',
    });
  }
}

export class RegistrationEmailAlreadyExistsException extends ConflictException {
  constructor() {
    super({
      code: 'REGISTRATION_EMAIL_ALREADY_EXISTS',
      message: 'A user with this email already exists',
    });
  }
}
