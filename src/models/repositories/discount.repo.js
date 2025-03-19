const { getSelectData, unGetSelectData } = require('../../utils');
const discountModel = require('../discount.model');

const checkDiscountExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean();
};

const updateDiscountById = async ({ discountId, bodyUpdate, isNew = true }) => {
  return await discountModel.findOneAndUpdate(discountId, bodyUpdate, {
    new: isNew,
  });
};

const findAllDiscountCodeSelect = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  const documents = model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return documents;
};

const findAllDiscountCodeUnSelect = async () => {
  const skip = (page - 1) * 50;
  const documents = model
    .find()
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();

  return documents;
};

module.exports = {
  checkDiscountExists,
  findAllDiscountCodeUnSelect,
  findAllDiscountCodeSelect,
  updateDiscountById,
};
