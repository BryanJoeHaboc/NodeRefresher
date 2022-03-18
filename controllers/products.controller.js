const Product = require("../models/product.model");

exports.getAddProductPage = (req, res, next) => {
  res.render("add-product", {
    pageTitle: "Add Products",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
  });
};

exports.postAddProductPage = (req, res) => {
  const product = new Product(req.body);
  product.save();
  res.redirect("/");
};

exports.getProductsPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("shop", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
    });
  });
};
