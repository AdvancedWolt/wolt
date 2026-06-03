const express = require('express')
var router = express.Router()

const user = require('../controllers/users')
const { requireAuth, requireMatchingUser } = require('../middleware/auth')

router.route('/')
    .post(user.createUser)

router.route('/:id')
    .get(requireAuth, requireMatchingUser, user.getUserById)

router.route('/:id/recommendations')
    .get(requireAuth, requireMatchingUser, user.getRecommendations)

module.exports = router
