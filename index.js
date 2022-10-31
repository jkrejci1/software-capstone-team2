//Capstone Project Server Side Code
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 8080;

//Import our routes from the routes folder authRoutes to tell server to use those routes later
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

//Use checkUser to find if we have a user that is already logged in to give information in views
app.get('*', checkUser) //Apply this to every route

//Required authentication for the user profile route
app.get('/user', requireAuth)

//Use the routes file for routing everything outside of making requirements
app.use(authRoutes);

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