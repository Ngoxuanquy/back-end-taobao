const express = require('express');
const { authenticationV2 } = require('../../auth/authUtils');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../helpers/asyncHandle');

const router = express.Router();

router.get('/getAll', asyncHandler(productController.getproductAll));

router.get('/getDetail/:product_id', asyncHandler(productController.getDetailProductById));

router.post('/', asyncHandler(productController.createProduct));

module.exports = router;
