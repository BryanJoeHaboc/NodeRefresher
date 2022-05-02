const Product = require("../models/product.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const deleteFile = require("../util/file");

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};
//----------------------------------------------------CONTROLLERS----------------------------------------------

const postEditProduct = async (req, res, next) => {
  const { productId, title, price, description } = req.body;

  const image = req.file;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Invalid Input");
      error.statusCode = 422;
      throw error;
    }

    const product = await Product.findByPk(productId);

    if (product.userId !== req.userId) {
      const error = new Error("Unauthorize Request");
      error.statusCode = 401;
      throw error;
    }

    product.title = title;
    product.price = price;
    product.description = description;

    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    res.status(200).send({ message: "Product edited succesfully", product });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postAddProductPage = async (req, res, next) => {
  req.body._id = null;
  const {
    product: { title, description, price, imageUrl, name },
  } = req.body;
  const image = req.file;
  //:NOTE: temporarily disable image uploading
  try {
    // if (!image) {
    //   const error = new Error("Attached file is not an image");
    //   error.statusCode = 422;
    //   throw error;
    // }

    // const imageUrl = image.path;

    const currentUser = User.build(req.userId);

    const product = await currentUser.createProduct({
      title: title,
      price: parseInt(price),
      imageUrl: imageUrl,
      description: description,
      name,
    });

    res.status(201).send({ message: "Product created!", product });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    console.log(productId);

    const product = await Product.findByPk(productId);

    if (product.userId !== req.userId) {
      const error = new Error("Unauthorize Request");
      error.statusCode = 401;
      throw error;
    } else {
      await product.destroy();
      console.log("Product deleted");
      deleteFile(product.imageUrl);
      res.status(200).json({ message: '"Product Deleted!"' });
    }
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postAddProducts = async (req, res, next) => {
  const data = req.body.data;
  const excelHeaders = data.shift();
  const products = [];

  for (let i = 0; i < data.length; i++) {
    const productObj = {};

    for (let j = 0; j < data[i].length; j++) {
      productObj[excelHeaders[j]] = data[i][j];
    }
    productObj.userId = req.body.userId;

    productObj.description =
      "Amet Lorem ad ipsum enim nulla occaecat nulla adipisicing do cupidatat elit deserunt officia.";
    products.push(productObj);
  }
  console.log(products);
  try {
    await Product.bulkCreate(products);

    res.send({ message: "All products added" });
  } catch (e) {
    passToErrorMiddleware(err, next);
  }
};

module.exports = {
  postEditProduct,
  postAddProductPage,
  deleteProduct,
  postAddProducts,
};
