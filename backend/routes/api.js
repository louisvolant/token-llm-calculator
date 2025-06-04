// routes/api.js
const express = require('express');
const router = express.Router();

router.use(require('./tokenize_api'));
router.use(require('./minify_api'));
router.use(require('./csrf_api'));

module.exports = router;