import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAdapterState1694000009000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'adapter_state',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'adapter_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'last_crawl_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_successful_crawl_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'consecutive_failures',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_disabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'disable_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'next_scheduled_crawl_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'adapter_state',
      new TableIndex({
        name: 'idx_adapter_state_name',
        columnNames: ['adapter_name'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('adapter_state');
  }
}
