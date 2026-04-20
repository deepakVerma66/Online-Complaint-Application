const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing. Add it to backend/.env before using auth APIs.');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: '7d'
    }
  );
};

module.exports = generateToken;
