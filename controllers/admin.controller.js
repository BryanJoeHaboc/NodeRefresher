const Product = require("../models/product.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator/check");

const getAddProductPage = (req, res) => {
  console.log("add product page");
  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    product: { title: "", description: "", price: "" },
    oldInput: { title: "", description: "", price: "", imageUrl: "" },
    errorMessage: "",
    validationErrors: [],
  });
};

const postEditProduct = (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      errorMessage: errors.array()[0].msg,
      oldInput: { title, price, imageUrl, description },
      validationErrors: errors.array(),
    });
  }

  Product.findByPk(productId)
    .then((product) => {
      if (product.userId !== req.session.user._id) return res.redirect("/");

      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;

      return product.save().then(() => {
        console.log("updated product");
        res.redirect("/admin/product-admin");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getEditProductPage = async (req, res, next) => {
  const editMode = req.query.editing || req.params.editing;
  const prodId = req.params.productId;

  if (!editMode) {
    return res.redirect("/");
  }

  const currentUser = User.build(req.session.user);

  currentUser
    .getProducts({ where: { _id: prodId } })
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/eadd-product",
        editing: true,
        hasError: false,
        errorMessage: "",
        product,
        oldInput: { title: "", price: "", imageUrl: "", description: "" },
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postAddProductPage = (req, res, next) => {
  req.body._id = null;
  const { title, imageUrl, description, price } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: { title, price, imageUrl, description },
      errorMessage: errors.array()[0].msg,
      oldInput: { title, price, imageUrl, description },
      validationErrors: errors.array(),
    });
  }

  const currentUser = User.build(req.session.user);

  currentUser
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    })
    .then(() => res.redirect("/admin/product-admin"))
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getProductsAdminPage = (req, res) => {
  const currentUser = User.build(req.session.user);

  currentUser.getProducts().then((products) => {
    res.render("admin/product-admin", {
      prods: products,
      pageTitle: "Shop",
      path: "/admin/product-admin",
      hasProducts: products.length > 0,
      editing: true,
    });
  });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  console.log(productId);

  Product.findByPk(productId)
    .then((product) => {
      if (product.userId !== req.session.user._id) return res.redirect("/");
      else
        return product.destroy().then(() => {
          console.log("Product deleted");
          res.redirect("/admin/product-admin");
        });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

module.exports = {
  getAddProductPage,
  postEditProduct,
  getEditProductPage,
  postAddProductPage,
  getProductsAdminPage,
  deleteProduct,
};
