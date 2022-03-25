const db = require("../util/database");

const Cart = require("../models/cart.model");

module.exports = class Product {
  constructor({ title, imageUrl, description, price, _id }) {
    this._id = _id;
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    //
    return db.execute(
      "INSERT INTO products (title,price,description,imageUrl) VALUES (?, ?, ?, ?)",
      [this.title, this.price, this.description, this.imageUrl]
    );
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute("SELECT * FROM products WHERE products._id = ?", [id]);
  }

  static deleteById(id) {}
};
