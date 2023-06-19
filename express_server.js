const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const { users, urlDatabase} = require('./database');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['random', 'keys'],
}));

app.set("view engine", "ejs");


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.status(401).send("Please log in or register first");
    return;
  }

  const userURLs = urlsForUser(userID);
  const templateVars = { urls: userURLs, user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
 
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const id = req.params.id;
  const userURLs = urlsForUser(userID);
  
  if (urlDatabase[id] === undefined) {
    res.status(404).send("URL does not exist");
    return;
  }

  if (!user) {
    res.status(401).send("Please log in or register first");
    return;
  }

  if (!Object.keys(userURLs).includes(id)) {
    res.status(403).send("You do not have permission to access this URL");
    return;
  }

  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  
  if (!url || !url.longURL) {
    res.status(404).send("URL does not exist");
    return;
  }
  
  const longURL = url.longURL;
  res.redirect(longURL);

});

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = { user: user };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (user) {
    res.redirect('/urls');
    return;
  }

  const templateVars = { user: user };
  res.render('urls_login', templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.status(401).send("You need to be logged in to create a new URL.");
    return;
  }

  const id = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[id] = {
    longURL: longURL,
    userID: user.id
  };

  res.redirect(`/urls/${id}`);
});

app.post("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
    return;
  }
});

app.post('/urls/:id/', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.id;
  const userURLs = urlsForUser(userID);

  if (!user) {
    res.status(401).send("You need to be logged in to update a URL.");
    return;
  }

  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("URL does not exist");
    return;
  }

  if (!Object.keys(userURLs).includes(shortURL)) {
    res.status(403).send("You do not have permission to access this URL");
    return;
  }

  const longURL = req.body.newLongURL;
  const url = { userID, longURL };
  urlDatabase[shortURL] = url;

  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  const urlId = req.params.id;
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    res.status(401).send("You need to be logged in to delete a URL");
    return;
  }

  const url = urlDatabase[urlId];

  if (!url) {
    res.status(404).send("URL not found");
    return;
  }

  if (url.userID !== userID) {
    res.status(403).send("You are not authorized to delete this URL");
    return;
  }

  delete urlDatabase[urlId];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  const user = Object.values(users).find(user => user.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send(`Invalid email or password`);
    return;
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  const user = req.body;
  req.session = null;
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send("Please provide an email and password");
    return;
  }

  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists");
    return;
  }

  const user_id = Math.random().toString(36).substring(2, 5);

  const newUser = {
    id: user_id,
    email: req.body.email,
    password: hashedPassword
  };

  users[user_id] = newUser;

  req.session.user_id = user_id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

