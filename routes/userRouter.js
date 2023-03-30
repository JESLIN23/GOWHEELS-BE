const express = require('express')
const router = express.Router()

const { signup, login, resetPassword, forgotPassword } = require('../controllers/authController')
const {getAllUser, getUser, updateUser, createUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController')

router.post('/signup', signup)
router.post('/login', login)

router.post('/forgetPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)

router.route('/').get(getAllUser).post(createUser)
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser)

module.exports = router;