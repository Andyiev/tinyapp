const express = require("express");
const { findUserByEmail } = require("./helpers");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const PORT = 8080; // default port 8080
// const bodyParser = require("body-parser"); do not need it so far using built in possibilities of express
//app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());- cookie-session is used instead
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

// users' database
const users = {
  "2jcseb": {
    id: "2jcseb",
    email: "user@example.com",
    password: "$2b$10$XUzyCfgJT1PMRgTwiLZP/uFYI3TmxXTEra/Ci0437Q3XPyZ8vIXWK" //"purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$6c0cf704ScGMXHKguGXbO.UM7qZg6nHrP/PipzbQ/uU8MARA1qEKu" //"dish"
  }
};

// urls database
const urlDatabase = {
  t2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "2jcseb" },
  rsm5xK: { longURL: "http://www.google.com", userID: "user2RandomDD" },
  S152tx: { longURL: "http://www.tsn.ca", userID: "user2RandomID" }
};

// adding a new user
const addNewUser = (email, textPassword) => {
  // Generate a random id
  const userId = generateRandomString();
  const password = bcrypt.hashSync(textPassword, saltRounds);
  //console.log(password);
  const newUserObj = {
    id: userId,
    email,
    password,
  };
  // Add the user Object into the users
  users[userId] = newUserObj;
  // return the id of the user
  return userId;
};

// Generating random string for user's id and urls id
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2,8);
  //console.log("random", randomString);
  return randomString;
};

// return short url - longurl pair for user
const urlsForUser = function(id) {
  let newUrlDatabase = {};
  //console.log(urlDatabase);
  for (let key in urlDatabase) {
    //console.log(" Key ", key);
    let urlObject = urlDatabase[key];
    //console.log(" urlObject from urlsForUser function ", urlObject);
    if (urlObject.userID === id) {
      newUrlDatabase[key] = urlObject;
    }
  }
  //console.log(newUrlDatabase);
  return newUrlDatabase;
};

app.get("/", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };//new route handler for "hello world" and use res.render() to get this string formated (rendered from another file).
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');
  }
  const templateVars = {
    user: userId
  };
  res.render("urls_new", templateVars);
});

//addinf new urls as well
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});

// login section
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  //console.log(templateVars);
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  //let password = req.body.password;
  let user = findUserByEmail(req.body.email,users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
  //if (user && user.password === req.body.password) {
    //res.cookie('user_id', user.id);
    req.session["user_id"] = user.id;
    //console.log(user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send("Forbidden Error: You are not registered of using wrong combination.");
  }
});

//user logout
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  //res.clearCookie("user_id");
  res.redirect("/login");
});

// registration section
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  if (email === '' || password === '') {
    return res.send('Error: You need an Email and Password to Register', 400);
  }
  if (!user) {
    const userId = addNewUser(email, password);
    req.session["user_id"] = userId;
    //res.cookie('user_id', userId);
    res.redirect("/urls");
  } else {
    res.status(403).send('403: Bad Request. You have to use another combination"');
  }
});

//show urls page with urls
app.get("/urls", (req, res) => {
  const userLogged = req.session["user_id"];
  if (!userLogged) {
    res.send("Please Register or Login!");
    return;
  }
  const newUrlDatabase = urlsForUser(req.session["user_id"]);
  const templateVars = { urls: newUrlDatabase, user: users[req.session["user_id"]] };
  res.render("urls_index", templateVars);
});

//editing (getting to the edit form)
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  //console.log(" this user ID ", userId);
  let temp = req.params.shortURL;//temp will have the value of shortURL, which is what we type in browser after /urls/:
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');
  }
  if (urlDatabase[temp].userID !== userId) {
    //return res.send(" This url does not belong to this user");
    return res.render("urls_show",{ shortURL: null, longURL: null, user: users[userId] });
  }
  let longURL = urlDatabase[temp] && urlDatabase[temp]["longURL"];
  const templateVars = { shortURL: temp, longURL: longURL, user: users[userId] };
  // console.log(" whole urlDatabase ", urlDatabase);
  res.render("urls_show", templateVars);
});

// redirecting to the site by its shortURL
app.get("/u/:shortURL", (req, res) => {
  let temp = req.params.shortURL;
  const longURL = urlDatabase[temp]["longURL"];
  res.redirect(longURL);
});

//Delete or remove an url
app.get("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"];
  let temp = req.params.shortURL;
  if (!userId) {
    // if user is not logged , he will be redirected to the main login page
    return res.redirect('/login');
  } else if (urlDatabase[temp].userID !== userId) {
    // return res.send(" It is not yours! ");
    res.send(" This Url does not belong to you!");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Delete or remove an url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Editing of existing info
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  //console.log(" from app-post /urls/id ", urlDatabase);
  res.redirect("/urls");// redirecting to the main page after editing or submitting of a new
});
 
app.listen(PORT, () => {
  //console.log(`Example app listening on port ${PORT}!`);
});
