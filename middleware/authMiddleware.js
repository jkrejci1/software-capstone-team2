//Require JWT package to verify tokens
const jwt = require('jsonwebtoken')
const User = require('../models/User')

//Checks midware status
const requireAuth = (req, res, next) => {

    //Grab the token that may or may not exist
    const token = req.cookies.jwt

    //Check if jwt exists and is valid
    if (token) {
        //Try to verify the token if we have one with jwt package
        jwt.verify(token, 'JK13@SKlmnOq0909Wh', (err, decodedToken) => {
            //Check if there is an error then the token would be invalid if there is
            if (err) {
                console.log(err.message)
                res.redirect('/login')
            } else {
                console.log(decodedToken)
                //Carry on with what user wanted to do
                next()
            }
        })
    } else {
        //Redirect them somewhere to login
        res.redirect('/login')
    }
}

//Check the current user
const checkUser = (req, res, next) => {
    //Get the token to verify it
    const token = req.cookies.jwt

    if (token) {
        //If there is one, verify it
        jwt.verify(token, 'JK13@SKlmnOq0909Wh', async (err, decodedToken) => {
            //Check if there is an error then the token would be invalid if there is
            if (err) {
                console.log(err.message)
                res.locals.user = null //Need to put this if they don't exist or there will be an error
                next()
            } else {
                console.log(decodedToken) //Remember our payload in the decodedToken is the ID of the user we can use this
                
                //Find user in database with that ID and inject them into a view (built in function)
                let user = await User.findById(decodedToken.id)

                //Use locals on response to make the user accessible by using whats after locals
                res.locals.user = user //Going to pass user into the view as 'user'

                //Carry on with what user wanted to do
                next()
            }
        })
    } else {
        res.locals.user = null //Like before we need to set this to null
        next()
    }
}

//Export above function to use outside this file
module.exports = { requireAuth, checkUser }