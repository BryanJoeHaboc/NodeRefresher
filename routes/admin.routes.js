const express = require("express");

const {
  postAddProductPage,
  postEditProduct,
  deleteProduct,
  postAddProducts,
  getAdminProducts,
} = require("../controllers/admin.controller");

const { checkIfAuthenticated } = require("../middleware/is-auth");

const {
  postAddProductValidator,
  postEditProductValidator,
} = require("../middleware/auth-validators");

const router = express.Router();

router.post(
  "/add-product",
  checkIfAuthenticated,
  postAddProductValidator,
  postAddProductPage
);

router.post(
  "/edit-product",
  checkIfAuthenticated,
  postEditProductValidator,
  postEditProduct
);

router.post("/products", checkIfAuthenticated, postAddProducts);

router.delete("/product/:productId", checkIfAuthenticated, deleteProduct);

router.get("/products/:userId", checkIfAuthenticated, getAdminProducts);

module.exports = {
  adminRoutes: router,
};
