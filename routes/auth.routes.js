const express = require("express");
const { check } = require("express-validator/check");

const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
} = require("../controllers/auth.controller");
const { postSignUpValidator } = require("../middleware/auth-validators");

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignUp);

router.post("/login", postLogin);

router.post("/signup", postSignUpValidator, postSignUp);

router.post("/logout", postLogout);

router.get("/reset", getResetPassword);

router.post("/reset", postResetPassword);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
