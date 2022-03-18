const express = require("express");

const {
  getAddProductPage,
  postAddProductPage,
} = require("../controllers/products.controller");

const router = express.Router();

router.get("/add-product", getAddProductPage);

router.post("/add-product", postAddProductPage);

module.exports = {
  adminRoutes: router,
};
