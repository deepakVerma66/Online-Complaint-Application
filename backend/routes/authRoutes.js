const express = require('express');
const {
  registerCitizen,
  loginUser,
  getMe
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerCitizen);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);

module.exports = router;
