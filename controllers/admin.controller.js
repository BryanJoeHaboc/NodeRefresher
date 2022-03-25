const { redirect } = require("express/lib/response");
const Product = require("../models/product.model");

exports.getAddProductPage = (req, res, next) => {
  console.log("add product page");
  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
  });
};

exports.postEditProduct = (req, res) => {
  const { productId, title, price, imageUrl, description } = req.body;

  const updatedProduct = new Product({
    _id: productId,
    title,
    price,
    imageUrl,
    description,
  });

  updatedProduct.save();

  res.redirect("/products");
};

exports.getEditProductPage = async (req, res, next) => {
  const editMode = req.query.editing || req.params.editing;
  const prodId = req.params.productId;

  if (!editMode) {
    return res.redirect("/");
  }

  const product = await Product.findById(prodId);

  if (!product) {
    return res.redirect("/");
  }

  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: editMode,
    product: product[0],
  });
};

exports.postAddProductPage = (req, res) => {
  req.body._id = null;
  const product = new Product(req.body);
  product
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
};

exports.getProductsAdminPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("admin/product-admin", {
      prods: products,
      pageTitle: "Shop",
      path: "/admin/product-admin",
      hasProducts: products.length > 0,
      editing: true,
    });
  });
};

exports.deleteProduct = async (req, res) => {
  const productId = req.body.productId;
  console.log(productId);

  const deletedProduct = await Product.deleteById(productId);
  console.log("deletedProduct", deletedProduct);

  res.redirect("/admin/product-admin");
};
