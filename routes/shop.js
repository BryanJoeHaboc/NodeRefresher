const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getIndexPage,
  getProductsPage,
} = require("../controllers/shop.controller");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", getCartPage);

router.get("/products", getProductsPage);

router.get("/checkout", getCheckoutPage);

module.exports = router;
