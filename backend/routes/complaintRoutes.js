const express = require("express");
const router = express.Router();
const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

// IMPORTANT: /search must come before /:id to avoid conflict
router.get("/search", protect, searchByLocation);

router.post("/", protect, addComplaint);
router.get("/", protect, getAllComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id", protect, updateComplaintStatus);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
