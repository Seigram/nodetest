const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};
const sequelize = new Sequelize(
  config.data, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;//사용자와 사용자관계
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);



module.exports = db;
