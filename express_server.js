const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "S152tx": "http://www.tsn.ca"
// };

const urlDatabase = {
  t2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "2jcseb" },
  rsm5xK: { longURL: "http://www.google.com", userID: "user2RandomID" },
  S152tx: { longURL: "http://www.tsn.ca", userID: "user2RandomID" }
};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2,8);
  //console.log("random", randomString);
  return randomString;
};

const findUserByEmail = (email, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  //if not match
  return false;
};

app.get("/", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };//new route handler for "hello world" and use res.render() to get this string formated (rendered from another file). 
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');

  }
  const templateVars = {
    user: userId
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL, 
    userID: users[req.cookies["user_id"]]};
  //urlDatabase[shortURL] = {longURL: req.body.longURL, userID: users[req.cookies["user_id"]]["id"]};
  //console.log(" ID from Object ", {longURL: req.body.longURL, userID: users[req.cookies["user_id"]]["id"]})
  //console.log(" urlDatabase ", urlDatabase);
  //urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  //console.log(templateVars);
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  //let password = req.body.password;
  let user = findUserByEmail(req.body.email,users);
  if (user && user.password === req.body.password) {
    res.cookie('user_id', user.id);
    console.log(user.id);
    res.redirect('/urls');
  } else {
    res.send('403: Forbidden Error', 403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.send('Error: You need an Email and Password to Register', 400);
  }
  if (findUserByEmail(email, users)) {
    res.send('403: Bad Request', 400);
  } else {
    const userId = generateRandomString();// Take an email, take password from register form. Plus gener random ID
    users[userId] = {
      id: userId,
      email,
      password
    };
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  //console.log(" req. cookies ",req.cookies);
  console.log("this is from app.get ", urlDatabase);
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
 
  res.render("urls_index", templateVars);
});

//editing (getting to the edit form)
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  let temp = req.params.shortURL;//temp will have the value of shortURL, which is what we type in browser after /urls/:
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/urls');
  }
  const templateVars = { shortURL: temp, longURL: urlDatabase[temp]["longURL"], user: users[userId] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let temp = req.params.shortURL;
  const longURL = urlDatabase[temp]["longURL"];
  res.redirect(longURL);
});

//Delete or remove an url
app.get("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/login");
});

//Delete or remove an url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Editing of existing info
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: users[req.cookies["user_id"]]};
  res.redirect("/urls");// redirecting to the main page after editing or submitting of a new
});
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
