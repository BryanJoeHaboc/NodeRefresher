// root file of node js
require("dotenv").config({ path: "./.env" });
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

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
const { get404Page, get500Page } = require("./controllers/error.controller");

const port = process.env.PORT || 5000;
const app = express();
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const fileName =
      new Date().toISOString().split(":").join("-") + file.originalname;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype === "image/png" ||
  file.mimetype === "image/jpg" ||
  file.mimetype === "image/jpeg"
    ? cb(null, true)
    : cb(null, false);
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/images",
  express.static(path.join(__dirname, "public/images"))
);

// session
configSession(app);

// csrf protection
app.use(csrfProtection);

app.use(flash());

// find Dummy User
// app.use((req, res, next) => {
//   User.findByPk(1)
//     .then((user) => {
//       req.user = user;
//       console.log("is user an instance of user? ", user instanceof User);
//       console.log("req.userrrrrrrrrrrrrrrr", req.user);
//       next();
//     })
//     .catch((err) => console.log(err));
// });

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

app.get("/500", get500Page);
app.use(get404Page);

app.use((error, req, res, next) => {
  const { message, statusCode } = error;

  if (!statusCode) {
    statusCode = 500;
  }
  console.log(message);
  res.status(statusCode).send({ message });
});

sequelize
  // .sync({ force: true })
  .sync()
  .then((cart) => {
    app.listen(port, () => {
      console.log("sengrdiapikey", process.env.SENDGRID_API_KEY);
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
