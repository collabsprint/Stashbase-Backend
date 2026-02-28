import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class Collection extends Model<
  InferAttributes<Collection>,
  InferCreationAttributes<Collection>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare isDeleted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initialize(sequelize: Sequelize): void {
    Collection.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.STRING(128),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(256),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'Collections',
        modelName: 'Collection',
        indexes: [
          { fields: ['userId'] },
          { fields: ['userId', 'name'] },
        ],
      }
    );
  }
}