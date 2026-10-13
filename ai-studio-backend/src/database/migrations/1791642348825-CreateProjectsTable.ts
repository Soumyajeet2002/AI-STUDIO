import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectsTable1791642348825 implements MigrationInterface {
    name = 'CreateProjectsTable1791642348825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_id" uuid NOT NULL, "name" character varying(120) NOT NULL, "description" character varying(2000), "icon" character varying(64), "color" character varying(32), "is_pinned" boolean NOT NULL DEFAULT false, "is_archived" boolean NOT NULL DEFAULT false, "settings" jsonb NOT NULL DEFAULT '{}'::jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_projects_owner_archived" ON "projects" ("owner_id", "is_archived") `);
        await queryRunner.query(`CREATE INDEX "idx_projects_owner_pinned" ON "projects" ("owner_id", "is_pinned") `);
        await queryRunner.query(`CREATE INDEX "idx_projects_owner_created_at" ON "projects" ("owner_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf"`);
        await queryRunner.query(`DROP INDEX "public"."idx_projects_owner_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_projects_owner_pinned"`);
        await queryRunner.query(`DROP INDEX "public"."idx_projects_owner_archived"`);
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
