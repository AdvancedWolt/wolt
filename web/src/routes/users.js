const express = require('express')
var router = express.Router()

const user = require('../controllers/users')

router.route('/')
    .get(user.getAllUsers)
    .post(user.createUser)

router.route('/:id')
    .get(user.getUserById)
    .patch(user.updateUser)
    .delete(user.deleteUser)

router.route('/:id/views')
    .post(user.addView)

router.route('/:id/views/:productId')
    .delete(user.removeView)

router.route('/:id/recommendations')
    .get(user.getRecommendations)


module.exports = router
