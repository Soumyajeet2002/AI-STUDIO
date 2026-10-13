/* eslint-disable @typescript-eslint/require-await */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import {
  AUTH_ACCESS_TOKEN_TYPE,
  AUTH_JWT_AUDIENCE,
  AUTH_JWT_ISSUER,
} from '../constants/auth.constants';

import { AccessTokenPayload } from '../interfaces/token-payload.interface';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('AUTH_ACCESS_TOKEN_SECRET');

    if (!secret) {
      throw new Error('AUTH_ACCESS_TOKEN_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: AUTH_JWT_ISSUER,
      audience: AUTH_JWT_AUDIENCE,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    if (
      payload.type !== AUTH_ACCESS_TOKEN_TYPE ||
      !payload.sub ||
      !payload.sessionId
    ) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      sessionId: payload.sessionId,
    };
  }
}
