const Product = require("../models/product.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const deleteFile = require("../util/file");

const getAddProductPage = (req, res) => {
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
  const { productId, title, price, description } = req.body;

  const image = req.file;
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

      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(() => {
        console.log("updated product");
        res.redirect("/admin/product-admin");
      });
    })
    .catch((err) => {
      console.log(err);
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
      console.log(err);
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postAddProductPage = (req, res, next) => {
  req.body._id = null;
  const { title, description, price } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: { title, price, description },
      errorMessage: "Attached file is not an image",
      oldInput: { title, price, description },
      validationErrors: [],
    });
  }

  const imageUrl = image.path;

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
      console.log("error at postAddProduct", err);
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
          deleteFile(product.imageUrl);
          res.redirect("/admin/product-admin");
        });
    })

    .catch((err) => {
      console.log(err);
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
