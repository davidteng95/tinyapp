const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL;

  console.log(req.body); // Log the POST request body to the console
  console.log(urlDatabase); //Log the updated urlDatabase to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

 app.post('/urls/:id/', (req, res) => {
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
  const { username } = req.body;

  res.cookie('username', username);
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