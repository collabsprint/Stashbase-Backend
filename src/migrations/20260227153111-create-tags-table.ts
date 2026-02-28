import { QueryInterface, DataTypes } from 'sequelize';

  export async function up(queryInterface: QueryInterface): Promise<void> {

    await queryInterface.createTable('Tags', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.ENUM('Article', 'Website', 'Video', 'Photo'),
        allowNull: false,
        unique: true,
      },
      createdAt: {
         type: DataTypes.DATE, 
         allowNull: false, 
         defaultValue: DataTypes.NOW 
        },
      updatedAt: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
      },
    });

    // Seed the four tags immediately — they're system-defined
    await queryInterface.sequelize.query(`
      INSERT INTO "Tags" (id, name, "createdAt", "updatedAt") VALUES
        (gen_random_uuid(), 'Article', NOW(), NOW()),
        (gen_random_uuid(), 'Website', NOW(), NOW()),
        (gen_random_uuid(), 'Video',   NOW(), NOW()),
        (gen_random_uuid(), 'Photo',   NOW(), NOW())
    `);
  }

  export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('Tags');
  }