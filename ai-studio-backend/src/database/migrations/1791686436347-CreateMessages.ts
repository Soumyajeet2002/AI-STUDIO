import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMessages1791686436347 implements MigrationInterface {
    name = 'CreateMessages1791686436347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant', 'system', 'tool')`);
        await queryRunner.query(`CREATE TYPE "public"."messages_status_enum" AS ENUM('pending', 'streaming', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" uuid NOT NULL, "role" "public"."messages_role_enum" NOT NULL, "content" text NOT NULL, "status" "public"."messages_status_enum" NOT NULL DEFAULT 'completed', "sequence_number" integer NOT NULL, "model_provider" character varying(50), "model_name" character varying(100), "input_tokens" integer, "output_tokens" integer, "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_859b0d9f2c0f4c90047f705b2b" CHECK ("sequence_number" > 0), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_chat_status" ON "messages" ("chat_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_messages_chat_created_at" ON "messages" ("chat_id", "created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_messages_chat_sequence" ON "messages" ("chat_id", "sequence_number") `);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "chats" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`);
        await queryRunner.query(`ALTER TABLE "chats" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_chat_sequence"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_chat_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_chat_status"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
    }

}
