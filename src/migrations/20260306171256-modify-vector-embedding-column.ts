import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes" DROP COLUMN IF EXISTS embedding;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes" ADD COLUMN embedding vector(384);
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes" DROP COLUMN IF EXISTS embedding;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes" ADD COLUMN embedding vector(768);
  `);
}