const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieParser = require('cookie-parser');


app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "5678",
  },
};


app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  console.log('user', user);
  const templateVars = {urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  console.log(user);
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // res.redirect(longURL);

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }

});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: user};
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  // const user = req.body.user;
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: user};
  res.render('urls_login', templateVars);
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });


app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.status(401).send("You need to be logged in to create a new URL.");
    return;
  }

  const id = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL;

  console.log(req.body); // Log the POST request body to the console
  console.log(urlDatabase); //Log the updated urlDatabase to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});

 app.post('/urls/:id/', (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.status(401).send("You need to be logged in to create a new URL.");
    return;
  }

  const shortURL = req.params.id;
  // console.log(shortURL);
  const newLongUrl = req.body.newLongURL;
  // console.log(req.body);
  // console.log(newLongUrl);
  urlDatabase[shortURL] = newLongUrl;

  res.redirect('/urls');
});

 app.post('/urls/:id/delete', (req, res) => {
  const urlId = req.params.id;
  delete urlDatabase[urlId];
  res.redirect('/urls');
});

 app.post('/login', (req, res) => {
  
  // // 1. get the email,  from req.body
  // const {email, password} = req.body
  
  // //loop over the entire user data base, check if the email exists, if not give 404 or redirect
  // for (const user in users) {
  //   if ()
  // }
  // //password matches

  // //once data matches set the user_id
  
  // const user_id = 'abc';

  const email = req.body.email;
  const password = req.body.password;
  const user_id = req.body.id

  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
  }
  const user = Object.values(users).find(user => user.email === email || user.password === password);
  if (!user){
    res.status(403).send(`Invalid email or password`);
    return;
  }
  if (user.password !== password){
    res.status(403).send(`Invalid email or password`);
    return;
  }


  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
      return;
    }
  }

  console.log(email);
  // res.cookie('user_id',);
  // res.redirect('/urls');
});

 app.post('/logout', (req, res) => {
  const user = req.body;
  console.log(user);
  res.clearCookie('user_id', user.id);
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Please provide an email and password");
    return;
  }
  
  const findUserByEmail = (existingEmail, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === existingEmail) {
        return user;
      }
    }
    return null;
  }
  
  const foundUser = findUserByEmail(email, users)
  
  if (foundUser) {
    res.status(400).send("Email already exists");
    return;
  }
  
  const user_id = Math.random().toString(36).substring(2, 5);

  const newUser = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  }

  users[user_id] = newUser;

  console.log(users);

  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length);
    string += alphanumeric.charAt(randomIndex);
  }

  return string;
}