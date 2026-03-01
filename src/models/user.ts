import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from 'sequelize';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string;
  declare email: CreationOptional<string | null>;
  declare displayName: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare isDeleted: CreationOptional<boolean>;

  static initialize(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.STRING(128),
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(320),
          allowNull: true,
          unique: true,
        },
        displayName: {
          type: DataTypes.STRING(256),
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
      { sequelize, 
        tableName: 'Users', 
        modelName: 'User' 
    }
    );
  }
}