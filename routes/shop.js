const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getIndexPage,
  getProductsPage,
  getOrderPage,
} = require("../controllers/shop.controller");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", getCartPage);

router.get("/products", getProductsPage);

router.get("/checkout", getCheckoutPage);

router.get("/orders", getOrderPage);

module.exports = router;
