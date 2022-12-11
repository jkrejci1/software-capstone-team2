//User model that is going to be used for MongoDB in JSON format
//Use mongoose to do this
const mongoose = require('mongoose');

//Use the validator package to validate emails
const { isEmail } = require('validator') //Just need to pass this into validate now otherwise we'd have to use reqular expressions to check it

//Use the bcryot package to hash passwords before saved to database
const bcrypt = require('bcrypt')

//Create a schema for what our objects will look in the database
const userSchema = new mongoose.Schema({
    
    //Require an email that will be a String and it must be unique from any other email on the site
    email: {
        type: String,
        required: [true, 'Please enter an email!'], //Use array format to make customized error messages
        unique: true,
        lowercase: true, //Turns everything into lowercase when stored in DB
        validate: [isEmail, 'Please enter a valid email!']
    },

    //Now make it to where we will need a required password with a minimum of 6 characters
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        minlength: [6, 'Minimum password length is 6 characters!']
    },

    //Make it required for a user signing up to enter their first name
    firstName: {
        type: String,
        required: [true, 'Please enter your first name']
    },

    //Make it required for a user signing up to enter their last name
    lastName: {
        type: String,
        required: [true, 'Please enter your last name']
    },

    //Make it required for a user signing up to enter their number 
    number: {
        type: String,
        required: [true, 'Please enter your phone number']
    },

    //User status to allow certain permissions 
    userStatus: {
        type: String,
        required: [true, 'Could not get status!'],
        lowercase: true
    },
    
    //User skills that can only have anything added when a user is a worker (it's an array)
    userSkills: {
        type: [String],
        required: false
    },

    //User about me information that can only be added when user is a worker (aka volunteer)
    userAbout: {
        type: [String],
        required: false
    },

    //User weekly availability information for volunteers
    weeklyAvailability: {
        type: [String],
        required: false
    }
});

//Mongoose hooks pre/post (use the pre hook to hash a password before it's saved in DB)
//Fire a function after doc saved in DB MONGOOSE HOOKS EXAMPLE IF TO BE USED LATER
/**
userSchema.post('save', function(doc, next) {
    //Sends that the user has been saved to the console after the save event has happened in the database
    //console.log('New user has been saved!')
    
    next();
})
*/

//Fire a function BEFORE doc saved to DB
userSchema.pre('save', async function(next) {
    //this object refers to json to be saved into database
    //console.log('user about to be created and saved', this)
    //Use bcrypt as salt to hash
    const salt = await bcrypt.genSalt(); //genSalt() generates salt function that's async
    //hash(password signging up with, the salt)
    this.password = await bcrypt.hash(this.password, salt) //this refers to instance to user trying to create
    
    //Now the password to be saved will be hashed!
    next();
})

//Static method to login the user statics.whateveritscalledmethod
userSchema.statics.login = async function(email, password) {
    //this refers to user model use findOne to find a record of it
    const user = await this.findOne({ email })

    //Check if we have a user
    if (user) {
        //Need to compare passwords if it exists (need to compare the hashed password to the hashed version of whats entered for the password; use bcrypt again)
        const auth = await bcrypt.compare(password, user.password) //bcrypt hashes the first one for us to compare
        
        //If this has been a success then return the user to log them in
        if (auth) {
            return user
        }
        throw Error('incorrect password') //If the above was wrong we got a wrong password
    }
    throw Error('incorrect email') //If it doesn't exist throw an error!
}

//Save Skill method for saving a skill a user enters to the database
userSchema.statics.saveSkill = async function(skill, userEmail) {
    await this.findOneAndUpdate ({
        email: userEmail.trim()
	}, {
		$push: { //Use $push MongoDB function to push the password to the array
			userSkills: skill
		}
	}) 
}

userSchema.statics.AdminC = async function(userEmail, userStatus) {
    //this refers to user model use findOne to find a record of it
    const user = await this.userStatus

    //Check if we have a user
    if (user.userStatus === 'Admin') {
        return true
    } else {
        return false
    }

}

//Create a model based on this schema above
const User = mongoose.model('user', userSchema); //Must be singular of whatever we called our database for this, we called it 'users' (mongoose ploralizes it!)

//Export model to be used somewhere else like in the controllers to interact with the database
module.exports = User; //Allows us to require this somewhere else, so we can use it outside of this file