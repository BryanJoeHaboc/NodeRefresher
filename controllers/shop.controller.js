const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const e = require("express");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const ITEM_PER_PAGE = 1;

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

const throwAnError = (errorMessage, statusCode) => {
  let error = {};
  errorMessage
    ? (error = new Error(errorMessage))
    : (error = new Error("Server Error"));

  if (statusCode) error.statusCode = statusCode;
  throw error;
};

//----------------------------------------------------CONTROLLERS----------------------------------------------

const getProductsPage = async (req, res, next) => {
  const page = parseInt(req.query.page || 1);
  const offset = ITEM_PER_PAGE * (page - 1);

  try {
    const products = await Product
      .findAndCountAll
      //   {
      //   limit: ITEM_PER_PAGE,
      //   offset,
      // }
      ();
    if (!products) {
      const error = new Error("No products found");
      error.statusCode = 404;
      throw error;
    }

    const collections = [];
    const titles = [];

    // products.rows.forEach((product) => {
    //   const prodTitle = product.title;
    //   const index = titles.findIndex((title) => title === prodTitle);

    //   if (index < 0) {
    //     titles.push(prodTitle);
    //     collections[titles.length - 1] = {
    //       _id: titles.length,
    //       title: prodTitle,
    //       routeName: prodTitle.toLowerCase(),
    //       items: [],
    //     };

    //     collections[titles.length - 1].items.push(product);
    //   } else {
    //     collections[index].items.push(product);
    //   }
    // });

    res.send(products);
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getCartPage = async (req, res, next) => {
  try {
    const currentUser = await User.findByPk(req.userId);

    if (!currentUser) {
      const error = new Error("Invalid User");
      error.statusCode = 404;
      throw error;
    }

    const cart = await currentUser.getCart();

    if (!cart) {
      const error = new Error("Server Error. Please try again");
      throw error;
    }

    const products = await cart.getProducts();
    res.json({ items: products });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postCart = async (req, res, next) => {
  try {
    const productId = req.body.item._id;
    let newQuantity = 1;

    const currentUser = await User.findByPk(req.userId);

    if (!currentUser) {
      const error = new Error("Invalid User");
      error.statusCode = 404;
      throw error;
    }

    const cart = await currentUser.getCart();

    if (!cart) {
      const error = new Error("Server Error, please try again");
      throw error;
    }

    const products = await cart.getProducts({ where: { _id: productId } });

    let product;
    if (products.length > 0) {
      product = products[0];
    }

    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
    } else {
      product = await Product.findByPk(productId);
    }

    await cart.addProduct(product, {
      through: { quantity: newQuantity },
    });

    res.status(201).send({ message: "Successfully added item to cart" });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postCheckout = async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const singleProd = req.body.product;
    const currentUser = await User.findByPk(req.userId);

    if (!currentUser) {
      throwAnError("User not found", 404);
    }

    console.log("currentUser", currentUser);

    const cart = await currentUser.getCart();

    if (!cart) {
      throwAnError();
    }

    const products = await cart.getProducts();

    if (!products.length) {
      throwAnError("Product not found", 404);
    }

    const order = await currentUser.createOrder();

    if (singleProd) {
      const checkOutSingleProd = products.filter(
        (prod) => prod._id === singleProd._id
      );
      console.log(
        "checkOutSingleProd",
        checkOutSingleProd[0].dataValues.cartItem.dataValues
      );
      checkOutSingleProd[0].orderItem = {
        quantity: checkOutSingleProd[0].dataValues.cartItem.dataValues.quantity,
      };
      await cart.setProducts(
        products.filter((prod) => prod._id !== singleProd._id)
      );
      await order.addProduct(checkOutSingleProd);
    } else {
      await order.addProducts(
        products.map((product) => {
          console.log("product", product);
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })
      );
      await cart.setProducts(null);
    }

    res.send({ message: "Order succeeded" });
  } catch (error) {
    passToErrorMiddleware(error, next);
  }
};

// const getCheckoutPage = (req, res, next) => {
//    const currentUser = User.findByPk(req.userId);
//   let totalPrice = 0;
//   let fetchedProducts = 0;
//   currentUser
//     .getCart()
//     .then((cart) => {
//       return cart
//         .getProducts()
//         .then((products) => {
//           fetchedProducts = products;
//           products.forEach(
//             (p) => (totalPrice += p.cartItem.quantity * p.price)
//           );

//           return stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: products.map((p) => {
//               return {
//                 name: p.title,
//                 description: p.description,
//                 amount: p.price * 100,
//                 currency: "usd",
//                 quantity: p.cartItem.quantity,
//               };
//             }),
//             success_url:
//               req.protocol + "://" + req.get("host") + "/checkout/sucess",
//             cancel_url:
//               req.protocol + "://" + req.get("host") + "/checkout/cancel",
//           });
//         })
//         .then((session) => {
//           res.render("shop/checkout", {
//             pageTitle: "My Checkout",
//             path: "/checkout",
//             products: fetchedProducts,
//             totalPrice,
//             sessionId: session.id,
//           });
//         })
//         .catch((err) => {
//           const error = new Error(err);
//           error.httpsStatusCode = 500;
//           return next(error);
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpsStatusCode = 500;
//       return next(error);
//     });
// };

const getOrderPage = async (req, res, next) => {
  const currentUser = await User.findByPk(req.userId);

  try {
    const orders = await currentUser.getOrders({ include: ["products"] });

    if (!orders) {
      const error = new Error("No Orders available");
      error.statusCode = 404;
      throw error;
    }
    res.send({ orders });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getProductPage = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.send({ product });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.item._id;

    const currentUser = await User.findByPk(req.userId);

    if (!currentUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const cart = await currentUser.getCart();

    if (!cart) {
      const error = new Error("Server error");
      throw error;
    }

    const products = await cart.getProducts({ where: { _id: prodId } });

    if (!products) {
      const error = new Error("No product found!");
      error.statusCode = 404;
      throw error;
    }
    const product = products[0];

    await product.cartItem.destroy();

    res.status(200).json({ message: "Cart Item deleted" });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postOrder = async (req, res) => {
  let fetchedCart;
  const currentUser = User.findByPk(req.userId);

  try {
    const cart = await currentUser.getCart();

    if (!cart) {
      const error = new Error("Server error");
      throw error;
    }

    const products = await cart.getProducts();

    if (!products) {
      const error = new Error("No product found!");
      error.statusCode = 404;
      throw error;
    }

    const order = await currentUser.createOrder();

    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );

    await fetchedCart.setProducts(null);

    res.send({ message: "Order succeeded" });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postSubtractCart = async (req, res, next) => {
  try {
    const prodId = req.body.item._id;

    const currentUser = await User.findByPk(req.userId);

    if (!currentUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const cart = await currentUser.getCart();
    const product = await cart.getProducts({ where: { _id: prodId } });

    const cartItem = product[0].cartItem;
    let { quantity } = product[0].cartItem;
    if (quantity === 1) {
      await product[0].cartItem.destroy();
      res.status(201).send({ message: "Item deleted" });
    } else {
      quantity = quantity - 1;
      cartItem.quantity = quantity;
      await cart.addProduct(product, {
        through: { quantity: cartItem.quantity },
      });
      res.status(201).send({ message: "Item subtracted" });
    }
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      const error = new Error("No order found");
      error.statusCode = 404;
      throw error;
    }

    if (order.dataValues.userId !== req.userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    const products = await order.getProducts();

    if (!products) {
      const error = new Error("Server Error");
      throw error;
    }

    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(25).text("Invoice", { underline: true });
    pdfDoc.text("--------------------------------");
    let totalPrice = 0;
    console.log(products[0].dataValues.orderItem);
    products.forEach((product) => {
      totalPrice = totalPrice + product.orderItem.quantity * product.price;
      pdfDoc
        .fontSize(14)
        .text(
          product.title +
            " - " +
            product.orderItem.quantity +
            " x " +
            "$" +
            product.price
        );
    });
    pdfDoc.text("--------------------------------");
    pdfDoc.fontSize(20).text("Total Price: " + "$" + totalPrice);
    pdfDoc.end();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline: filename="' + invoiceName + '"'
    );
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

module.exports = {
  getProductsPage,
  getCartPage,
  postCart,
  getOrderPage,
  getProductPage,
  postCartDeleteProduct,
  postSubtractCart,
  getInvoice,
  postCheckout,
};
