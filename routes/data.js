const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const {ensureAuthenticated} = require("../config/auth")

const User = require('../models/User')

const creativeExpDB = "mongodb+srv://Abhinav123:Abhinav123@participant-data-ce.2z40r.mongodb.net/Participants?retryWrites=true&w=majority";


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
    const lastReg = await User.find({}).sort('-date').limit(1);
    lastReg = lastReg
    console.log(lastReg);
    res.render('data', {count, latestRegs, eName: "Creative Expression", eWeb: "https://creative-expression.herokuapp.com", user: req.user, latestDate: lastReg[0].date});
});

module.exports = router