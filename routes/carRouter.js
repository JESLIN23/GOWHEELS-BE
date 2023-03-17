const express = require('express')
const router = express.Router()

const { getCar, getAllCar, updateCar, createCar, deleteCar } = require('../controllers/carController')

router.route('/').get(getAllCar).post(createCar)
router.route('/:id').get(getCar).delete(deleteCar).patch(updateCar)

module.exports = router
