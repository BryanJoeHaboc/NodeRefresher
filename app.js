// root file of node js
const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");

const { adminRoutes } = require("./routes/admin.routes");
const shopRoutes = require("./routes/shop.routes");
const { get404Page } = require("./controllers/error.controller");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// NOTE: simillar to express.json()
app.use(bodyParser.urlencoded({ extended: false }));
// NOTE: makes static files usable
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(get404Page);

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
