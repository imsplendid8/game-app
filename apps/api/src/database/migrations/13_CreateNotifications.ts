import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateNotifications1694000013000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'experience_run_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'notification_type',
            type: 'enum',
            enum: [
              'BOOKING_OPENED_TODAY',
              'BOOKING_OPENED_TOMORROW',
              'BOOKING_OPENING_SOON',
              'NEW_PROGRAM_DISCOVERED',
              'CANCELLATION_OCCURRED',
              'PROGRAM_CANCELLED',
              'PRICE_CHANGED',
              'CAPACITY_CHANGED',
            ],
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          },
          {
            name: 'is_sent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
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
      'notifications',
      new TableIndex({
        name: 'idx_notifications_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_unread',
        columnNames: ['user_id', 'is_read'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_priority',
        columnNames: ['priority'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
