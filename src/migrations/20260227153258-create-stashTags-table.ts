import { QueryInterface, DataTypes } from 'sequelize';

  export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('StashTags', {
      stashId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Stashes', key: 'id' },
        onDelete: 'CASCADE',
      },
      tagId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Tags', key: 'id' },
        onDelete: 'CASCADE',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });

    await queryInterface.addIndex('StashTags', ['stashId', 'tagId'], {
      unique: true,
      name: 'StashTags_pkey',
    });
    await queryInterface.addIndex('StashTags', ['tagId'], {
      name: 'StashTags_tagId_idx'
    });
  }

  export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('StashTags');
  }