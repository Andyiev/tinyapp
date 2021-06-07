const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {// the respond page when typing localhost:8080 in browser
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {// getting an object [as an array] of our urlDatabase
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
