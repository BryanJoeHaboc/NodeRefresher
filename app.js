// root file of node js
const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");
const Sequelize = require("sequelize");

const sequelize = require("./util/database");
const Product = require("./models/product.model");
const User = require("./models/user.model");
const { adminRoutes } = require("./routes/admin.routes");
const shopRoutes = require("./routes/shop.routes");
const { get404Page } = require("./controllers/error.controller");
const Cart = require("./models/cart.model");
const CartItem = require("./models/cart-item.model");
const Order = require("./models/order.model");
const OrderItem = require("./models/order-item.model");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// NOTE: simillar to express.json()
app.use(bodyParser.urlencoded({ extended: false }));
// NOTE: makes static files usable
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(get404Page);

const port = 5000;

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: { model: CartItem, unique: false } });
Product.belongsToMany(Cart, { through: { model: CartItem, unique: false } });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync()
  .sync({ force: true })
  .then((res) => {
    // console.log(res);
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ displayName: "Max", email: "test@test.com" });
    }
    return Promise.resolve(user);
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
