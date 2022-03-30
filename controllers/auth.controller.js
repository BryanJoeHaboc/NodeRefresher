const User = require("../models/user.model");

const getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: false,
  });
};

const postLogin = (req, res) => {
  req.session.isLoggedIn = true;
  res.redirect("/");
};

const postLogout = (req, res) => {
  console.log("hello nasa post log out ako");
  req.session.destroy(() => {
    res.redirect("/");
  });
};

const postSignUp = (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return User.create({ firstName, lastName, email, password });
      } else {
        // res.send("User Already Exists"); pwede pala to kaso magtutuloy padin sa next then
        return Promise.resolve("User already Exist");
      }
    })
    .then((user) => {
      if (user === "User already Exist") {
        console.log("User Already Exist");
        res.send("User Already Exists");
      } else {
        user.createCart().then((result) => {
          res.redirect("/login");
        });
      }
    })
    .catch((err) => console.log("errorrrrrrrrrrrrrrrrr", err));
};

const getSignUp = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Login",
    path: "/signup",
    isLoggedIn: false,
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
};
