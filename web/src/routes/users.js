const express = require('express')
var router = express.Router()

const user = require('../controllers/users')

router.route('/')
    .post(user.createUser)

router.route('/:id')
    .get(user.getUserById)

router.route('/:id/recommendations')
    .get(user.getRecommendations)


module.exports = router
