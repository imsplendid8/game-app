import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserPreferences1694000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
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
            isUnique: true,
          },
          {
            name: 'interested_categories',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'interested_institutions',
            type: 'uuid',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'max_price_per_program',
            type: 'int',
            default: 50000,
          },
          {
            name: 'prefer_free',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_opening_soon',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_opened_today',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_new_programs',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_cancellations',
            type: 'boolean',
            default: true,
          },
          {
            name: 'notify_cancellation_returns',
            type: 'boolean',
            default: true,
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
        foreignKeys: [
          {
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
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_user',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_preferences');
  }
}
