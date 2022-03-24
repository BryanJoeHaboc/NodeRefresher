const req = require("express/lib/request");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");

exports.getProductsPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

exports.getIndexPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCartPage = (req, res) => {
  res.render("shop/cart", { pageTitle: "My Cart", path: "/cart" });
};

exports.postCart = async (req, res) => {
  const productId = req.body.productId;
  const product = await Product.findById(productId);
  Cart.addProduct(productId, product[0].price);

  res.redirect("/cart");
};

exports.getCheckoutPage = (req, res) => {
  res.render("shop/checkout", { pageTitle: "My Checkout", path: "/checkout" });
};

exports.getOrderPage = (req, res) => {
  res.render("shop/orders", { pageTitle: "My Cart", path: "/cart" });
};

exports.getProductPage = async (req, res) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  res.render("shop/product-item", {
    pageTitle: product[0].title,
    product: product[0],
    path: "/products",
  });
};
