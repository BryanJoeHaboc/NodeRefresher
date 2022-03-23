const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getIndexPage,
  getProductsPage,
  getOrderPage,
  getProductPage,
  postCart,
} = require("../controllers/shop.controller");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", getCartPage);

router.post("/cart", postCart);

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductPage);

router.get("/checkout", getCheckoutPage);

router.get("/orders", getOrderPage);

module.exports = router;
