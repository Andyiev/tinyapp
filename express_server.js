const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "S152tx": "http://www.tsn.ca"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2,8);
  //console.log("random", randomString);
  return randomString;
};


app.get("/", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };//new route handler for "hello world" and use res.render() to get this string formated (rendered from another file). 
  res.render("hello_world", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["username"];
  const templateVars = {
    username: userId
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", function(req, res){
  //console.log(req.body);
  res.cookie("username", req.body.username );
  console.log(res.cookies);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  console.log(" req. cookies ",req.cookies);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["username"];
  let temp = req.params.shortURL; //temp will have the value of shortURL, which is what we type in browser after /urls/:
  const templateVars = { shortURL: temp, longURL: urlDatabase[temp], username: userId };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let temp = req.params.shortURL;
  const longURL = urlDatabase[temp];
  res.redirect(longURL);
});

//Delete or remove an url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  //console.log(urlDatabase[shortURL]);// Log the longURL
  //console.log(shortURL);//Log the shorURL
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
