import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBookingPatterns1694000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'booking_patterns',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'experience_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'pattern_type',
            type: 'enum',
            enum: [
              'FIXED_DAY_OF_MONTH',
              'RELATIVE_DAY_OF_MONTH',
              'FIXED_WEEKDAY',
              'RELATIVE_TO_EXPERIENCE',
              'SEASONAL',
              'IRREGULAR',
            ],
            isNullable: false,
          },
          {
            name: 'pattern_rule',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'time_of_day',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'confidence',
            type: 'float',
            default: 0.5,
          },
          {
            name: 'evidence_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_verified_at',
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
        foreignKeys: [
          {
            columnNames: ['experience_id'],
            referencedTableName: 'experiences',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [
          {
            columnNames: ['experience_id', 'pattern_type', 'pattern_rule'],
            name: 'uq_booking_patterns_unique',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'booking_patterns',
      new TableIndex({
        name: 'idx_booking_patterns_experience',
        columnNames: ['experience_id'],
      }),
    );

    await queryRunner.createIndex(
      'booking_patterns',
      new TableIndex({
        name: 'idx_booking_patterns_confidence',
        columnNames: ['confidence'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('booking_patterns');
  }
}
