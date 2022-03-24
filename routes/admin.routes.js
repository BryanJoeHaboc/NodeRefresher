const express = require("express");

const {
  getAddProductPage,
  getProductsAdminPage,
  getEditProductPage,
  postAddProductPage,
  postEditProduct,
  deleteProduct,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/add-product", getAddProductPage);

router.post("/add-product", postAddProductPage);

router.get("/product-admin", getProductsAdminPage);

router.get("/edit-product/:productId&:editing", getEditProductPage);

router.post("/edit-product", postEditProduct);

router.post("/delete-product", deleteProduct);

module.exports = {
  adminRoutes: router,
};
