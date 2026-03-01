import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {

  await queryInterface.createTable('Stashes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    contentType: {
      type: DataTypes.ENUM('link', 'note', 'photo', 'video', 'document'),
      allowNull: false,
      defaultValue: 'link',
    },
    status: {
      type: DataTypes.ENUM('processing', 'ready', 'error'),
      allowNull: false,
      defaultValue: 'processing',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('Stashes', ['userId'], {
    name: 'Stashes_userId_idx'
  });
  await queryInterface.addIndex('Stashes', ['userId', 'contentType'] , {
    name: 'Stashes_userId_contentType_idx'
  });
  await queryInterface.addIndex('Stashes', ['userId', 'status'], {
    name: 'Stashes_userId_status_idx'
  });
  await queryInterface.addIndex('Stashes', ['createdAt'], {
    name: 'Stashes_createdAt_idx'
  });
  await queryInterface.addIndex('Stashes', ['isDeleted'], {
    name: 'Stashes_isDeleted_idx'
  });

  await queryInterface.sequelize.query(
    `CREATE INDEX "Stashes_metadata_gin" ON "Stashes" USING GIN (metadata)`
  );

  await queryInterface.sequelize.query(`
    ALTER TABLE "Stashes"
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, ''))) STORED
  `);

  await queryInterface.sequelize.query(
    `CREATE INDEX "Stashes_search_vector_idx" ON "Stashes" USING GIN (search_vector)`
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('Stashes');
}