import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChats1791645354771 implements MigrationInterface {
    name = 'CreateChats1791645354771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "project_id" uuid, "title" character varying(200) NOT NULL DEFAULT 'New chat', "is_archived" boolean NOT NULL DEFAULT false, "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb, "last_message_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_chats_owner_archived" ON "chats" ("owner_id", "is_archived") `);
        await queryRunner.query(`CREATE INDEX "IDX_chats_owner_project" ON "chats" ("owner_id", "project_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_chats_owner_updated_at" ON "chats" ("owner_id", "updated_at") `);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_fe259bf83d8aac1091be2fac967" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_fe2057e1634447718cc9a0ff8ae" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_fe2057e1634447718cc9a0ff8ae"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_fe259bf83d8aac1091be2fac967"`);
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_chats_owner_updated_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_chats_owner_project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_chats_owner_archived"`);
        await queryRunner.query(`DROP TABLE "chats"`);
    }

}
