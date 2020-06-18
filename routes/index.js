const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const fs = require('fs');


const Article = require('../models/Article');
const User = require('../models/User');

// const upload = multer({
//   limits: {
//       fileSize: 10000000
//   },
//   fileFilter(req,file,cb) {
//       if (!file.originalname.match(/\.(pdf)$/)) {
//           return cb(new Error("Upload Proper File"))
//       }
//       cb(undefined,true)
//   }
// })

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

router.post('/submit', ensureAuthenticated,  async (req, res) =>{
  // const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250}).pdf().toBuffer()

  try {
    const user = await User.findById(req.user.id).select('-password');

    if(!user.submitted){

      user.submitted = true;
      const auth = user.name;
      const email = user.email;
      const draft = req.files.draft.data;
      const {atitle, acontent} = req.body;
      const newArticle = new Article({ atitle, acontent, auth, email, draft});
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

  Article.find({}, function(err, articles){
      if(err){
          console.log("ERROR!");
      } else {
         res.render("view-subs", {articles: articles}); 
        // res.send(articles[0].draft.buffer.data)
        // fs.writeFileSync(`${article.auth}1.pdf`, article.draft.data.buffer);
      }
  });
})

router.post("/articles/downloads/:id", async (req,res) => {
  Article.findOne({_id: req.params.id}, function(err, article){
      if(err){
          console.log("ERROR!");
      } else {
        const dr = new Buffer(article.draft, 'base64')
         fs.writeFileSync(`${article.auth}.pdf`, dr, 'base64');
      }
  });
  res.redirect('/articles/list');
})

module.exports = router;
