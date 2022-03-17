// root file of node js
const express = require("express");
const path = require("path");

const bodyParser = require("body-parser");

const { adminRoutes } = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// NOTE: simillar to express.json()
app.use(bodyParser.urlencoded({ extended: false }));
// NOTE: makes static files usable
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
