require("dotenv").config();

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const { passToErrorMiddleware } = require("./error.controller");
const User = require("../models/user.model");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

//----------------------------------------------------CONTROLLERS----------------------------------------------

const postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Invalid input");
      error.statusCode = 422;
      throw error;
    }

    const user = await User.findOne({
      raw: true,
      nest: true,
      where: { email },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 422;
      throw error;
    }

    const doMatch = await bcrypt.compare(password, user.password);

    if (!doMatch) {
      const error = new Error("Invalid User Password");
      error.statusCode = 422;
      throw error;
    }
    let jwtSecret = "";
    if (process.env.NODE_ENV === "production") {
      jwtSecret = process.env.JWT_SECRET_PROD;
    } else {
      jwtSecret = process.env.JWT_SECRET;
    }
    console.log("jwtSecret", jwtSecret);

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.send({
      message: "Successfully logged in",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user._id,
        userType: user.userType,
      },
    });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

const postSignUp = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, userType } =
    req.body;

  console.log(req.body);
  try {
    if (confirmPassword !== password) {
      const error = new Error("Password and confirm password must be equal");
      error.statusCode = 422;
      throw error;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Invalid user");
      error.statusCode = 422;
      error.data = errors;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      userType,
    });
    await user.createCart();
    //NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022
    transporter.sendMail({
      from: process.env.SENDGRID_EMAIL,
      to: email,
      subject: "Signup succeeded",
      html: "<h1> You successfully signed up! </h1>",
    });

    res.status(201).send({ message: "User created!" });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

//NOTE: tinanggal ko await dito kasi nag loloko
const postResetPassword = async (req, res, next) => {
  try {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        const error = new Error("Server Error");
        throw error;
      }
      const token = buffer.toString("hex");
      // dito sa part na to
      const user = User.findOne({ where: { email: req.body.email } });
      if (!user) {
        const error = new Error("No user found associated with that email");
        error.statusCode = 404;
        throw error;
      }
      // dito sa part na to
      User.update(
        {
          resetToken: token,
          resetTokenExpirationDate: Date.now() + 3600000,
        },
        { where: { _id: user._id } }
      );
      transporter.sendMail({
        from: "someemail@example.com",
        to: req.body.email,
        subject: "Password Reset",
        html: `<p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token} ">link</a> to set a new password</p>
        <p>This reset email is only valid for one hour</p>`,
      });
    });
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

//NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022

const postNewPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const user = await User.findOne({
      where: {
        [Op.and]: [
          {
            resetToken,
          },
          {
            resetTokenExpirationDate: {
              [Op.gte]: Date.now(),
            },
          },
        ],
      },
    });

    if (user) {
      const error = new Error("Invalid token");
      error.statuCode = 422;
      throw error;
    }

    const { newPassword, userId, passwordToken } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.update(
      {
        resetToken: undefined,
        resetTokenExpirationDate: undefined,
        password: hashedPassword,
      },
      { where: { _id: userId, resetToken: passwordToken } }
    );
  } catch (err) {
    passToErrorMiddleware(err, next);
  }
};

module.exports = {
  postLogin,
  postSignUp,
  postResetPassword,
  postNewPassword,
};
