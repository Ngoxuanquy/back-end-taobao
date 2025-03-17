const { NotFoundError } = require("../core/error.response");
const usersModel = require("../models/users.model");
const { getInfoData } = require("../utils");

class UserService {
 

  static async getAllgetAllUsers({ userId }) {
    try {
      const users = await usersModel.findById(userId).lean();
      console.log(users);
      if (!users) {
        throw new NotFoundError("users not found"); // Throw error if address not found
      }

      return getInfoData(["address", "name", "number", "moneys"], users);
    } catch (error) {
      return { error: "Failed to fetch users" };
    }
  }

  
}


module.exports = UserService;