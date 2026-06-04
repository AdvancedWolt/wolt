const express = require('express')
const router = express.Router()
const search = require('../controllers/search')

router.route('/:query')
    .get(search.searchByQuery)

module.exports = router
