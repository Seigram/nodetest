const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');


const router = express.Router();

//Post /user/1/follow
router.post('/:id/follow', isLoggedIn, async (req,res,next)=>{
   try{
       const user = await User.findOne( { where: { id: req.user.id } });
       if(user) {
           await user.addFollowings(parseInt(req.params.id, 10));
           res.send('success');
       } else {
           res.status(404).send('no user');
       }
   } catch (e) {
       console.error(e);
       next(e);
   }
});

module.exports = router;