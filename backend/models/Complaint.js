const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen is required']
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      trim: true
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    wardNumber: {
      type: Number,
      min: 1,
      default: null
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    attachments: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      trim: true,
      default: 'received'
    },
    assignedToCounselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    forwardedToDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    departmentRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    departmentResolutionAttachments: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
