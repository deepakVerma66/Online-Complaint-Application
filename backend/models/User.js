const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const supportedRoles = ['citizen', 'counselor', 'department', 'mayor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: supportedRoles,
      default: 'citizen'
    },
    ward: {
      type: Number,
      min: 1
    },
    area: {
      type: String,
      trim: true,
      default: null
    },
    department: {
      type: String,
      trim: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.matchPassword = async function matchPassword(plainPassword) {
  return this.comparePassword(plainPassword);
};

userSchema.path('ward').validate(function validateWard(value) {
  if (this.role === 'counselor') {
    return Number.isInteger(value) && value > 0;
  }

  return true;
}, 'Ward is required for councillor users.');

userSchema.path('area').validate(function validateArea(value) {
  if (this.role === 'citizen') {
    return typeof value === 'string' && value.trim().length > 0;
  }

  return true;
}, 'Area is required for citizen users.');

const User = mongoose.model('User', userSchema);

module.exports = User;
