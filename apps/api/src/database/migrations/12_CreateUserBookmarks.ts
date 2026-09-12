import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserBookmarks1694000012000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_bookmarks',
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
            isNullable: false,
          },
          {
            name: 'bookmark_type',
            type: 'enum',
            enum: ['WISHLIST', 'INTERESTED', 'COMPLETED', 'BOOKED'],
          },
          {
            name: 'booked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'external_booking_id',
            type: 'varchar',
            length: '500',
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
        uniques: [
          {
            columnNames: ['user_id', 'experience_run_id'],
            name: 'uq_user_bookmarks_unique',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_bookmarks',
      new TableIndex({
        name: 'idx_user_bookmarks_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_bookmarks',
      new TableIndex({
        name: 'idx_user_bookmarks_run',
        columnNames: ['experience_run_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_bookmarks',
      new TableIndex({
        name: 'idx_user_bookmarks_type',
        columnNames: ['bookmark_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_bookmarks');
  }
}
