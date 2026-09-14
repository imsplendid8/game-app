import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCrawlHistory1694000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'crawl_history',
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
          },
          {
            name: 'crawl_started_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'crawl_completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['RUNNING', 'SUCCESS', 'PARTIAL_FAILURE', 'FAILURE'],
          },
          {
            name: 'programs_found',
            type: 'int',
            default: 0,
          },
          {
            name: 'programs_updated',
            type: 'int',
            default: 0,
          },
          {
            name: 'programs_created',
            type: 'int',
            default: 0,
          },
          {
            name: 'changes_detected',
            type: 'int',
            default: 0,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'error_stacktrace',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'crawl_history',
      new TableIndex({
        name: 'idx_crawl_history_adapter',
        columnNames: ['adapter_name'],
      }),
    );

    await queryRunner.createIndex(
      'crawl_history',
      new TableIndex({
        name: 'idx_crawl_history_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'crawl_history',
      new TableIndex({
        name: 'idx_crawl_history_completed_at',
        columnNames: ['crawl_completed_at'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('crawl_history');
  }
}
