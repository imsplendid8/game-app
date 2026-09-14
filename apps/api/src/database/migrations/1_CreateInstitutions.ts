import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInstitutions1694000000000 implements MigrationInterface {
  name = 'CreateInstitutions1694000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'institutions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'websiteUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'institutionType',
            type: 'enum',
            enum: ['PUBLIC', 'MUSEUM', 'SCIENCE_CENTER', 'FACTORY', 'BROADCASTING', 'OTHER'],
            default: "'OTHER'",
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
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_institutions_type" ON "institutions" ("institutionType")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_institutions_active" ON "institutions" ("isActive")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('institutions');
  }
}
