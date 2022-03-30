const express = require("express");
const { getLogin, postLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", getLogin);

router.post("/login", postLogin);

module.exports = router;
