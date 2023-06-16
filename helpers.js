const getUserByEmail = (existingEmail, users) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === existingEmail) {
      return user;
    }
  }
  return null;
}

module.exports = {
  getUserByEmail
};