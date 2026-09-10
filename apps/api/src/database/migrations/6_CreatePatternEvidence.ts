import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePatternEvidence1694000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pattern_evidence',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'booking_pattern_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'experience_run_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'predicted_booking_open_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_booking_open_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'matched',
            type: 'boolean',
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
            columnNames: ['booking_pattern_id'],
            referencedTableName: 'booking_patterns',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['experience_run_id'],
            referencedTableName: 'experience_runs',
            referencedColumnNames: ['id'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pattern_evidence',
      new TableIndex({
        name: 'idx_pattern_evidence_pattern',
        columnNames: ['booking_pattern_id'],
      }),
    );

    await queryRunner.createIndex(
      'pattern_evidence',
      new TableIndex({
        name: 'idx_pattern_evidence_run',
        columnNames: ['experience_run_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pattern_evidence');
  }
}
