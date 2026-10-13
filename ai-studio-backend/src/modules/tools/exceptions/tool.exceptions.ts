import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

export class ToolNotFoundException extends NotFoundException {
  constructor(name: string) {
    super({
      code: 'TOOL_NOT_FOUND',
      message: `Tool "${name}" is not registered.`,
    });
  }
}

export class ToolDisabledException extends ServiceUnavailableException {
  constructor(name: string) {
    super({
      code: 'TOOL_DISABLED',
      message: `Tool "${name}" is currently disabled.`,
    });
  }
}

export class ToolInputValidationException extends BadRequestException {
  constructor() {
    super({
      code: 'INVALID_TOOL_INPUT',
      message: 'Tool input does not match its registered schema.',
    });
  }
}

export class ToolPermissionException extends ForbiddenException {
  constructor() {
    super({
      code: 'TOOL_PERMISSION_DENIED',
      message: 'The caller is not authorized to use this tool.',
    });
  }
}
