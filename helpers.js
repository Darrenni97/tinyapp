const getUserByEmail = (inputEmail, database) => {
  for (let user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  }
};

module.exports = { 
  getUserByEmail 
};