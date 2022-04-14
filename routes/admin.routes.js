const express = require("express");

const {
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

router.delete("/product/:productId", checkIfAuthenticated, deleteProduct);

module.exports = {
  adminRoutes: router,
};
