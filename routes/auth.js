const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();
//isNotLoggedIn 통과해야됨 미들웨어를 통한 검사 가능
router.post('/join', isNotLoggedIn,  async (req,res,next)=>{
    const { email, nick, password} = req.body;
    try{
        const exUser = await User.findOne({ where: { email }});
        if (exUser){
            return res.redirect('/join?error=exist');//에러처리 쿼리스트링
        }
        const hash = await bcrypt.hash(password, 12);//숫자높을수록 해시레벨 올라가지만 성능저하
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (e){
        console.error(e);
        return next(e);
    }
});

router.post('/login', (req, res, next) => {
    //로그인전이므로 req.user 안들어가 있음
    passport.authenticate('local', (authError, user, info) =>   {//미들웨어 확장 localstrategy찾음
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => { //passport/index로가서  user id만 뽑아서 done
            //serialize done 되면 여기어래실행
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            //세션쿠키를 브라우저로 보내주고 페이지를 돌려보냄
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));


//카카오로 로그인하면 developer.kakao.com에 적어둔 콜백주소로 로그인정보를 보내줌
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;