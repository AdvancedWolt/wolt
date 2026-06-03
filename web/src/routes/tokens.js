const express = require('express')
var router = express.Router()

const tokens = require('../controllers/tokens')

router.route('/')
    .post(tokens.login)

module.exports = router
