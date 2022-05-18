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
  it("throws error if user inputted invalid credentials", () => {});
});
