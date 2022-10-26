//Capstone Project Server Side Code
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
var url = require('url');
const port = process.env.PORT || 8080;
//Be able to access the Schema for saving skills
const userSchema = require('./models/User');

//Import our routes from the routes folder authRoutes
const authRoutes = require('./routes/authRoutes');

//Import cookie parser package to work with cookies
const cookieParser = require('cookie-parser')

//Import function to require authentication to go to certain pages and check if user exists (middleware)
const { requireAuth, checkUser } = require('./middleware/authMiddleware')

//middleware
app.use(express.static('public'));
app.use(express.json()); //Parces JSON into a javascript object to be used inside the code attaching it to the request in the authRoutes file
app.use(cookieParser()); //Now you can access cookie methods on responses

//Set view for ejs
app.set('view engine', 'ejs')

//Connect to the MongoDB database
const dbURI = 'mongodb+srv://Jack:12Stone25@cluster0.c8vrqj7.mongodb.net/node-auth?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
/*

	.then((result) => app.listen(3000))
	.catch((err) => console.log(err))
*/

//Use checkUser to find if we have a user that is already logged in to give information in views
app.get('*', checkUser) //Apply this to every route

//Show the homepage with just a / route
app.get('/', (request, response) => {
	response.render('index.ejs')
})

//Show user page if the user is logged in
app.get('/user', requireAuth, (req, res) => res.render('user'))

//Use the routes for the authentication pages
app.use(authRoutes);


//Function to save a new skill given by the user to the database 
app.get('/save-skill', async (request, response) => {
	console.log('Calling "/save-skill" on the Node.js server.')
	var inputs = url.parse(request.url,true).query
	console.log("The inputs string:", inputs.skill)
	const skill = inputs.skill
	const userEmail = inputs.email

	console.log("The skill is on the server side and it's:", skill)
	console.log("The email is on the server side and it's:", userEmail)

	//Save the password to proper user in MongoDB WORKS!!
	await userSchema.findOneAndUpdate({
		email: userEmail.trim()
	}, {
		$push: { //Use $push MongoDB function to push the password to the array
			userSkills: skill
		}
	}
)

	response.send("Skill Saved!")
})


// Custom 404 page.
app.use((request, response) => {
    response.type('text/plain')
    response.status(404)
    response.send('404 - Not Found')
  })
  
// Custom 500 page.
app.use((err, request, response, next) => {
    console.error(err.message)
    response.type('text/plain')
    response.status(500)
    response.send('500 - Server Error')
  })
  
//Connect to port 
app.listen(port, () => console.log(
    `Express started at \"http://localhost:${port}\"\n` +
    `press Ctrl-C to terminate.`)
  )