const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const users = { 
  "2jcseb": {
    id: "2jcseb", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dish"
  }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
//   "S152tx": "http://www.tsn.ca"
// };

const urlDatabase = {
  t2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "2jcseb" },
  rsm5xK: { longURL: "http://www.google.com", userID: "user2RandomDD" },
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

const urlsForUser = function(id) {
//console.log("this is id ", id);
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
}

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

//addinf new urls as well
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL, 
    userID: req.cookies["user_id"]};
  //urlDatabase[shortURL] = {longURL: req.body.longURL, userID: users[req.cookies["user_id"]]["id"]};
  //console.log(" ID from Object ", {longURL: req.body.longURL, userID: users[req.cookies["user_id"]]["id"]})
  //console.log(" urlDatabase  from app.post /urls ", urlDatabase);
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
    //console.log(user.id);
    res.redirect('/urls');
  } else {
    res.send('403: Forbidden Error', 403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
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
  const userLogged = req.cookies["user_id"];
  if (!userLogged) {
    res.send("Please Register or Login!");
    return;
  }
  const newUrlDatabase = urlsForUser(req.cookies["user_id"]);
  const templateVars = { urls: newUrlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

//editing (getting to the edit form)
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  //console.log(" this user ID ", userId);
  let temp = req.params.shortURL;//temp will have the value of shortURL, which is what we type in browser after /urls/:
  if (!userId) {
    // if user is not logged , he will be redirected to the main page again
    return res.redirect('/login');
  }
  if (urlDatabase[temp].userID !== userId) {
    //return res.send(" It is not yours! ");
   return res.render("urls_show",{ shortURL: null, longURL: null, user: users[userId] });
  }
  //let myUrls = urlsForUser(userId);
  //console.log(" this is myUrls ", myUrls);
  let longURL = urlDatabase[temp] && urlDatabase[temp]["longURL"];
  const templateVars = { shortURL: temp, longURL: longURL, user: users[userId] };
 // console.log(" whole urlDatabase ", urlDatabase);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let temp = req.params.shortURL;
 // const longURL = urlDatabase[temp]["longURL"];
  res.redirect(longURL);
});

//Delete or remove an url
app.get("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies["user_id"];
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  //console.log(" from app-post /urls/id ", urlDatabase);
  res.redirect("/urls");// redirecting to the main page after editing or submitting of a new
});
 
app.listen(PORT, () => {
  //console.log(`Example app listening on port ${PORT}!`);
});
