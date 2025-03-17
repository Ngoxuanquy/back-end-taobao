const usersModel = require("../models/users.model")

const findByEmail = async ({
    email,
    select = { email: 1, password: 1, name: 1, status: 1, roles: 1 },
}) => {
    return await usersModel.findOne({ email }).select(select).lean()
}

module.exports = { findByEmail }