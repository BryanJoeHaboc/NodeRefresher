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

const res = () => {};
const next = () => {};
describe("Auth Controller", () => {
  it("throws error if password and confirmPassword not equal", () => {
    const req = {
      body: createSignUp("", "", "", "pass", "password"),
    };

    console.log(req);
    expect(postSignUp(req, res, next())).toStrictEqual({
      error: "Password and confirm password must be equal",
    });
  });

  // it("throws error if email already exists", () => {});

  // it("throws error if firstName is empty", () => {});

  // it("throws error if lastName is empty", () => {});

  // it("throws error if password  > 6 characters ", () => {});

  // it("throws error if password is not equal to confirmpassword", () => {});

  // it("creates valid user", () => {});
});
