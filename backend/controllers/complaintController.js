const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { resolveCounselorAssignment } = require('../utils/resolveCounselorAssignment');

const populateComplaintRelations = (query) =>
  query
    .populate('citizen', 'name area ward')
    .populate('assignedToCounselor', 'name ward')
    .populate('forwardedToDepartment', 'name department');

const getResolutionAttachments = (files = []) =>
  files.map((file) => `uploads/complaints/${file.filename}`);

const buildCounselorSummary = (complaints) => {
  return complaints.reduce(
    (summary, complaint) => {
      if (complaint.status === 'received') {
        summary.totalAssigned += 1;
      }

      if (complaint.status === 'acknowledged') {
        summary.acknowledged += 1;
      }

      if (complaint.status === 'resolved' || complaint.status === 'completed') {
        summary.resolved += 1;
      }

      if (complaint.status === 'forwarded_to_department') {
        summary.forwardedToDepartment += 1;
      }

      if (complaint.status === 'in_progress') {
        summary.inProgress += 1;
      }

      return summary;
    },
    {
      totalAssigned: 0,
      acknowledged: 0,
      resolved: 0,
      forwardedToDepartment: 0,
      inProgress: 0
    }
  );
};

const buildDepartmentSummary = (complaints) => {
  return complaints.reduce(
    (summary, complaint) => {
      if (complaint.status === 'forwarded_to_department') {
        summary.totalAssigned += 1;
      }

      if (complaint.status === 'acknowledged') {
        summary.acknowledged += 1;
      }

      if (complaint.status === 'in_progress') {
        summary.inProgress += 1;
      }

      if (complaint.status === 'resolved' || complaint.status === 'completed') {
        summary.resolved += 1;
      }

      return summary;
    },
    {
      totalAssigned: 0,
      acknowledged: 0,
      inProgress: 0,
      resolved: 0
    }
  );
};

const buildMayorDashboardOverview = (complaints) => {
  const summary = {
    totalComplaints: 0,
    acknowledgedComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0
  };
  const wardMetricsMap = new Map();

  complaints.forEach((complaint) => {
    const wardNumber = complaint.wardNumber;

    summary.totalComplaints += 1;

    if (complaint.status === 'acknowledged') {
      summary.acknowledgedComplaints += 1;
    }

    if (complaint.status === 'resolved' || complaint.status === 'completed') {
      summary.resolvedComplaints += 1;
    } else if (complaint.status === 'in_progress') {
      summary.inProgressComplaints += 1;
    } else {
      summary.pendingComplaints += 1;
    }

    if (!Number.isInteger(wardNumber)) {
      return;
    }

    if (!wardMetricsMap.has(wardNumber)) {
      wardMetricsMap.set(wardNumber, {
        wardNumber,
        totalComplaints: 0,
        acknowledgedComplaints: 0,
        resolvedComplaints: 0,
        pendingComplaints: 0,
        inProgressComplaints: 0
      });
    }

    const wardMetrics = wardMetricsMap.get(wardNumber);
    wardMetrics.totalComplaints += 1;

    if (complaint.status === 'acknowledged') {
      wardMetrics.acknowledgedComplaints += 1;
    }

    if (complaint.status === 'resolved' || complaint.status === 'completed') {
      wardMetrics.resolvedComplaints += 1;
    } else if (complaint.status === 'in_progress') {
      wardMetrics.inProgressComplaints += 1;
    } else {
      wardMetrics.pendingComplaints += 1;
    }
  });

  return {
    summary,
    wardMetrics: Array.from(wardMetricsMap.values())
  };
};

const findDepartmentHead = async () => {
  return User.findOne({
    role: 'department',
    isActive: true
  }).select('_id name department');
};

const createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Only citizens can post complaints'
      });
    }

    const title = req.body.title?.trim();
    const category = req.body.category?.trim();
    const description = req.body.description?.trim();
    const landmark = req.body.landmark?.trim() || '';
    const resolvedArea = req.user.area?.trim();
    const assignment = resolveCounselorAssignment({
      area: resolvedArea,
      ward: req.user.ward
    });

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and description are required'
      });
    }

    if (!resolvedArea) {
      return res.status(400).json({
        success: false,
        message: 'Citizen area is missing in profile'
      });
    }

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Unable to resolve the responsible counselor for this citizen area'
      });
    }

    const assignedCounselor = await User.findOne({
      role: 'counselor',
      ward: assignment.ward,
      isActive: true
    }).select('_id name ward');

    if (!assignedCounselor) {
      return res.status(404).json({
        success: false,
        message: 'No active counselor found for the resolved ward'
      });
    }

    const attachments = getResolutionAttachments(req.files || []);

    const complaint = await Complaint.create({
      citizen: req.user._id,
      title,
      category,
      description,
      wardNumber: assignment.ward,
      landmark,
      area: resolvedArea,
      attachments,
      status: 'received',
      assignedToCounselor: assignedCounselor._id
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create complaint'
    });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    const complaints = await populateComplaintRelations(
      Complaint.find({ citizen: req.user._id })
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

const getCounselorComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'counselor') {
      return res.status(403).json({
        success: false,
        message: 'Only councillor accounts can view assigned complaints'
      });
    }

    const complaints = await populateComplaintRelations(
      Complaint.find({
        assignedToCounselor: req.user._id,
        status: 'received'
      })
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned complaints'
    });
  }
};

const getCounselorDepartmentUpdates = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'counselor') {
      return res.status(403).json({
        success: false,
        message: 'Only councillor accounts can view department updates'
      });
    }

    const complaints = await populateComplaintRelations(
      Complaint.find({
        assignedToCounselor: req.user._id,
        status: { $in: ['forwarded_to_department', 'acknowledged', 'in_progress', 'resolved'] }
      })
    ).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department updates'
    });
  }
};

const getCounselorDashboardSummary = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'counselor') {
      return res.status(403).json({
        success: false,
        message: 'Only councillor accounts can view dashboard summary'
      });
    }

    const complaints = await Complaint.find(
      { assignedToCounselor: req.user._id },
      'status'
    );

    return res.status(200).json({
      success: true,
      summary: buildCounselorSummary(complaints)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary'
    });
  }
};

const forwardComplaintToDepartment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'counselor') {
      return res.status(403).json({
        success: false,
        message: 'Only councillor accounts can forward complaints'
      });
    }

    const complaint = await Complaint.findById(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (String(complaint.assignedToCounselor) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only forward complaints assigned to your account'
      });
    }

    const departmentHead = await findDepartmentHead();

    if (!departmentHead) {
      return res.status(404).json({
        success: false,
        message: 'No active department head found to receive this complaint'
      });
    }

    complaint.forwardedToDepartment = departmentHead._id;
    complaint.status = 'forwarded_to_department';

    await complaint.save();

    const updatedComplaint = await populateComplaintRelations(
      Complaint.findById(complaint._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Complaint forwarded to department successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to forward complaint to department'
    });
  }
};

const getDepartmentDashboardSummary = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'department') {
      return res.status(403).json({
        success: false,
        message: 'Only department accounts can view dashboard summary'
      });
    }

    const complaints = await Complaint.find(
      { forwardedToDepartment: req.user._id },
      'status'
    );

    return res.status(200).json({
      success: true,
      summary: buildDepartmentSummary(complaints)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department dashboard summary'
    });
  }
};

const getDepartmentComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'department') {
      return res.status(403).json({
        success: false,
        message: 'Only department accounts can view assigned complaints'
      });
    }

    const complaints = await populateComplaintRelations(
      Complaint.find({
        forwardedToDepartment: req.user._id,
        status: { $ne: 'resolved' }
      })
    ).sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department complaints'
    });
  }
};

const getDepartmentComplaintHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'department') {
      return res.status(403).json({
        success: false,
        message: 'Only department accounts can view complaint history'
      });
    }

    const complaints = await populateComplaintRelations(
      Complaint.find({
        forwardedToDepartment: req.user._id,
        status: 'resolved'
      })
    ).sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint history'
    });
  }
};

const getMayorDashboardOverview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'mayor') {
      return res.status(403).json({
        success: false,
        message: 'Only mayor accounts can view dashboard overview'
      });
    }

    const complaints = await Complaint.find({}, 'status wardNumber');
    const overview = buildMayorDashboardOverview(complaints);

    return res.status(200).json({
      success: true,
      ...overview
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mayor dashboard overview'
    });
  }
};

const updateDepartmentComplaintStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication is required'
      });
    }

    if (req.user.role !== 'department') {
      return res.status(403).json({
        success: false,
        message: 'Only department accounts can update complaint status'
      });
    }

    const nextStatus = req.body.status?.trim();
    const departmentRemarks = req.body.departmentRemarks?.trim() || '';
    const allowedStatuses = ['acknowledged', 'in_progress', 'resolved'];

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be acknowledged, in_progress, or resolved'
      });
    }

    const complaint = await Complaint.findById(req.params.complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (String(complaint.forwardedToDepartment) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update complaints forwarded to your department account'
      });
    }

    if (complaint.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Resolved complaints cannot be updated again'
      });
    }

    if (nextStatus === 'resolved' && !departmentRemarks) {
      return res.status(400).json({
        success: false,
        message: 'Officer remarks are required before resolving a complaint'
      });
    }

    complaint.status = nextStatus;

    if (nextStatus === 'resolved') {
      complaint.departmentRemarks = departmentRemarks;
      complaint.departmentResolutionAttachments = getResolutionAttachments(req.files || []);
    } else {
      complaint.departmentRemarks = '';
      complaint.departmentResolutionAttachments = [];
    }

    await complaint.save();

    const updatedComplaint = await populateComplaintRelations(
      Complaint.findById(complaint._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getCounselorComplaints,
  getCounselorDepartmentUpdates,
  getCounselorDashboardSummary,
  forwardComplaintToDepartment,
  getDepartmentDashboardSummary,
  getDepartmentComplaints,
  getDepartmentComplaintHistory,
  updateDepartmentComplaintStatus,
  getMayorDashboardOverview
};
