import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import { ContentType, StashStatus, StashMetadata } from '../types';
import type { Collection } from './collection';
import type { Tag } from './tag';

export class Stash extends Model<
  InferAttributes<Stash>,
  InferCreationAttributes<Stash>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare url: string;
  declare title: string;
  declare contentType: CreationOptional<ContentType>;
  declare status: CreationOptional<StashStatus>;
  declare metadata: CreationOptional<StashMetadata>;
  declare isDeleted: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare collections?: NonAttribute<Collection[]>;
  declare tags?: NonAttribute<Tag[]>;

  static initialize(sequelize: Sequelize): void {
    Stash.init(
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
        url: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        contentType: {
          type: DataTypes.ENUM(...Object.values(ContentType)),
          allowNull: false,
          defaultValue: ContentType.LINK,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(StashStatus)),
          allowNull: false,
          defaultValue: StashStatus.PROCESSING,
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
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'Stashes',
        modelName: 'Stash',
        indexes: [
          { fields: ['userId'] },
          { fields: ['userId', 'contentType'] },
          { fields: ['createdAt'] },
          { fields: ['isDeleted'] },
        ],
      }
    );
  }
}