const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Article = require('../models/Article');
const User = require('../models/User');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

router.post('/submit', ensureAuthenticated, async (req, res) =>{

  try {
    const user = await User.findById(req.user.id).select('-password');

    if(!user.submitted){
      user.submitted = true;
      const auth = user.name;
      const {atitle, acontent} = req.body;
      const newArticle = new Article({ atitle, acontent, auth});
      await newArticle.save();
      await  user.save();
  }
  else{
    return res.status(401).send('Delete existing submission to add another one.');
  }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }  
  console.log(req.user);
  res.render('submit');
});

router.post('/delete', ensureAuthenticated, async (req, res) => {
  const user = await User.findById(req.user.id);
  try {
    if(user.submitted){
      user.submitted = false;
      await Article.findOneAndDelete({auth: req.user.name});
      await user.save();
      res.render('delete');
  }
  else{
    return res.status(401).send('No article found for user.');
  }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  } 
})


// GET all existing articles or query in the above format to sort results according to attributes.
router.get("/articles/list", async (req,res) => {


  const sort = {}

  User.find({}, function(err, articles){
      if(err){
          console.log("ERROR!");
      } else {
         res.render("view-subs", {articles: articles}); 
      }
  });
})

module.exports = router;
