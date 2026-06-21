const express = require('express')
const router = express.Router()

const user = require('../controllers/users')
const { requireAuth, requireMatchingUser } = require('../middleware/auth')

router.route('/')
    .post(user.createUser)

router.route('/:id')
    .get(requireAuth, requireMatchingUser, user.getUserById)
    .patch(requireAuth, requireMatchingUser, user.updateUser)

router.route('/:id/recommendations')
    .get(requireAuth, requireMatchingUser, user.getRecommendations)

module.exports = router
