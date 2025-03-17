const { SuccessResponse } = require("../core/success.response");
const UserService = require("../services/users.service");

class UserController {
  
  static async getAllUsers(req, res, next) {
    console.log(req.params);
    new SuccessResponse({
      message: "getList user success",
      metadata: await UserService.getAllUsers(req.params),
    }).send(res);
  }
}

module.exports = UserController;