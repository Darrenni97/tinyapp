const {users} = require('./database/data.js');


const getUserByEmail = (inputEmail, database) => {
  for (let user in database) {
    if (database[user].email === inputEmail) {
      return database[user];
    }
  }
};

// randomize urls
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// checks emails in users
const emailChecker = (input) => {
  for (let user in users) {
    if (users[user].email === input) {
      return true;
    }
  }
};

module.exports = { 
  getUserByEmail,
  generateRandomString,
  emailChecker
};