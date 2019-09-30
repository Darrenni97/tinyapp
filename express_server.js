const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// randomize urls
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 6; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// route handler to pass url data
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// database url json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// new url route
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//checks shortURL data
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

// handles shortURL links to redirect to longURL;
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL; // adds new links to database
  res.redirect(`/urls/${newID}`);  //responds with a redirect to /urls/:shortURL route
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});