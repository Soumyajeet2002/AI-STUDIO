import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTable1791560238803 implements MigrationInterface {
    name = 'CreateAuthTable1791560238803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "refresh_token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "last_used_at" TIMESTAMP WITH TIME ZONE, "user_agent" character varying(1024), "ip_address" character varying(64), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_641507381f32580e8479efc36cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_auth_sessions_expires_at" ON "auth_sessions" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_auth_sessions_user_id" ON "auth_sessions" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_auth_sessions_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auth_sessions_expires_at"`);
        await queryRunner.query(`DROP TABLE "auth_sessions"`);
    }

}
