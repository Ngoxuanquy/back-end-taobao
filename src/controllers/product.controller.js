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
    new SuccessResponse({
      message: 'publicProductByShop success',
      metadata: await ProductService.getproductAll(),
    }).send(res);
  };

  getDetailProductById = async (req, res, next) => {
    console.log("a111111111111")
     new SuccessResponse({
      message: 'get detail success',
      metadata: await ProductService.getDetailProductById(req.params),
    }).send(res);
  
  };
 
}

module.exports = new ProductController();
