const express = require("express");

const {
  getAddProductPage,
  getProductsAdminPage,
  getEditProductPage,
  postAddProductPage,
  postEditProduct,
  deleteProduct,
} = require("../controllers/admin.controller");

const { checkIfAuthenticated } = require("../middleware/is-auth");

const {
  postAddProductValidator,
  postEditProductValidator,
} = require("../middleware/auth-validators");

const router = express.Router();

router.get("/add-product", checkIfAuthenticated, getAddProductPage);

router.post(
  "/add-product",
  checkIfAuthenticated,
  postAddProductValidator,
  postAddProductPage
);

router.get("/product-admin", checkIfAuthenticated, getProductsAdminPage);

router.get(
  "/edit-product/:productId&:editing",
  checkIfAuthenticated,
  getEditProductPage
);

router.post(
  "/edit-product",
  checkIfAuthenticated,
  postEditProductValidator,
  postEditProduct
);

router.delete("/product/:productId", checkIfAuthenticated, deleteProduct);

module.exports = {
  adminRoutes: router,
};
