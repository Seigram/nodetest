const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () =>{
    //유저에 ID만 저장하기위해 사용 메모리 효율성을 위해 serializeUser deserializeUser만듬
    passport.serializeUser((user, done) => {
        done(null, user.id); //유저 id만 뽑아 done 세션에 user의 id만 저장
        //req.user req.inAuthenticated(로그인한 상태인지 아닌지)
    });

    //{ id: 3, 'connect.sid: s%2893479234789' } 아이디만가지고 쿠키를 판단하여 deserialize로 필요할때 정보를 가져옴
    //메모리의 효율성을 위해 id만 사용함
    //req.user를 여기서 정의
    passport.deserializeUser((id, done) => {
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    });
    local(); //등록
    kakao(); //등록
};