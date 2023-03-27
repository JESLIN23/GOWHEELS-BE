const User = require('../models/userModal')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')

const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({ 
        firstName: req.body.firstName, 
        secondName: req.body.secondName,
        email: req.body.email,
        gender: req.body.gender,
        date_of_birth: req.body.date_of_birth,
        phone: req.body.phone,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        photo: req.body.photo
    })

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN})

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if ( !email || !password ) {
        return new AppError('Please provide valid email and password', 400)
    }

    const token = ''
    res.status(200).json({
        status: 'success',
        token
    })

})

module.exports = {
    signup,
    login

}