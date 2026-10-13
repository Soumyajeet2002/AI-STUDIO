import 'dotenv/config';

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5432),

  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,

  database: process.env.DATABASE_NAME,

  ssl:
    process.env.DATABASE_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  synchronize: false,

  logging: process.env.DATABASE_LOGGING === 'true',

  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  migrationsTableName: 'typeorm_migrations',
});
