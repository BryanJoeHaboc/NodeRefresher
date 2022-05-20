const Product = require("../models/product.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");
const deleteFile = require("../util/file");
const { passToErrorMiddleware } = require("./error.controller");

//----------------------------------------------------CONTROLLERS----------------------------------------------

const getAdminProducts = async (req, res, next) => {
  try {
    const userId = req.userId;
    const products = await Product.findAndCountAll({
      where: { userId: userId },
    });

    if (products.length === 0) {
      const error = new Error("No products found");
      error.statusCode = 404;
      throw error;
    }

    // const collections = [];
    // const titles = [];

    // products.rows.forEach((product) => {
    //   const prodTitle = product.title;
    //   const index = titles.findIndex((title) => title === prodTitle);

    //   if (index < 0) {
    //     titles.push(prodTitle);
    //     collections[titles.length - 1] = {
    //       _id: titles.length,
    //       title: prodTitle,
    //       routeName: prodTitle.toLowerCase(),
    //       items: [],
    //     };

    //     collections[titles.length - 1].items.push(product);
    //   } else {
    //     collections[index].items.push(product);
    //   }
    // });

    res.send(products);
  } catch (error) {
    passToErrorMiddleware(error, next);
  }
};

const postEditProduct = async (req, res, next) => {
  const { _id, title, price, description, imageUrl, name } =
    req.body.data.product;

  // const image = req.file;

  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   const error = new Error("Invalid Input");
    //   error.statusCode = 422;

    //   error.data = errors;
    //   throw error;
    // }

    const product = await Product.findByPk(_id);

    if (!product) {
      const error = new Error("Product does not exists");
      error.statusCode = 404;
      throw error;
    }

    if (product.userId !== req.userId) {
      const error = new Error("Unauthorize Request");
      error.statusCode = 401;
      throw error;
    }

    product.title = title;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;
    product.name = name;

    await product.save();

    // if (image) {
    //   deleteFile(product.imageUrl);
    //   product.imageUrl = image.path;
    // }
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

    const currentUser = User.build({ _id: req.userId });
    console.log(currentUser, req.userId);
    const product = await currentUser.createProduct({
      title: title,
      price: parseInt(price),
      imageUrl: imageUrl,
      description: description,
      name,
      userId: req.userId,
    });

    res.status(201).send({ message: "Product created!", product });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    console.log("productId", productId);

    const product = await Product.findByPk(productId);

    console.log(req.body.userId);
    console.log(req.body);
    if (product.userId !== req.body.userId) {
      const error = new Error("Unauthorize Request");
      error.statusCode = 401;
      throw error;
    } else {
      await product.destroy();
      console.log("Product deleted");
      // deleteFile(product.imageUrl);
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
  getAdminProducts,
};
