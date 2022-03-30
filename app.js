// root file of node js
const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");

const sequelize = require("./util/database");
const Product = require("./models/product.model");
const User = require("./models/user.model");
const Cart = require("./models/cart.model");
const CartItem = require("./models/cart-item.model");
const Order = require("./models/order.model");
const OrderItem = require("./models/order-item.model");
const configSession = require("./config/session");

const { adminRoutes } = require("./routes/admin.routes");
const shopRoutes = require("./routes/shop.routes");
const authRoutes = require("./routes/auth.routes");
const { get404Page } = require("./controllers/error.controller");

const port = process.env.PORT || 5000;
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// session
configSession(app);

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: { model: CartItem, unique: false } });
Product.belongsToMany(Cart, { through: { model: CartItem, unique: false } });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get404Page);

sequelize
  .sync({ force: true })
  .then((cart) => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
