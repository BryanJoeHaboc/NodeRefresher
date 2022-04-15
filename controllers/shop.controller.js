const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const ITEM_PER_PAGE = 1;

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};
//----------------------------------------------------CONTROLLERS----------------------------------------------

const getProductsPage = async (req, res, next) => {
  const page = parseInt(req.query.page || 1);
  const offset = ITEM_PER_PAGE * (page - 1);

  try {
    const products = await Product.findAndCountAll({
      limit: ITEM_PER_PAGE,
      offset,
    });
    if (!products) {
      const error = new Error("No products found");
      error.statusCode = 404;
      throw error;
    }

    res.send({ totalItem: products.count, products: products.rows });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const getCartPage = async (req, res) => {
  try {
    const currentUser = User.findByPk(req.userId);
    const cart = await currentUser.getCart();

    if (!cart) {
      const error = new Error("Server Error. Please try again");
      throw error;
    }

    const products = await cart.getProducts();
    res.send({ products });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postCart = async (req, res) => {
  try {
    const productId = req.body.productId;

    let newQuantity = 1;

     const currentUser = User.findByPk(req.userId);
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

    await fetchedCart.addProduct(product, {
      through: { quantity: newQuantity },
    });

    res.send({ message: "Successfully added item to cart" });
  } catch (err) {
    passToErrorMiddleware(err, next);
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
   const currentUser = User.findByPk(req.userId);

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
    const prodId = req.body.productId;

     const currentUser = User.findByPk(req.userId);

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

    res.send({ message: "Product deleted" });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postOrder = (req, res) => {
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

  const order = await currentUser.createOrder()

  await order.addProducts(
    products.map((product) => {
      product.orderItem = { quantity: product.cartItem.quantity };
      return product;
    })
  )

  await fetchedCart.setProducts(null);

  res.send({message: 'Order succeeded'})
  } catch (err) {
    passToErrorMiddleware(err,next)
  }
};

const postSubtractCart = async (req, res, next) => {
 try{
  const prodId = req.body.productId;

   const currentUser = User.findByPk(req.userId);
  let fetchedCart = [];

  const cart = await currentUser.getCart()
  const product =  cart.getProducts({ where: { _id: prodId } });

  const cartItem = product[0].cartItem;
      let { quantity } = product[0].cartItem;
      if (quantity === 1) {
        return product[0].cartItem.destroy();
      } else {
        quantity = quantity - 1;
      }
      cartItem.quantity = quantity;
      console.log(cartItem.quantity);

      await fetchedCart.addProduct(product, {
        through: { quantity: cartItem.quantity },
      });

      res.send({message: 'Item subtracted'})
 } catch (err) {
  passToErrorMiddleware(err,next)
 }

};

const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      const error = new Error("No order found");
      error.statusCode = 404
      throw error
    }
    if (order.dataValues.userId !== req.userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401
      throw error
    }
  
    const products  = order.getProducts();
  
    if (!products) {
      const error = new Error('Server Error')
      throw error
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
    passToErrorMiddleware(err,next)
  }
  
};

module.exports = {
  getProductsPage,
  getCartPage,
  postCart,
  getOrderPage,
  getProductPage,
  postCartDeleteProduct,
  postOrder,
  postSubtractCart,
  getInvoice,
};
