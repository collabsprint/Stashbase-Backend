import { Sequelize } from 'sequelize';
import { User } from './user';
import { Collection } from './collection';
import { Stash } from './stash';
import { Tag } from './tag';
import { StashCollection } from './stashCollection';
import { StashTag } from './stashTag';

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

User.initialize(sequelize);
Collection.initialize(sequelize);
Tag.initialize(sequelize);
StashCollection.initialize(sequelize);
StashTag.initialize(sequelize);
Stash.initialize(sequelize);

User.hasMany(Collection, { foreignKey: 'userId', as: 'Collections' });
User.hasMany(Stash,      { foreignKey: 'userId', as: 'Stashes' });

Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Collection.belongsToMany(Stash, {
  through: StashCollection,
  foreignKey: 'collectionId',
  otherKey: 'stashId',
  as: 'Stashes',
});

Stash.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Stash.belongsToMany(Collection, {
  through: StashCollection,
  foreignKey: 'stashId',
  otherKey: 'collectionId',
  as: 'Collections',
});
Stash.belongsToMany(Tag, {
  through: StashTag,
  foreignKey: 'stashId',
  otherKey: 'tagId',
  as: 'Tags',
});
Tag.belongsToMany(Stash, {
  through: StashTag,
  foreignKey: 'tagId',
  otherKey: 'stashId',
  as: 'Stashes',
});

StashCollection.belongsTo(Stash,      { foreignKey: 'stashId' });
StashCollection.belongsTo(Collection, { foreignKey: 'collectionId' });
StashTag.belongsTo(Stash, { foreignKey: 'stashId' });
StashTag.belongsTo(Tag,   { foreignKey: 'tagId' });

export { User, Collection, Stash, Tag, StashCollection, StashTag };