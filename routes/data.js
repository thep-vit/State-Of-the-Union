const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const {ensureAuthenticated} = require("../config/auth")

const User = require('../models/User')

const creativeExpDB = "mongodb+srv://Abhinav123:Abhinav123@tfe-participants.jybyd.mongodb.net/TFE-Participants?retryWrites=true&w=majority";


router.get('/', ensureAuthenticated, (req, res) => {
    res.render('landing');
});

router.get('/CERegCount', ensureAuthenticated, async (req, res) => {
    mongoose.connect(creativeExpDB,{
        useNewUrlParser: true,
        useUnifiedTopology:true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(()=> {
        console.log("MONGO DB CONNECTED!")
    }).catch((e)=>console.log("Cannot Connect to Mongo",e));

    // const count = await User.find({}).sort('-date');
    const count = await User.find({}).count();
    const latestRegs = await User.find({}).sort('-date').limit(10);
    let lastReg = await User.find({}).sort('-date').limit(1);
    
    console.log(lastReg);
    res.render('data', {count, latestRegs, eName: "Fourth Estate", eWeb: "https://fourth-estate.herokuapp.com", user: req.user, latestDate: lastReg[0].date});
});

module.exports = router