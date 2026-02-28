import { QueryInterface, DataTypes } from 'sequelize';

  export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('StashCollections', {
      stashId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Stashes', key: 'id' },
        onDelete: 'CASCADE',
      },
      collectionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Collections', key: 'id' },
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('StashCollections', ['stashId', 'collectionId'], {
      unique: true,
      name: 'StashCollections_pkey',
    });
    await queryInterface.addIndex('StashCollections', ['collectionId'] , {
      name: 'StashCollections_collectionId_idx'
    });
  }

  export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('StashCollections');
  }