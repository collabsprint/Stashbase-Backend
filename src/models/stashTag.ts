import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from 'sequelize';

export class StashTag extends Model<
  InferAttributes<StashTag>,
  InferCreationAttributes<StashTag>
> {
  declare stashId: string;
  declare tagId: string;

    static initialize(sequelize: Sequelize): void {
        StashTag.init(
    {
        stashId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        tagId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'StashTags',
        modelName: 'StashTag',
        timestamps: false,
        indexes: [
        { unique: true, fields: ['stashId', 'tagId'] },
        { fields: ['tagId'] },
        ],
    }
    );
 }

}