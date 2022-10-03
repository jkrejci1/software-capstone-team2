//Get routes from express package
const { Router } = require('express');

//Will use authController as a reference to the controller folder to handle the routes
//So we can use the functions in the authController folder now as the functions for the get and post requests
const authController = require('../controllers/authController');

const router = Router();

//Get and post requests for pages
//Use auth controller for the {} functions to keep neat
router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);


//Export routes to be imported into index.js
module.exports = router;