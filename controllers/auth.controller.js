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

const postSignUp = (req, res) => {};

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
