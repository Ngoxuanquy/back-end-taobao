const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const UserController = require("../../controllers/users.controller");
const asyncHandler = require("../../helpers/asyncHandle");

const router = express.Router();


router.use(authenticationV2);

router.get("/", asyncHandler(UserController.getAllUsers));

module.exports = router;