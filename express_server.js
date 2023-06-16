const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['random', 'keys'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

const urlsForUser = (id) => {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.status(401).send("Please log in or register first");
  }

  console.log('user', user);
  const userURLs = urlsForUser(userID);
  const templateVars = {urls: userURLs, user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  // console.log(user);
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    res.status(401).send("Please log in or register first");
    return;
  }

  const id = req.params.id;
  console.log('id', id);
  const userURLs = urlsForUser(userID);
  console.log("userURLs", userURLs);
  if (!Object.keys(userURLs).includes(id)) {
    res.status(403).send("You do not have permission to access this URL");
    return;
  }

  const longURL = urlDatabase[id].longURL;
  console.log('longURL', longURL);
  const templateVars = { id, longURL, user};
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
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: user};
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
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

  // console.log(req.body); // Log the POST request body to the console
  // console.log(urlDatabase); //Log the updated urlDatabase to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});

 app.post('/urls/:id/', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  

  
  if (!user) {
    res.status(401).send("You need to be logged in to update a URL.");
    return;
  }

  const shortURL = req.params.id;
  // console.log(shortURL);
  const longURL = req.body.newLongURL;

  const url = {userID, longURL}
  // console.log(req.body);
  // console.log(newLongUrl);
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
  
  // // 1. get the email,  from req.body
  // const {email, password} = req.body
  
  // //loop over the entire user data base, check if the email exists, if not give 404 or redirect
  // for (const user in users) {
  //   if ()
  // }
  // //password matches

  // //once data matches set the user_id
  
  // const user_id = 'abc';
  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  // const hashedPassword = bcrypt.hashSync(password, 10)
  

  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  const user = Object.values(users).find(user => user.email === email);
  
  // console.log('user', user)
  // console.log('userpw', user.password);
  // console.log(!bcrypt.compareSync(password, user.password));
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send(`Invalid email or password`);
    return;
  }

  // if (user.password !== hashedPassword){
  //   res.status(403).send(`Invalid email or password`);
  //   return;
  // }

  // for (const userId in users) {
  //   const user = users[userId];
  //   if (user.email === email && user.password === password) {
  //     res.cookie('user_id', user.id);
  //     res.redirect('/urls');
  //     return;
  //   }
  // }

  // console.log(email);
  req.session.user_id = user.id;
  res.redirect('/urls');
});

 app.post('/logout', (req, res) => {
  const user = req.body;
  console.log(user);
  req.session = null;
  res.clearCookie('user_id', user.id);
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
  
  const findUserByEmail = (existingEmail, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === existingEmail) {
        return user;
      }
    }
    return null;
  }
  
  if (findUserByEmail(email, users)) {
    res.status(400).send("Email already exists");
    return;
  }
  
  const user_id = Math.random().toString(36).substring(2, 5);

  const newUser = {
    id: user_id,
    email: req.body.email,
    password: hashedPassword
  }

  users[user_id] = newUser;

  console.log(users);

  req.session.user_id = user_id;
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