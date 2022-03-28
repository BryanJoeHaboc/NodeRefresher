const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cart = sequelize.define("cart", {
  _id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    allowIncrement: true,
  },
});

module.exports = Cart;
