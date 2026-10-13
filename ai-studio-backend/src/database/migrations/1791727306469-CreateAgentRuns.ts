import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAgentRuns1791727306469 implements MigrationInterface {
    name = 'CreateAgentRuns1791727306469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "agent_runs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "chat_id" uuid NOT NULL, "status" "public"."agent_runs_status_enum" NOT NULL DEFAULT 'queued', "phase" "public"."agent_runs_phase_enum" NOT NULL DEFAULT 'queued', "input" text NOT NULL, "output_text" text NOT NULL DEFAULT '', "options" jsonb NOT NULL DEFAULT '{}'::jsonb, "error_code" character varying(100), "error_message" text, "cancel_requested_at" TIMESTAMP WITH TIME ZONE, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_442f7e0ec4ae860cf17edc57825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_runs_status_created" ON "agent_runs" ("status", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_agent_runs_chat_created" ON "agent_runs" ("chat_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_agent_runs_owner_created" ON "agent_runs" ("owner_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "agent_run_events" ("id" SERIAL NOT NULL, "run_id" uuid NOT NULL, "type" "public"."agent_run_events_type_enum" NOT NULL, "phase" "public"."agent_runs_phase_enum", "message" text, "payload" jsonb NOT NULL DEFAULT '{}'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a1a45c6fe6dd5347d8e70143a4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "agent_plan_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "run_id" uuid NOT NULL, "sequence_number" integer NOT NULL, "title" character varying(200) NOT NULL, "description" text, "status" "public"."agent_plan_steps_status_enum" NOT NULL DEFAULT 'pending', "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "error_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c95eb9bc2219d8d244dae388fc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_agent_plan_steps_run_sequence" ON "agent_plan_steps" ("run_id", "sequence_number") `);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "chats" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_chat_status"`);
        await queryRunner.query(`ALTER TYPE "public"."messages_role_enum" RENAME TO "messages_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant', 'system', 'tool')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" TYPE "public"."messages_role_enum" USING "role"::"text"::"public"."messages_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."messages_status_enum" RENAME TO "messages_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."messages_status_enum" AS ENUM('pending', 'streaming', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" TYPE "public"."messages_status_enum" USING "status"::"text"::"public"."messages_status_enum"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" SET DEFAULT 'completed'`);
        await queryRunner.query(`DROP TYPE "public"."messages_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_chat_status" ON "messages" ("chat_id", "status") `);
        await queryRunner.query(`ALTER TABLE "agent_runs" ADD CONSTRAINT "FK_2af212abc199a519af50aa81033" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_runs" ADD CONSTRAINT "FK_9b60bac67d5f44749c71b3c57f5" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_run_events" ADD CONSTRAINT "FK_9dcc7738d94725c47d3d8bed8de" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_plan_steps" ADD CONSTRAINT "FK_aa4547e78cae000b297df0fb81e" FOREIGN KEY ("run_id") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agent_plan_steps" DROP CONSTRAINT "FK_aa4547e78cae000b297df0fb81e"`);
        await queryRunner.query(`ALTER TABLE "agent_run_events" DROP CONSTRAINT "FK_9dcc7738d94725c47d3d8bed8de"`);
        await queryRunner.query(`ALTER TABLE "agent_runs" DROP CONSTRAINT "FK_9b60bac67d5f44749c71b3c57f5"`);
        await queryRunner.query(`ALTER TABLE "agent_runs" DROP CONSTRAINT "FK_2af212abc199a519af50aa81033"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_chat_status"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`CREATE TYPE "public"."messages_status_enum_old" AS ENUM('pending', 'streaming', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" TYPE "public"."messages_status_enum_old" USING "status"::"text"::"public"."messages_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "status" SET DEFAULT 'completed'`);
        await queryRunner.query(`DROP TYPE "public"."messages_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."messages_status_enum_old" RENAME TO "messages_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."messages_role_enum_old" AS ENUM('user', 'assistant', 'system', 'tool')`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" TYPE "public"."messages_role_enum_old" USING "role"::"text"::"public"."messages_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."messages_role_enum_old" RENAME TO "messages_role_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_chat_status" ON "messages" ("chat_id", "status") `);
        await queryRunner.query(`ALTER TABLE "chats" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_agent_plan_steps_run_sequence"`);
        await queryRunner.query(`DROP TABLE "agent_plan_steps"`);
        await queryRunner.query(`DROP TABLE "agent_run_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_agent_runs_owner_created"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_agent_runs_chat_created"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_agent_runs_status_created"`);
        await queryRunner.query(`DROP TABLE "agent_runs"`);
    }

}
