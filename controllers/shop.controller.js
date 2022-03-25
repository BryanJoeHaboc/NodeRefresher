const req = require("express/lib/request");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");

exports.getProductsPage = (req, res) => {
  const products = Product.fetchAll();

  products.then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

exports.getIndexPage = (req, res) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        prods: rows,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCartPage = async (req, res) => {
  const cart = await Cart.getProducts();

  if (cart) {
    const products = await Product.fetchAll();
    const cartProducts = [];

    for (const product of products) {
      const cartProductData = cart.products.find(
        (prod) => prod._id === product._id
      );

      if (cartProductData) {
        cartProducts.push({
          productData: product,
          qty: cartProductData.qty,
        });
      }
    }

    res.render("shop/cart", {
      pageTitle: "My Cart",
      path: "/cart",
      products: cartProducts,
    });
  }
};

exports.postCart = async (req, res) => {
  const productId = req.body.productId;
  const product = await Product.findById(productId);
  Cart.addProduct(productId, product[0].price);

  res.redirect("/cart");
};

exports.getCheckoutPage = (req, res) => {
  res.render("shop/checkout", { pageTitle: "My Checkout", path: "/checkout" });
};

exports.getOrderPage = (req, res) => {
  res.render("shop/orders", { pageTitle: "My Cart", path: "/cart" });
};

exports.getProductPage = async (req, res) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  res.render("shop/product-item", {
    pageTitle: product[0].title,
    product: product[0],
    path: "/products",
  });
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = Product.findById(prodId);

  product.then((prod) => {
    const deletedCartItem = Cart.deleteProduct(prodId.trim(), prod[0].price);

    deletedCartItem.then((item) => res.redirect("/"));
  });
};
