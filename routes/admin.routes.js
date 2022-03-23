const express = require("express");

const {
  getAddProductPage,
  postAddProductPage,
  getProductsAdminPage,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/add-product", getAddProductPage);

router.post("/add-product", postAddProductPage);

router.get("/product-admin", getProductsAdminPage);

router.get("/product-admin", getProductsAdminPage);

module.exports = {
  adminRoutes: router,
};
