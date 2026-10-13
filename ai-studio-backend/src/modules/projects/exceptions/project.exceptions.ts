import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class ProjectNotFoundException extends NotFoundException {
  constructor() {
    super({
      code: 'PROJECT_NOT_FOUND',
      message: 'Project was not found',
    });
  }
}

export class ProjectAccessDeniedException extends ForbiddenException {
  constructor() {
    super({
      code: 'PROJECT_ACCESS_DENIED',
      message: 'You do not have access to this project',
    });
  }
}
