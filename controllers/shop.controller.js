const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const path = require("path");
const fs = require("fs");

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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postCart = async (req, res) => {
  const productId = req.body.productId;

  let newQuantity = 1;

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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
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
      console.log(err);
      const error = new Error(err);
      error.httpsStatusCode = 500;
      return next(error);
    });
};

const postSubtractCart = (req, res, next) => {
  const prodId = req.body.productId;

  const currentUser = User.build(req.session.user);
  let fetchedCart = [];
  currentUser
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { _id: prodId } });
    })
    .then((product) => {
      const cartItem = product[0].cartItem;
      let { quantity } = product[0].cartItem;
      if (quantity === 1) {
        return product[0].cartItem.destroy();
      } else {
        quantity = quantity - 1;
      }
      cartItem.quantity = quantity;
      console.log(cartItem.quantity);
      return fetchedCart.addProduct(product, {
        through: { quantity: cartItem.quantity },
      });
    })
    .then((product) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

const getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findByPk(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (!order.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline: filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });

      const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline: filename="' + invoiceName + '"'
      );
      file.pipe(res);
    })

    .catch((err) => next(err));
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
  postSubtractCart,
  getInvoice,
};
