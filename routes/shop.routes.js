const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getIndexPage,
  getProductsPage,
  getOrderPage,
  getProductPage,
  postCart,
  postCartDeleteProduct,
  postOrder,
} = require("../controllers/shop.controller");

const { checkIfAuthenticated } = require("../middleware/is-auth");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", checkIfAuthenticated, getCartPage);

router.post("/cart", checkIfAuthenticated, postCart);

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductPage);

router.post("/cart-delete-item", checkIfAuthenticated, postCartDeleteProduct);

router.post("/create-order", checkIfAuthenticated, postOrder);

router.get("/checkout", checkIfAuthenticated, getCheckoutPage);

router.get("/orders", checkIfAuthenticated, getOrderPage);

module.exports = router;
