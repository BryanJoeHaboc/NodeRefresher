const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getProductsPage,
  getOrderPage,
  getProductPage,
  postCart,
  postSubtractCart,
  postCartDeleteProduct,
  postOrder,
  getInvoice,
  postCheckout,
} = require("../controllers/shop.controller");

const { checkIfAuthenticated } = require("../middleware/is-auth");

const router = express.Router();

router.get("/cart", checkIfAuthenticated, getCartPage);

router.post("/cart", checkIfAuthenticated, postCart);

router.delete("/cart", checkIfAuthenticated, postCartDeleteProduct);

router.post("/subtract-cart", checkIfAuthenticated, postSubtractCart);

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductPage);

router.post("/checkout/success", checkIfAuthenticated, postCheckout);
// router.get("/checkout/cancel", checkIfAuthenticated, getCheckoutPage);
router.get("/orders", checkIfAuthenticated, getOrderPage);

router.get("/orders/:orderId", checkIfAuthenticated, getInvoice);

module.exports = router;
