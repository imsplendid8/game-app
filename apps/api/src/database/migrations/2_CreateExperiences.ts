import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateExperiences1694000000001 implements MigrationInterface {
  name = 'CreateExperiences1694000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'experiences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'institutionId',
            type: 'uuid',
          },
          {
            name: 'programName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'programUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'bookingUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'isRecurring',
            type: 'boolean',
            default: false,
          },
          {
            name: 'experienceCategory',
            type: 'enum',
            enum: [
              'DOCENT',
              'WORKSHOP',
              'FACTORY_TOUR',
              'EXHIBITION',
              'PERFORMANCE',
              'EDUCATIONAL',
              'OUTDOOR',
              'SPECIAL_EVENT',
              'OTHER',
            ],
            isNullable: true,
          },
          {
            name: 'targetAgeMin',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'targetAgeMax',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'targetGradeMin',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'targetGradeMax',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'requiredGuardian',
            type: 'boolean',
            default: false,
          },
          {
            name: 'bookingMethod',
            type: 'enum',
            enum: ['FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'],
            default: "'FIRST_COME'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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
            name: 'discoveredAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'lastVerifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'externalId',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'externalSource',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'experiences',
      new TableForeignKey({
        columnNames: ['institutionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'institutions',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_experiences_institution" ON "experiences" ("institutionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experiences_category" ON "experiences" ("experienceCategory")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experiences_active" ON "experiences" ("isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experiences_external_id" ON "experiences" ("externalId", "externalSource")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('experiences');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('institutionId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('experiences', foreignKey);
    }
    await queryRunner.dropTable('experiences');
  }
}
