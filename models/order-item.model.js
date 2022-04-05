const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const OrderItem = sequelize.define("orderItem", {
  _id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
});

module.exports = OrderItem;
