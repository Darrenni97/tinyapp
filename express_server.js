const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['secretKeys'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bcrypt = require('bcrypt');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// randomize urls
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// checks emails in users
const emailChecker = (input) => {
  for (let user in users) {
    if (users[user].email === input) {
      return true;
    }
  }
};

//function to return URLs for logged in user
const urlsForUser = (id) => {
  urls = {}

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  return urls;
};

app.get('/', (req, res) => {
  res.send('Hello!');
})

// route handler to pass url data
app.get("/urls", (req, res) => {
  const cookies = users[req.session.user_id]

  if (cookies) {
    let templateVars = { 
      urls: urlsForUser(cookies.id),
      user: cookies
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please login or register to see URL's");
  }
});

// database url json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// new url route
app.get("/urls/new", (req, res) => {
  let templateVars = {user: req.session.user_id};
  if (req.session.user_id) { //checks if there is a user logged in
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//checks shortURL data
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// handles shortURL links to redirect to longURL;
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]['longURL'] // retrieve long url link from the shortURL route
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = {// adds new links to database
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${newID}`);  //responds with a redirect to /urls/:shortURL route
});

// delete route
app.post('/urls/:shortURL/delete', (req, res) => {
  const cookies = users[req.session.user_id]
  
  if (cookies) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send("Cannot delete, please login!");
  }
});

//update/edit longURL
app.post('/urls/:id', (req, res) => {
  const shortURL =  req.params.id;
  const cookies = users[req.session.user_id]

  if (cookies) {
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Cannot edit, please login!");
  }
});

//display login form 
app.get('/login', (req, res) => {
  let templateVars = {user: req.session.user_id};
  res.render("login", templateVars);
});

const getUserByEmail = (inputEmail, database) => {
  for (let user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  }
};

//post cookie to login
app.post('/login', (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const userID = getUserByEmail(inputEmail, users);

  if (emailChecker(inputEmail)) {
      if (bcrypt.compareSync(inputPassword, userID.password)) {
        req.session.user_id = userID.id// sets the username inputted to a cookie labelled username
        res.redirect('/urls');
      } else {
        res.status(403);
        res.send('403: Wrong Password');
      }
  } else {
    res.status(403);
    res.send('403: Email Not Found');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  let templateVars = {user: req.session.user_id};
  res.render("register", templateVars);
});



app.post('/register', (req, res) => {
  const RandomID = generateRandomString(); //generates random ID for user
  const emailInput = req.body.email;
  const passwordInput = req.body.password;
  if (emailInput ===  '' || passwordInput === '') {
    res.status(400);
    res.send('400: Error');
  } else if (emailChecker(emailInput)) {
    res.status(400);
    res.send('400: Email Taken');
  } else {
    users[RandomID] = {
      id: RandomID,
      email: emailInput,
      password: bcrypt.hashSync(passwordInput, 10)
    };
    req.session.user_id = RandomID; // generate cookie under user_id with the generate ID
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});