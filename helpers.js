// looking for user by email
const findUserByEmail = (email, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  //if not match
  return undefined;
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
  return randomString;
};

// return short url - longurl pair for user
const urlsForUser = function(id) {
  let newUrlDatabase = {};
  for (let key in urlDatabase) {
    let urlObject = urlDatabase[key];
    if (urlObject.userID === id) {
      newUrlDatabase[key] = urlObject;
    }
  }
  return newUrlDatabase;
};

module.exports = { helpers };