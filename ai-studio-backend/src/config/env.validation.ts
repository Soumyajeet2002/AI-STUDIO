import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'test', 'production'])
  NODE_ENV!: 'development' | 'test' | 'production';

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  API_PREFIX!: string;

  @IsString()
  API_VERSION!: string;

  @IsString()
  DATABASE_HOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT!: number;

  @IsString()
  DATABASE_USERNAME!: string;

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  DATABASE_NAME!: string;

  @IsBoolean()
  DATABASE_SSL!: boolean;

  @IsBoolean()
  DATABASE_SYNCHRONIZE!: boolean;

  @IsBoolean()
  DATABASE_LOGGING!: boolean;

  @IsOptional()
  @IsUrl({
    require_tld: false,
  })
  CORS_ORIGIN?: string;

  @IsEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
  LOG_LEVEL!: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const transformed = plainToInstance(EnvironmentVariables, {
    ...config,
    PORT: Number(config.PORT),
    DATABASE_PORT: Number(config.DATABASE_PORT),
    DATABASE_SSL: config.DATABASE_SSL === 'true',
    DATABASE_SYNCHRONIZE: config.DATABASE_SYNCHRONIZE === 'true',
    DATABASE_LOGGING: config.DATABASE_LOGGING === 'true',
  });

  const errors = validateSync(transformed, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }

  return transformed;
}
