const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { resolveCounselorAssignment } = require('../utils/resolveCounselorAssignment');

const buildAuthResponse = (user, message) => {
  const sanitizedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ward: user.ward,
    area: user.area,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return {
    success: true,
    message,
    token: generateToken(user),
    user: sanitizedUser
  };
};

const registerCitizen = async (req, res) => {
  try {
    const { name, email, password, area, locality, ward } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const resolvedArea = area?.trim() || locality?.trim();
    const requestedWard = Number.isInteger(Number(ward)) ? Number(ward) : null;
    const assignment = resolveCounselorAssignment({
      area: resolvedArea,
      ward: requestedWard
    });

    if (!name?.trim() || !normalizedEmail || !password || !resolvedArea) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and area are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'A valid ward could not be resolved for the selected area'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'citizen',
      area: resolvedArea,
      ward: assignment.ward,
      isActive: true
    });

    return res.status(201).json(buildAuthResponse(user, 'Citizen registration successful'));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register citizen'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This user account is inactive'
      });
    }

    return res.status(200).json(buildAuthResponse(user, 'Login successful'));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to login user'
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Current user fetched successfully',
    user: req.user
  });
};

module.exports = {
  registerCitizen,
  loginUser,
  getMe
};
