import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateExperienceRuns1694000000002 implements MigrationInterface {
  name = 'CreateExperienceRuns1694000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'experience_runs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'experienceId',
            type: 'uuid',
          },
          {
            name: 'runNumber',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'experienceDate',
            type: 'date',
          },
          {
            name: 'bookingOpenAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'bookingCloseAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'bookingMethod',
            type: 'enum',
            enum: ['FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'],
          },
          {
            name: 'capacity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'capacityRemaining',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['UNKNOWN', 'OPENING_SOON', 'OPEN', 'CLOSED', 'CANCELLED'],
            default: "'UNKNOWN'",
          },
          {
            name: 'automationStatus',
            type: 'enum',
            enum: ['AVAILABLE', 'CAPTCHA_REQUIRED', 'QUEUE_REQUIRED', 'MANUAL_REQUIRED'],
          },
          {
            name: 'automationNote',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'externalRunId',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
        ],
        uniques: [
          {
            columnNames: ['experienceId', 'experienceDate', 'runNumber'],
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'experience_runs',
      new TableForeignKey({
        columnNames: ['experienceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'experiences',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_runs_experience" ON "experience_runs" ("experienceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_runs_status" ON "experience_runs" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_runs_booking_open" ON "experience_runs" ("bookingOpenAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_runs_experience_date" ON "experience_runs" ("experienceDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('experience_runs');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('experienceId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('experience_runs', foreignKey);
    }
    await queryRunner.dropTable('experience_runs');
  }
}
