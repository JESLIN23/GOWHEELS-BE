const express = require('express')
const router = express.Router()

const {getAllUser, getUser, updateUser, createUser, deleteUser, updateMe, deleteMe} = require('../controllers/userController')

router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)
router.route('/').get(getAllUser).post(createUser)
router.route('/:id').get(getUser).delete(deleteUser).patch(updateUser)

module.exports = router;