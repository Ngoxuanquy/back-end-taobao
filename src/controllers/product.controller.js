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

  getDetailProductById = async (req, res, next) => {
    try {
      const { product_id } = req.params;
      if (!product_id) {
        return res.status(400).json({ message: 'Product ID không hợp lệ' });
      }
      const productDetail = await ProductService.getproductById({ product_id });
      if (!productDetail) {
        return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
      }

      return new SuccessResponse({
        message: 'Success',
        metadata: productDetail,
      }).send(res);
    } catch (error) {
      console.error('Error getting product detail:', error);
      return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
    }
  };
 
}

module.exports = new ProductController();
