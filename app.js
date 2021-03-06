// root file of node js
require("dotenv").config({ path: "./.env" });
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");

const sequelize = require("./util/database");
const Product = require("./models/product.model");
const User = require("./models/user.model");
const Cart = require("./models/cart.model");
const CartItem = require("./models/cart-item.model");
const Order = require("./models/order.model");
const OrderItem = require("./models/order-item.model");

const { adminRoutes } = require("./routes/admin.routes");
const shopRoutes = require("./routes/shop.routes");
const authRoutes = require("./routes/auth.routes");

const port = process.env.PORT || 5000;
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     const fileName =
//       new Date().toISOString().split(":").join("-") + file.originalname;
//     cb(null, fileName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   file.mimetype === "image/png" ||
//   file.mimetype === "image/jpg" ||
//   file.mimetype === "image/jpeg"
//     ? cb(null, true)
//     : cb(null, false);
// };

app.get("/", (req, res, next) => res.send({ message: "Hello Testing" }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
// app.use(express.static(path.join(__dirname, "public")));
// app.use(
//   "/public/images",
//   express.static(path.join(__dirname, "public/images"))
// );

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" }); // Product.getUser
User.hasMany(Product);
User.hasOne(Cart); // User.getCart(), User.setCart(), User.createCart()
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: { model: CartItem, unique: false } });
Product.belongsToMany(Cart, { through: { model: CartItem, unique: false } });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
  let { message, statusCode, data } = error;

  if (!statusCode) {
    statusCode = 500;
  }
  console.log(data);
  if (!data) {
    data = {};
  }

  console.log(message);
  res.status(statusCode).send({ message, data });
});

sequelize
  // .sync({ force: true })
  .sync()
  .then((cart) => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
