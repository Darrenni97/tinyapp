const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


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

app.get('/', (req, res) => {
  res.send('Hello!');
})

// route handler to pass url data
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

// database url json format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// new url route
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

//checks shortURL data
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

// handles shortURL links to redirect to longURL;
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] // retrieve long url link from the shortURL route
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL; // adds new links to database
  res.redirect(`/urls/${newID}`);  //responds with a redirect to /urls/:shortURL route
});

// delete route
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

//update/edit longURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL =  req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
})

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render("login", templateVars);
})

//post cookie to login
app.post('/login', (req, res) => {
  const user_id = req.body.username;
  res.cookie('user_id', user_id); // sets the username inputted to a cookie labelled username
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render("register", templateVars);
});


const emailChecker = (input) => {
  for (let user in users) {
    if (users[user].email === input) {
      return true;
    }
  }
};

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
      password: passwordInput
    };
    console.log(users);
    res.cookie('user_id', RandomID); // generate cookie under user_id with the generate ID
    res.redirect('/urls');
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});