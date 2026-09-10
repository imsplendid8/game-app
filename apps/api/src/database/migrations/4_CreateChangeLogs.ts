import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateChangeLogs1694000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'change_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'experience_run_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'change_type',
            type: 'enum',
            enum: [
              'PROGRAM_CREATED',
              'PROGRAM_UPDATED',
              'STATUS_CHANGED',
              'BOOKING_OPENED',
              'BOOKING_CLOSED',
              'BOOKING_TIME_REVEALED',
              'CAPACITY_CHANGED',
              'PRICE_CHANGED',
              'CANCELLATION_OCCURRED',
              'PROGRAM_CANCELLED',
            ],
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            default: "'MEDIUM'",
          },
          {
            name: 'changed_field',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'old_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'detected_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['experience_run_id'],
            referencedTableName: 'experience_runs',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'change_logs',
      new TableIndex({
        name: 'idx_change_logs_experience_run',
        columnNames: ['experience_run_id'],
      }),
    );

    await queryRunner.createIndex(
      'change_logs',
      new TableIndex({
        name: 'idx_change_logs_change_type',
        columnNames: ['change_type'],
      }),
    );

    await queryRunner.createIndex(
      'change_logs',
      new TableIndex({
        name: 'idx_change_logs_severity',
        columnNames: ['severity'],
      }),
    );

    await queryRunner.createIndex(
      'change_logs',
      new TableIndex({
        name: 'idx_change_logs_detected_at',
        columnNames: ['detected_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('change_logs');
  }
}
