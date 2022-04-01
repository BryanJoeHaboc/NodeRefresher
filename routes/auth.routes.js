const express = require("express");
const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getResetPassword,
  postResetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignUp);

router.post("/login", postLogin);

router.post("/signup", postSignUp);

router.post("/logout", postLogout);

router.get("/reset", getResetPassword);

router.post("/reset", postResetPassword);

module.exports = router;
