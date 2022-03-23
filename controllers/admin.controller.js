const Product = require("../models/product.model");

exports.getAddProductPage = (req, res, next) => {
  res.render("admin/add-product", {
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

exports.getProductsAdminPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("admin/product-admin", {
      prods: products,
      pageTitle: "Shop",
      path: "/admin/product-admin",
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
    });
  });
};
