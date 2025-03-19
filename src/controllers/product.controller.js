const { SuccessResponse } = require('../core/success.response');
// const ProductService = require('../services/product.service')
const ProductService = require('../services/product.service');

class ProductController {
  createProduct = async (req, res, next) => {
    console.log({ body: req.body });
    new SuccessResponse({
      message: 'Create new product success',
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.userId,
      }),
    }).send(res);
  };

  getproductAll = async (req, res, next) => {
    console.log('anc');
    new SuccessResponse({
      message: 'publicProductByShop success',
      metadata: await ProductService.getproductAll(),
    }).send(res);
  };
}

module.exports = new ProductController();
