const express = require("express");

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

const {
  postSignUpValidator,
  postLoginValidator,
} = require("../middleware/auth-validators");

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignUp);

router.post("/login", postLoginValidator, postLogin);

router.post("/signup", postSignUpValidator, postSignUp);

router.post("/logout", postLogout);

router.get("/reset", getResetPassword);

router.post("/reset", postResetPassword);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
