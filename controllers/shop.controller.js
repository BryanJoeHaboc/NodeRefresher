const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");

const getProductsPage = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getIndexPage = (req, res) => {
  Product.findAll()
    .then((products) => {
      // console.log("req.session", req.session);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getCartPage = async (req, res) => {
  const currentUser = User.build(req.session.user);
  currentUser
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            pageTitle: "My Cart",
            path: "/cart",
            products: products,
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpsStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postCart = async (req, res) => {
  const productId = req.body.productId;

  const currentUser = User.build(req.session.user);
  currentUser
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { _id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getCheckoutPage = (req, res) => {
  res.render("shop/checkout", {
    pageTitle: "My Checkout",
    path: "/checkout",
  });
};

const getOrderPage = (req, res) => {
  const currentUser = User.build(req.session.user);

  currentUser
    .getOrders({ include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "My Orders",
        path: "/orders",
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const getProductPage = (req, res) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
    .then((product) => {
      res.render("shop/product-item", {
        pageTitle: product.title,
        product: product,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postCartDeleteProduct = async (req, res) => {
  const prodId = req.body.productId;

  const currentUser = User.build(req.session.user);

  currentUser
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { _id: prodId } });
    })
    .then((products) => {
      console.log(products);
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postOrder = (req, res) => {
  let fetchedCart;
  const currentUser = User.build(req.session.user);

  currentUser
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return currentUser.createOrder().then((order) => {
        return order.addProducts(
          products.map((product) => {
            product.orderItem = { quantity: product.cartItem.quantity };
            return product;
          })
        );
      });
    })
    .then((result) => {
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

module.exports = {
  getProductsPage,
  getIndexPage,
  getCartPage,
  postCart,
  getCheckoutPage,
  getOrderPage,
  getProductPage,
  postCartDeleteProduct,
  postOrder,
};
