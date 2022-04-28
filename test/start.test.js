const { it, test } = require("jest");

const { postSignUp } = require("../controllers/auth.controller");

function createSignUp({
  firstName = "",
  lastName = "",
  email = "",
  password = "",
  confirmPassword = "",
}) {
  return {
    firstName,
    email,
    lastName,
    password,
    confirmPassword,
  };
}

test("Auth Controller", () => {
  it("throws error if email is invalid format", () => {
    // const req = {
    //   body: createSignUp("", "emali.com"),
    // };

    // console.log(req);
    // expect("");

    // postSignUp();

    function sum(a, b) {
      return a + b;
    }
    module.exports = sum;
  });

  // it("throws error if email already exists", () => {});

  // it("throws error if firstName is empty", () => {});

  // it("throws error if lastName is empty", () => {});

  // it("throws error if password  > 6 characters ", () => {});

  // it("throws error if password is not equal to confirmpassword", () => {});

  // it("creates valid user", () => {});
});
