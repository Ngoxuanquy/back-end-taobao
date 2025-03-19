const { Types } = require('mongoose');
const Fuse = require('fuse.js');
const {
  product,
  clothing,
  electronic,
  furniture,
} = require('../product.model');
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb,
} = require('../../utils');
const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
  // Lấy tất cả các sản phẩm đã được xuất bản
  const allProducts = await product.find().lean();

  console.log(allProducts);

  // Cấu hình Fuse.js
  const options = {
    includeScore: true,
    keys: ['product_name'],
  };

  const fuse = new Fuse(allProducts, options);
  const result = fuse.search(keySearch);

  // Trả về danh sách các sản phẩm phù hợp
  return result.map((item) => item.item);
};

const updateQuantity = async (payload) => {
  try {
    console.log(payload);
    const results = [];
    for (const item of payload) {
      const filter = { _id: item.id };
      const update = { $inc: { product_quantity: item.quantity } };
      const options = { upsert: false }; // upsert: false nghĩa là không chèn tài liệu mới nếu không tìm thấy tài liệu phù hợp

      const result = await product.updateOne(filter, update, options);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Error updating quantities:', error);
    throw error;
  }
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  const products = product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect = ['__v'] }) => {
  return product.findById(product_id).select(unGetSelectData(unSelect));
};

const getProductById = async (productId) => {
  return await product
    .findOne({ _id: convertToObjectIdMongodb(productId) })
    .lean();
};

const deleteProductById = async (productId) => {
  console.log(productId.productId);
  // return await product.deleteOne({ _id: convertToObjectIdMongodb(productId) }).lean()
  try {
    const result = await product.deleteOne({ _id: productId.productId }).lean();
    console.log(result); // Optional: Print the result to the console
    return result;
  } catch (error) {
    console.error(error);
    // Handle the error accordingly
  }
};

const getProductAll = async () => {
  try {
    const products = await product.find({}).lean();
    console.log(products);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.update(foundShop);

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.update(foundShop);

  return modifiedCount;
};

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  getProductAll,
  deleteProductById,
  updateQuantity,
};
