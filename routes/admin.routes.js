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
const { isAdmin } = require("../middleware/is-admin");

const router = express.Router();

router.post(
  "/add-product",
  checkIfAuthenticated,
  isAdmin,
  postAddProductValidator,
  postAddProductPage
);

router.post(
  "/edit-product",
  checkIfAuthenticated,
  isAdmin,
  postEditProductValidator,
  postEditProduct
);

router.post("/products", checkIfAuthenticated, isAdmin, postAddProducts);

router.delete(
  "/product/:productId",
  checkIfAuthenticated,
  isAdmin,
  deleteProduct
);

router.get(
  "/products/:userId",
  checkIfAuthenticated,
  isAdmin,
  getAdminProducts
);

module.exports = {
  adminRoutes: router,
};
