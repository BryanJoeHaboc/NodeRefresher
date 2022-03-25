const fs = require("fs");
const path = require("path");
const pathUtil = require("../util/path");
const { v4 } = require("uuid");

const Cart = require("../models/cart.model");
const p = path.join(pathUtil, "data", "products.json");

module.exports = class Product {
  constructor({ title, imageUrl, description, price, _id }) {
    this._id = _id;
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    const writeToFile = (products) => {
      if (this._id) {
        const existingProductIndex = products.findIndex(
          (product) => product._id === this._id
        );
        const updatedProducts = [...products];
        console.log(existingProductIndex);
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) =>
          console.log("error in editing ", err)
        );
      } else {
        this._id = v4();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) =>
          console.log("error in writeFile ", err)
        );
      }
    };

    fs.readFile(p, (error, fileContent) => {
      let products = [];
      if (!error) {
        products = JSON.parse(fileContent);
      }
      writeToFile(products);
    });
  }

  static fetchAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(p, (error, fileContent) => {
        if (error) {
          resolve([]);
        }
        resolve(JSON.parse(fileContent));
      });
    });
  }

  static findById(id) {
    const allProducts = this.fetchAll();

    return allProducts.then((products) =>
      products.filter((product) => product._id === id)
    );

    // const product = allProducts.filter((product) => id === product._id);
    // console.log(product);
    // return product;
  }

  static deleteById(id) {
    return new Promise((res, rej) => {
      const allProducts = this.fetchAll();

      allProducts.then((products) => {
        const newProductLists = products.filter(
          (product) => product._id !== id.trim()
        );

        const deletedProduct = products.find(
          (product) => product._id === id.trim()
        );

        fs.writeFile(p, JSON.stringify(newProductLists), (err) => {
          if (err) {
            rej(err);
          }
          Cart.deleteProduct(id, deletedProduct.price);
          res(deletedProduct);
        });
      });
    });
  }
};
