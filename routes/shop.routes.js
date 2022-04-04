const express = require("express");

const {
  getCartPage,
  getCheckoutPage,
  getIndexPage,
  getProductsPage,
  getOrderPage,
  getProductPage,
  postCart,
  postSubtractCart,
  postCartDeleteProduct,
  postOrder,
  getInvoice,
} = require("../controllers/shop.controller");

const { checkIfAuthenticated } = require("../middleware/is-auth");

const router = express.Router();
router.get("/", getIndexPage);

router.get("/cart", checkIfAuthenticated, getCartPage);

router.post("/cart", checkIfAuthenticated, postCart);

router.post("/subtract-cart", checkIfAuthenticated, postSubtractCart);

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductPage);

router.post("/cart-delete-item", checkIfAuthenticated, postCartDeleteProduct);

router.post("/create-order", checkIfAuthenticated, postOrder);

router.get("/checkout", checkIfAuthenticated, getCheckoutPage);

router.get("/orders", checkIfAuthenticated, getOrderPage);

router.get("/orders/:orderId", checkIfAuthenticated, getInvoice);

module.exports = router;
