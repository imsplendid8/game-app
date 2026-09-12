import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBookingPredictions1694000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'booking_predictions',
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
            name: 'predicted_experience_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'predicted_booking_open_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'confidence',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'pattern_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'actual_booking_open_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['experience_id'],
            referencedTableName: 'experiences',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['pattern_id'],
            referencedTableName: 'booking_patterns',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'booking_predictions',
      new TableIndex({
        name: 'idx_booking_predictions_experience',
        columnNames: ['experience_id'],
      }),
    );

    await queryRunner.createIndex(
      'booking_predictions',
      new TableIndex({
        name: 'idx_booking_predictions_predicted_date',
        columnNames: ['predicted_booking_open_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('booking_predictions');
  }
}
