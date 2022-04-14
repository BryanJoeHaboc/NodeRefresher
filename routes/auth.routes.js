const express = require("express");

const {
  postLogin,
  postLogout,
  postSignUp,
  postResetPassword,
  postNewPassword,
} = require("../controllers/auth.controller");

const {
  postSignUpValidator,
  postLoginValidator,
} = require("../middleware/auth-validators");

const router = express.Router();

router.post("/login", postLoginValidator, postLogin);
router.post("/signup", postSignUpValidator, postSignUp);
// router.post("/logout", postLogout);
router.post("/reset", postResetPassword);
router.post("/new-password", postNewPassword);

module.exports = router;
