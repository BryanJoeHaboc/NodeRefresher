const fs = require("fs");
const path = require("path");
const pathUtil = require("../util/path");
const { v4 } = require("uuid");

const p = path.join(pathUtil, "data", "products.json");

module.exports = class Product {
  constructor({ title, imageUrl, description, price, _id }) {
    this._id = v4();
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    const writeToFile = (products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) =>
        console.log("error in writeFile ", err)
      );
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
};
