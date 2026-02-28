import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.DB_NAME  || 'stashbase',
  process.env.DB_USER  || 'postgres',
  process.env.DB_PASS  || 'password',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool:    { max: 10, min: 2, acquire: 30_000, idle: 10_000 },
    define:  { underscored: false, timestamps: true, freezeTableName: false },
  }
);