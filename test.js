const urlDatabase = {
  t2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "2jcseb" },
  rsm5xK: { longURL: "http://www.google.com", userID: "user2RandomID" },
  S152tx: { longURL: "http://www.tsn.ca", userID: "user2RandomID" }
};

// const procForDatabase = {
//   t2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "2jcseb" },
  
// }; 
const process = function(object, user_id) {
  let store = {};
  for (let key in object) {
    let urlObject = object[key];
    //console.log(urlObject);
    if (urlObject.userID === user_id) {
      store[key] = urlObject;
    }
  } 
  return store;
}

//process(urlDatabase, "2jcseb");
console.log(process(urlDatabase, "2jcseb"));