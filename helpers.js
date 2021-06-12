const findUserByEmail = (email, users) => {
  for (let user of Object.keys(users)) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  //if not match
  return false;
};

module.exports = { findUserByEmail };