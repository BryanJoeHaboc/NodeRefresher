const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Hello bitches</h1>");
});

module.exports = router;
