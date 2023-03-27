const express = require('express')
const router = express.Router()

const { signup, login } = require('../controllers/authController')
const {getAllUser, getUser, updateUser, createUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController')

router.post('/signup', signup)
router.post('/login', login)
router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)

router.route('/').get(getAllUser).post(createUser)
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser)

module.exports = router;