//Get routes from express package
const { Router } = require('express');

//Will use authController as a reference to the controller folder to handle the routes
//So we can use the functions in the authController folder now as the functions for the get and post requests
const authController = require('../controllers/authController');

const router = Router();

//Get and post requests for pages
//Get home page
router.get('/', authController.home_get);
//Get the user page
router.get('/user', authController.user_get);
//Get staff info page
router.get('/staff', authController.staff_get);
//Use auth controller for the {} functions to keep neat
router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);

//Server side functions
//Function for saving skill
router.get('/save-skill', authController.save_skill);
//Function for checking if password to sign up as a worker is correct
router.get('/fetch-password', authController.fetch_password);

//Export routes to be imported into index.js
module.exports = router;