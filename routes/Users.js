const express = require('express');
const router = express.Router()
const cors = require("cors");
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

const User = require("../models/User")
router.use(cors())

process.env.SECRET_KEY  = 'secret'

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

router.post('/register', (req, res) => {
    const today = new Date()
    const userData = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        password : req.body.password,
        creared :  today
    }

    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(user => {
        if(!user){
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                userData.password = hash
                User.create(userData)
                .then(user => {
                    res.json({ status: user.email + ' Registred' })
                })
                .catch(err => {
                    res.send('error: ' + err)
                })
            })
        }
        else{
            res.json({ error: ' User already registred' })
        }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
})

router.post('/login', (req, res) => {
    console.log(req)
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(user => {
        if(user){
            if(bcrypt.compareSync(req.body.password, user.password)){
                console.log(user.password)
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: 1440
                })
                res.send(token)
            }
            else{
                res.json({ error: 'Password invalid'  })
            }
        }else{
            res.json({ error: 'User does not exist'  })
        }
    })
    .catch(err => {
        res.send({ error:  err })
    })
})

module.exports = router