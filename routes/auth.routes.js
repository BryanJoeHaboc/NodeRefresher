const express = require("express");
const { getLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", getLogin);

module.exports = router;
