const express = require("express");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandle");

const router = express.Router();

router.get("/get_roles/:userId", asyncHandler(accessController.getRoles));

router.post("/signup", asyncHandler(accessController.signUp));
router.post("/loginFB_GG", asyncHandler(accessController.loginFB_GG));
router.post("/login", asyncHandler(accessController.login));
router.post("/verifile", asyncHandler(accessController.verifile));

router.post("/forgot_password", asyncHandler(accessController.forgotPassword));
router.post("/resert_password", asyncHandler(accessController.ResetPasswords));

router.post("/update_verify/:id", asyncHandler(accessController.updateVerify));
router.post(
  "/updateCountMessage",
  asyncHandler(accessController.updateCountMessage)
);

router.post("/update_roles", asyncHandler(accessController.updateRoles));

// authentication

router.use(authenticationV2);

router.post("/logout", asyncHandler(accessController.logout));
router.post(
  "/handleRefreshToken",
  asyncHandler(accessController.handleRefreshToken)
);

module.exports = router;