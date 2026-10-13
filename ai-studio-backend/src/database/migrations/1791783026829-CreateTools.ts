import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTools1791783026829 implements MigrationInterface {
  name = 'CreateTools1791783026829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tool_executions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'chat_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'run_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tool_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'tool_version',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'input_hash',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'output',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'error_code',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'duration_ms',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: 'fk_tool_executions_user',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'tool_executions',
      new TableIndex({
        name: 'idx_tool_executions_status',
        columnNames: ['status', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'tool_executions',
      new TableIndex({
        name: 'idx_tool_executions_run',
        columnNames: ['run_id'],
      }),
    );

    await queryRunner.createIndex(
      'tool_executions',
      new TableIndex({
        name: 'idx_tool_executions_user_created',
        columnNames: ['user_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tool_executions', true);
  }
}
