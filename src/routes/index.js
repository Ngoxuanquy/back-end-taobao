const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth');

const router = express.Router();

router.use(apiKey);
router.use(permission('0000'));

router.use('/v1/api/shop', require('./access'));
router.use('/v1/api/users', require('./users'));
router.use('/v1/api/product', require('./product'));

module.exports = router;
