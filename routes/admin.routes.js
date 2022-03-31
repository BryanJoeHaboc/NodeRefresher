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

const router = express.Router();

router.get("/add-product", checkIfAuthenticated, getAddProductPage);

router.post("/add-product", checkIfAuthenticated, postAddProductPage);

router.get("/product-admin", checkIfAuthenticated, getProductsAdminPage);

router.get(
  "/edit-product/:productId&:editing",
  checkIfAuthenticated,
  getEditProductPage
);

router.post("/edit-product", checkIfAuthenticated, postEditProduct);

router.post("/delete-product", checkIfAuthenticated, deleteProduct);

module.exports = {
  adminRoutes: router,
};
