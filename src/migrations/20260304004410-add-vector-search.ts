import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {

  await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes"
    ADD COLUMN embedding vector(1536);
  `);

  await queryInterface.sequelize.query(`
    CREATE INDEX "Stashes_embedding_idx"
    ON "Stashes"
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes"
    DROP COLUMN search_vector
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes"
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector(
        'english',
        coalesce(title,'') || ' ' ||
        coalesce(url,'') || ' ' ||
        coalesce(metadata->>'description','') || ' ' ||
        coalesce(metadata->>'extractedText','')
      )
    ) STORED
  `);

}
export async function down(queryInterface: QueryInterface): Promise<void> {

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes"
    DROP COLUMN embedding
  `);

}