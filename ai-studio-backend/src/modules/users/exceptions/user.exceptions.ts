import { ConflictException, NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'USER_NOT_FOUND',
      message: 'User was not found',
    });
  }
}

export class UserEmailAlreadyExistsException extends ConflictException {
  constructor() {
    super({
      code: 'USER_EMAIL_ALREADY_EXISTS',
      message: 'A user with this email already exists',
    });
  }
}
