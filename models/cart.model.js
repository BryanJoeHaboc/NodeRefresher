const fs = require("fs");
const path = require("path");
const pathUtil = require("../util/path");

const p = path.join(pathUtil, "data", "cart.json");

module.exports = class Cart {
  static async addProduct(id, productPrice) {
    return new Promise((resolve) => {
      fs.readFile(p, (error, fileContent) => {
        let cart = { products: [], totalPrice: 0 };
        if (!error) {
          if (fileContent) cart = JSON.parse(fileContent);
        }
        const existingProductIndex = cart.products.findIndex(
          (prod) => prod._id === id
        );
        const existingProduct = cart.products[existingProductIndex];
        let updatedProduct;
        console.log("index", existingProductIndex);
        if (existingProduct) {
          updatedProduct = { ...existingProduct };
          updatedProduct.qty = updatedProduct.qty + 1;
          //   cart.products = [...cart.products];
          cart.products[existingProductIndex] = updatedProduct;
        } else {
          updatedProduct = { _id: id, qty: 1 };
          cart.products = [...cart.products, updatedProduct];
        }

        cart.totalPrice = parseInt(cart.totalPrice) + parseInt(productPrice);

        resolve(
          fs.writeFile(p, JSON.stringify(cart), (err) => console.log(err))
        );
      });
    });
  }

  static deleteProduct(id, productPrice) {
    return new Promise((res, rej) => {
      fs.readFile(p, (err, fileContent) => {
        if (err) {
          return;
        }
        const cart = JSON.parse(fileContent);
        const updatedCart = { ...cart };
        const product = updatedCart.products.find((prod) => prod._id === id);
        updatedCart.products = updatedCart.products.filter(
          (prod) => prod._id !== id
        );

        if (!product) {
          return;
        }

        updatedCart.totalPrice =
          updatedCart.totalPrice - productPrice * product.qty;

        res(
          fs.writeFile(p, JSON.stringify(updatedCart), (err) =>
            console.log(err)
          )
        );
      });
    });
  }

  static getProducts() {
    return new Promise((res, rej) => {
      fs.readFile(p, (err, fileContent) => {
        if (err) rej(err);
        else res(JSON.parse(fileContent));
      });
    });
  }
};
