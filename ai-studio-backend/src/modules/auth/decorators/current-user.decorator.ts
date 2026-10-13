/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  sessionId?: string;
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | unknown => {
    const request = ctx.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();

    const user = request.user;

    if (!user) {
      return undefined;
    }

    // @CurrentUser() returns the full authenticated user.
    // @CurrentUser('id') returns only the UUID.
    return data ? user[data] : user;
  },
);
