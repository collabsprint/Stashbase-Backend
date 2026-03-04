import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {

  await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  `);

  await queryInterface.sequelize.query(`
    CREATE INDEX IF NOT EXISTS "Stashes_title_trgm_idx"
    ON "Stashes"
    USING gin (title gin_trgm_ops);
  `);

}

export async function down(queryInterface: QueryInterface): Promise<void> {

  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS "Stashes_title_trgm_idx";
  `);

}