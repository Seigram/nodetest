const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new localStrategy({
        usernameField: 'email', //req.body email
        passwordField: 'password', //req.body password 되야함
    }, async (email, password, done) =>{
        try{//이메일 확인
            const exUser = await  User.findOne( { where : {email} });
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);//비밀번호 비교
                //이메일 있으면 비밀번호 체크
                if(result) {
                    done(null, exUser);// 성공
                } else {
                    done(null, false, { message: '비밀번호 일치안함'});// 실패
                }
            } else {
                done(null, false, { message : '가입되지 않은 회원' });// 실패
            }
        } catch (e) {
            console.error(e);
            done(e);//에러
        }
    }));
}

