require("dotenv").config();

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

const User = require("../models/user.model");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

const getErrorMessage = (req) => {
  const messages = req.flash("error");
  let errorMessage = undefined;

  if (messages.length > 0) {
    errorMessage = messages[0];
  }

  return errorMessage;
};

const postLogin = async (req, res) => {
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
    const token = "";
    res.send({ message: "Successfully logged in", token });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    return next(error);
  }
};

const postSignUp = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

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
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
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
    console.log(err);
    const error = new Error(err);
    error.httpsStatusCode = 500;
    next(error);
  }
};

const postResetPassword = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.rediect("reset");
        }

        return User.update(
          {
            resetToken: token,
            resetTokenExpirationDate: Date.now() + 3600000,
          },
          { where: { _id: user._id } }
        );
      })
      .then((result) => {
        console.log(result);
        res.redirect("/");
        //NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022
        transporter.sendMail({
          from: "someemail@example.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token} ">link</a> to set a new password</p>
          <p>This reset email is only valid for one hour</p>`,
        });
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(err);
        error.httpsStatusCode = 500;
        return next(error);
      });
  });
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
    const error = new Error(err);
    error.httpsStatusCode = 500;
    next(error);
  }
};

module.exports = {
  postLogin,
  postSignUp,
  postResetPassword,
  postNewPassword,
};
