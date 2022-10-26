//Import the user model
const User = require('../models/User')

//Require json web tokens for handeling the user when logged in
const jwt = require('jsonwebtoken')

//Required for handeling parsing urls
var url = require('url');

//Function to handle errors
const handleErrors = (err) => {
    //The err.message will be the custom error messages we made in the User schema!
    console.log(err.message, err.code) //Provides the error type and its code if not unique

    //Create and errors object
    let errors = { email: '', password: '' }

    //Whenever there's an error there's the message "user validation failed"
    //So let's look for that phrase and if we have it we can mess around with it
    
    //Duplication errors (11000 is the error code for duplications)
    if (err.code === 11000) {
        errors.email = 'that email is already registered!'
        return errors;
    }

    //Validation errors
    if (err.message.includes('user validation failed')) {
        //console.log(err) //Object gives us error value of what the user tried to use, properties, path, kind of error inside the errors property
        //console.log(Object.values(err.errors)) //Get the values of the different things inside the errors object; given as an array
        //Lets get the individual errors
        Object.values(err.errors).forEach(({properties}) => {
            //console.log(properties)

            //The path should either be an email or password
            errors[properties.path] = properties.message //The properties.path will be either email or password so it will equal the value in our errors object and set them equal to the message for the corresponding error
        })
    }

    //Incorrect email at login
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered'
    }

    //Incorrect password at login
    if (err.message === 'incorrect password') {
        errors.password = 'incorrect password'
    }

    return errors; //Send the errors object back
} 

//Function for json web tokens (use id when DB json format is created as each id is unique)
//Use maxAge for setting the age of a token
const maxAge = 12 * 60 * 60 //Value for 12 hours in seconds
const createToken = (id) => {
    return jwt.sign({ id }, 'JK13@SKlmnOq0909Wh', {
        expiresIn: maxAge
    }) //Pass the payload and secret into sign SECRET
}

//Functions to handle the get and post requests from the 'routes' folder
module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    //MIGHT NEED TO GET PERMISSION INFORMATION ADDED TO THIS FOR WHEN THE USER SIGNS UP

    console.log("Request body:", req.body); //Shows the JSON req data in the console
    //VARIABLES HERE MUST MATCH VARIABLES PASSED FROM signup.ejs!!
    const { email, password, firstName, lastName, number, userStatus } = req.body //Grabs the JSON objects one by one putting them into each variable

    console.log("Grabbed status: " + userStatus + " Grabbed email: " + email)
    //console.log(email, password); //Shows the same on console as first one above

    //Check names in the body
    console.log('Name in controller:', firstName, lastName)
    
    //Create a new user in the database with the user model
    try {
        //Create an instance of the user to save to DB
        //Must pass what matches the schema, so the email and password
        const user = await User.create({ email, password, firstName, lastName, number, userStatus }) //Async, gives a promise; make sure the function is async then

        //Create a json web token to have the user be logged in for verification
        const token = createToken(user._id)
        //Place inside a cookie and send in res
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })

        //Send response when above is done and it will be sent into our DB
        res.status(201).json({ user: user._id }) //Send back as json as response to front end
    }
    catch(err) {
        //console.log(err); //Log the error
        //Use the handleErrors function to get correct error messages ready
        const errors = handleErrors(err)
        //res.status(400).send('error, user not created') //Log the error type in the console
        //This goes to front end
        res.status(400).json({ errors }) //Will respond with the errors and the error message for each error in json format
    }
}

module.exports.login_post = async (req, res) => {
    //console.log(req.body); //Shows the JSON req data in the console
    const { email, password } = req.body //Grabs the JSON objects one by one putting them into each variable

    //Try to log the user in by using the static login function in the User.js file!
    try {
        //Call the login static function and it should return as errors or the user itself
        const user = await User.login(email, password)
        //Create token to send to browser
        const token = createToken(user._id)
        //Place inside a cookie and send in res
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    
        res.status(200).json({ user: user._id })

    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
}

module.exports.logout_get = (req, res) => {
    //We now need to delete the JWT cookie by replacing it with a blank cookie with a short expiration date
    res.cookie('jwt', '', { maxAge: 1 }) //Giving '' removes the token value and it expires in one milisecond

    //Now redirect them to the home page when logged out
    res.redirect('/')
}

//Function for saving skills 
module.exports.save_skill = async (request, response) => {
    console.log('Calling "/save-skill" on the Node.js server.')
	var inputs = url.parse(request.url, true).query
	console.log("The inputs string:", inputs.skill)
	const skill = inputs.skill
	const userEmail = inputs.email

	console.log("The skill is on the server side and it's:", skill)
	console.log("The email is on the server side and it's:", userEmail)

    await User.saveSkill(skill, userEmail)
	response.send("Skill Saved!")

}

//Function to see if password entered was correct
module.exports.fetch_password = async (request, response) => {
    console.log("In the server side to fetch the password")
    //Gets what was sent to the server side
    var input = url.parse(request.url, true).query
    //Variable used for sending a status back to the user if the password entered was right or wrong
    var correctPassword = "False"

    console.log("The input is", input.password)
    const inputPassword = input.password

    //If the password is correct set correctPassword to true
    if (inputPassword == "12345") {
        correctPassword = "True"
    }

    response.send(correctPassword)
}