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

// Generating random string for user's id and urls id
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2,8);
  return randomString;
};

module.exports = { findUserByEmail, generateRandomString };