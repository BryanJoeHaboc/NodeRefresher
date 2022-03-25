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
} = require("../controllers/shop.controller");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", getCartPage);

router.post("/cart", postCart);

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductPage);

router.post("/cart-delete-item", postCartDeleteProduct);

router.get("/checkout", getCheckoutPage);

router.get("/orders", getOrderPage);

module.exports = router;
