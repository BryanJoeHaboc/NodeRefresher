const Product = require("../models/product.model");

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

exports.getCheckoutPage = (req, res) => {
  res.render("shop/checkout", { pageTitle: "My Checkout", path: "/checkout" });
};
