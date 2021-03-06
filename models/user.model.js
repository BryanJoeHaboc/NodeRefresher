const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  _id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    isEmail: true,
  },
  userType: {
    type: Sequelize.STRING,
    defaultValue: "user",
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  resetToken: Sequelize.STRING,
  resetTokenExpirationDate: Sequelize.DATE,
});

module.exports = User;
