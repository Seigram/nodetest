const express =require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');
const router= express.Router();


//팔로워 구현부분
router.use((req,res,next)=>{
   res.locals.user = req.user;
   res.locals.followerCount = req.user ? req.user.Followers.length : 0;
   res.locals.followingCount = req.user ? req.user.Followings.length : 0;
   res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
   next();
});


router.get('/profile', (req,res)=>{
   res.render('profile', {title: '내 정보 - NodeBird'});
});

router.get('/join', (req, res)=>{
   res.render('join', {title: '회읜가입 - NodeBird'});
});

//게시물 뿌려주기
router.get('/', async (req,res,next)=>{
//   const twits =[];//메인게시물들
   try{

      const posts = await Post.findAll({
         include: {
            model: User,
            attributes: ['id', 'nick'],
         },
         order: [['createdAt', 'DESC']],
      })
      res.render('main', {
         title : "NodeBird",
         twits : posts,
         //user: req.user, 위로 router.use로 뺴줌
      });
   } catch (e) {
      console.error(e);
      next(e);
   }

});

//GET /hashtag?hashtag=노드
//axios에 주소한글일 경우 encodeURIComponent('노드')프론트단에 하고 decodeURICompoenet로 받아야됨
router.get('/hashtag', async(req,res,next)=>{
   const query = req.query.hashtag;
   if(!query) {
       return res.redirect('/');
   }
   try {
       const hashtag = await Hashtag.findOne( { where: { title: query } });
       //해시태그찾고
       let posts = [];
       //딸린 포스트들을 가져옴
       if(hashtag) {
           posts = await hashtag.getPosts({ include: [{ model: User}] });//필요한부분만 보내줌 attribute로
       }

       return res.render('main', {
         title: `${query} | NodeBird`, //title 바꿈
         twits: posts,
      });
   } catch (e) {
      console.error(e);
      return next(e);
   }
});

module.exports = router;