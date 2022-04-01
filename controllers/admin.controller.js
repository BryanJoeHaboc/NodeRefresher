const Product = require("../models/product.model");
const User = require("../models/user.model");

exports.getAddProductPage = (req, res) => {
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
    .catch((err) => console.log(err));
};

exports.getEditProductPage = async (req, res, next) => {
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
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddProductPage = (req, res) => {
  req.body._id = null;
  const { title, imageUrl, description, price } = req.body;

  const currentUser = User.build(req.session.user);

  currentUser
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    })
    .then(() => res.redirect("/admin/product-admin"))
    .catch((err) => console.log(err));
};

exports.getProductsAdminPage = (req, res) => {
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

exports.deleteProduct = async (req, res) => {
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

    .catch((err) => console.log(err));
};
