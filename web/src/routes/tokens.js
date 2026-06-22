const express = require('express')
const router = express.Router()

const tokens = require('../controllers/tokens')

router.route('/')
    .post(tokens.login)

module.exports = router
