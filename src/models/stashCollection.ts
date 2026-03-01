import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';

export class StashCollection extends Model<
  InferAttributes<StashCollection>,
  InferCreationAttributes<StashCollection>
> {
  declare stashId: string;
  declare collectionId: string;
  declare isDeleted: boolean;

  static initialize(sequelize: Sequelize): void {
    StashCollection.init(
      {
        stashId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        collectionId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'StashCollections',
        modelName: 'StashCollection',
        timestamps: false,
        indexes: [
          { unique: true, fields: ['stashId', 'collectionId'] },
          { fields: ['collectionId'] },
        ],
      }
    );
  }
}