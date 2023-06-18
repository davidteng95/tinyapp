const bcrypt = require('bcryptjs');

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10)
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: bcrypt.hashSync("5678", 10)
  },
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "abc"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
};

module.exports = {
  users,
  urlDatabase
}