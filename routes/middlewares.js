//미들웨어 2개를 직접 만들어줌
exports.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        next();
    } else {
        res.status(403,send('로그인 필요'));
    }
};

exports.isNotLoggedIn = (req, res, next)=>{
  if(!req.isAuthenticated()){
      next();
  } else {
      const message = encodeURIComponent('로그인한 상태');
      res.redirect(`/?error=${message}`);
  }
};