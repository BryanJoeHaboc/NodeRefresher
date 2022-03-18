const fs = require("fs");
const path = require("path");
const pathUtil = require("../util/path");

const p = path.join(pathUtil, "data", "products.json");

module.exports = class Product {
  constructor({ title }) {
    this.title = title;
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
