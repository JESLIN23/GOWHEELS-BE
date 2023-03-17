const mongoose = require('mongoose')
const validator = require('validator')

const userSchena = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please tell us your first name!'],
        trim: true,
        minLength: [3, 'First name should contain atleast 3 charactor'],
        maxLength: [30, 'First name should have lessthan 30 charactor']
    },
    secondName: {
        type: String,
        required: [true, 'Please tell us your second name!'],
        trim: true,
        minLength: [1, 'Second name should contain atleast 1 charactor'],
        maxLength: [30, 'Second name should have lessthan 30 charactor']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        unique: [true, 'This email is already using. Please try another'],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    gender: {
        type: String,
        trim: true,
        enum: {values: [male, female, other], message: 'Please provide a valid gender'}
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Please tell us your age'],
        validate: {
            validator: function(val) {
                return 
            }
        }
    },
    phone: {
        type: Number,
        required: [true, 'Please provide your phone number'],
        trim: true,
        unique: [true, 'This phone number is already used. Please try another'],
        validate: {
            validator: function(val) {
                return val.length === 10;
            },
            message: 'Phone number is not valid'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [8, 'Password should contain atleast 8 charactor'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(val) {
                return val === this.password
            },
            message: 'Passwords are not same'
        },
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }

})

const User = mongoose.model('User', userSchena)

module.exports = User