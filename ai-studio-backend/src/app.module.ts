/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import { randomUUID } from 'node:crypto';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
// import { ConfigService } from '@nestjs/config';
// import { LoggerModule } from 'nestjs-pino';

import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ChatsModule } from './modules/chats/chats.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AgentRunsModule } from './modules/agent-runs/agent-runs.module';
import { ToolsModule } from './modules/tools/tools.module';
import { LlmModule } from './modules/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
      validate: validateEnvironment,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: configService.get<number>('REDIS_PORT', 6379),
          ...(configService.get<string>('REDIS_PASSWORD')
            ? {
                password: configService.get<string>('REDIS_PASSWORD'),
              }
            : {}),
        },
      }),
    }),

    // LoggerModule.forRootAsync({
    //   imports: [ConfigModule],

    //   inject: [ConfigService],

    //   useFactory: (configService: ConfigService) => ({
    //     pinoHttp: {
    //       level: configService.get<string>('logging.level') ?? 'info',

    //       genReqId: (request) =>
    //         request.headers['x-request-id'] ?? randomUUID(),

    //       redact: ['req.headers.authorization', 'req.headers.cookie'],
    //     },
    //   }),
    // }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    ChatsModule,
    MessagesModule,
    AgentRunsModule,
    ToolsModule,
    LlmModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
