const Product = require("../models/product.model");
const Order = require("../models/order.model");

exports.getProductsPage = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndexPage = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCartPage = async (req, res) => {
  req.user
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
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = async (req, res) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  console.log(productId, "product idddddddddddddddddddd");
  req.user
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
    .catch((err) => console.log(err));
};

exports.getCheckoutPage = (req, res) => {
  res.render("shop/checkout", { pageTitle: "My Checkout", path: "/checkout" });
};

exports.getOrderPage = (req, res) => {
  req.user
    .getOrders({ include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "My Orders",
        path: "/orders",
        orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProductPage = (req, res) => {
  const productId = req.params.productId;
  console.log("productId", productId);
  Product.findByPk(productId)
    .then((product) => {
      res.render("shop/product-item", {
        pageTitle: product.title,
        product: product,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = async (req, res) => {
  const prodId = req.body.productId;

  req.user
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
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res) => {
  let fetchedCart;
  console.log("post orderrrrrrrrrrrrrrrrr");
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user.createOrder().then((order) => {
        return order.addProducts(
          products.map((product) => {
            product.orderItem = { quantity: product.cartItem.quantity };
            console.log("products section");
            return product;
          })
        );
      });
    })
    .then((result) => {
      console.log("set products null");
      return fetchedCart.setProducts(null);
    })
    .then((result) => {
      console.log("dito na ko sa part na ttttttoooooooooooo");
      res.redirect("/orders");
    })

    .catch((err) => console.log("error btich"));
};
