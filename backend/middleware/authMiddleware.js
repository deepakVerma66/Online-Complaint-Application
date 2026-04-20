const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is missing'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is missing in environment configuration'
      });
    }

    const decodedToken = jwt.verify(token, jwtSecret);
    const user = await User.findById(decodedToken.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found for this token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const isExpiredToken = error.name === 'TokenExpiredError';

    return res.status(401).json({
      success: false,
      message: isExpiredToken ? 'Token has expired' : 'Invalid authorization token'
    });
  }
};

module.exports = authMiddleware;
