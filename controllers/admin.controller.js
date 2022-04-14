const Product = require("../models/product.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const deleteFile = require("../util/file");

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

    if (product.userId !== req.session.user._id) {
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
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

const postAddProductPage = async (req, res, next) => {
  req.body._id = null;
  const { title, description, price } = req.body;
  const image = req.file;

  try {
    if (!image) {
      const error = new Error("Attached file is not an image");
      error.statusCode = 422;
      throw error;
    }

    const imageUrl = image.path;

    const currentUser = User.build(req.session.user);

    const product = await currentUser.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    });

    res.status(201).send({ message: "Product created!" }, product);
  } catch (err) {
    console.log("error at postAddProduct", err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    console.log(productId);

    const product = await Product.findByPk(productId);

    if (product.userId !== req.session.user._id) {
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
    res.status(500).send("Error deleting the product");
  }
};

module.exports = {
  postEditProduct,
  postAddProductPage,
  deleteProduct,
};
