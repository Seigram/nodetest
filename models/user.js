const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {//class가 모델이됨
  static init(sequelize){//init static 공식문서에서 static 쓰라고함
      return super.init({//부모모델 init
          email: {
              type: Sequelize.STRING(40),
              allowNull: true,
              unique: true,
          },
          nick: {
              type: Sequelize.STRING(15),
              allowNull: false,
          },
          password: {
              type: Sequelize.STRING(100),//암호화 고려
              allowNull: true,//sns로그인시 비밀번호 없을 수있음
          },
          provider: {
              type: Sequelize.STRING(10),
              allowNull: false,
              defaultValue: 'local',//로그인제공자
          },
          snsId: {
              type: Sequelize.STRING(30),
              allowNull: true,
          },
      },{
          sequelize,
          timestamps: true,
          underscored: false,
          modelName: 'User',
          tableName: 'users',
          paranoid: true,//임시삭제
          charset: 'utf8',//한글
          collate: 'utf8_general_ci',//한글
      });
  }


  static associate(db){
      db.User.hasMany(db.Post);
      db.User.belongsToMany(db.User, {//다대다 관계
          foreignKey: 'followingId',//UserId로 되버리면 햇갈리므로 정해줌
          as: 'Followers',//외래키와 반대로지정
          through: 'Follow',//Follow라는 중간테이블 생김
      });
      db.User.belongsToMany(db.User,{
         foreignKey: 'followerId',
         as: 'Followings',
         through: 'Follow',
      });
  }
};