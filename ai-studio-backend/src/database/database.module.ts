import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,

        host: configService.getOrThrow<string>('database.host'),

        port: configService.getOrThrow<number>('database.port'),

        username: configService.getOrThrow<string>('database.username'),

        password: configService.getOrThrow<string>('database.password'),

        database: configService.getOrThrow<string>('database.database'),

        ssl: configService.get<boolean>('database.ssl')
          ? {
              rejectUnauthorized: false,
            }
          : false,

        synchronize: false,

        logging: configService.get<boolean>('database.logging'),

        autoLoadEntities: true,

        migrations: [__dirname + '/migrations/*{.ts,.js}'],

        migrationsRun: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
