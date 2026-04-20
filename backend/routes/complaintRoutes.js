const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadComplaintImages } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/complaintController');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('citizen'),
  uploadComplaintImages.array('attachments', 3),
  createComplaint
);

router.get('/my', authMiddleware, roleMiddleware('citizen'), getMyComplaints);
router.get(
  '/counselor/my',
  authMiddleware,
  roleMiddleware('counselor'),
  getCounselorComplaints
);
router.get(
  '/counselor/summary',
  authMiddleware,
  roleMiddleware('counselor'),
  getCounselorDashboardSummary
);
router.get(
  '/counselor/department-updates',
  authMiddleware,
  roleMiddleware('counselor'),
  getCounselorDepartmentUpdates
);
router.patch(
  '/:complaintId/counselor/forward',
  authMiddleware,
  roleMiddleware('counselor'),
  forwardComplaintToDepartment
);
router.get(
  '/department/summary',
  authMiddleware,
  roleMiddleware('department'),
  getDepartmentDashboardSummary
);
router.get(
  '/department/my',
  authMiddleware,
  roleMiddleware('department'),
  getDepartmentComplaints
);
router.get(
  '/department/history',
  authMiddleware,
  roleMiddleware('department'),
  getDepartmentComplaintHistory
);
router.patch(
  '/:complaintId/department/status',
  authMiddleware,
  roleMiddleware('department'),
  uploadComplaintImages.array('resolutionAttachments', 3),
  updateDepartmentComplaintStatus
);
router.get(
  '/mayor/overview',
  authMiddleware,
  roleMiddleware('mayor'),
  getMayorDashboardOverview
);

module.exports = router;
