const getUserByEmail = (existingEmail, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === existingEmail) {
      return user;
    }
  }
  return null;
}


const generateRandomString = () => {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length);
    string += alphanumeric.charAt(randomIndex);
  }

  return string;
};

module.exports = {
  getUserByEmail,
  generateRandomString
};