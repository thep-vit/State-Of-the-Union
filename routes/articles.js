const Article = require("../models/Article");
const auth = require("../middleware/auth");
const flash = require('connect-flash');
const express = require("express");
const sharp = require("sharp")
const multer = require("multer")


const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Upload Proper File"))
        }
        cb(undefined,true)
    }
})

// POST new article
router.post("/",auth, upload.single("picture"), async(req,res)=>{
    // console.log("Before Post Article")
    // console.log("req body",req.body)
    const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250}).png().toBuffer()
    
    const newArticle = new Article({
        ...req.body,
        author: req.user._id,
        picture: buffer
    })
    
    try {
        await newArticle.save();
        res.locals.message = req.body.message;
        res.redirect("/users/dashboard").json( { message: 'your message' });
        // res.status(201).send(newArticle)
    } catch (e) {
        res.status(400).send()
    }

})

// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc

// GET all existing articles or query in the above format to sort results according to attributes.
router.get("/list", auth, async (req,res) => {


    const sort = {}

    Article.find({}, function(err, articles){
        if(err){
            console.log("ERROR!");
        } else {
           res.render("view-subs", {articles: articles}); 
        }
    });
})


// GET articles according to ID
router.get("/:id",auth, async (req,res) => {
    const _id = req.params.id

    try {
        // const foundTask = await Task.findById(_id)
        const foundArticle = await Article.findOne( { _id,author:req.user._id } )
        if (!foundArticle){
            return res.status(404).send()
        }
        res.send(foundArticle)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router