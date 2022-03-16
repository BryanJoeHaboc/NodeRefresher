// root file of node js

const express = require("express");

const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/add-product", (req, res, next) => {
  res.send(
    '<form action="/product"  method="POST" /> <input type="text" name="title"> <button type="submit">Add Product</button> </form>'
  );
});

app.use("/product", (req, res, next) => {
  const { body } = req;

  res.send(`<h1>Hello world</h1>`);
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
