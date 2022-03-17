const express = require("express");
const path = require("path");
const rootDir = require("../util/path");

const router = express.Router();

router.get("/add-product", (req, res) => {
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

router.post("/add-product", (req, res) => {
  const { body } = req;
  console.log(body);
  res.sendFile(path.join(rootDir, "views", "shop.html"));
});

module.exports = router;
