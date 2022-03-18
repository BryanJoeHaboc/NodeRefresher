const express = require("express");

const { getProductsPage } = require("../controllers/products.controller");

const router = express.Router();

router.get("/", getProductsPage);

module.exports = router;
