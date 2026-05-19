const Complaint = require("../models/Complaint");

// @desc    Add a new complaint
// @route   POST /api/complaints
// @access  Private
const addComplaint = async (req, res) => {
  const { name, email, title, description, category, location } = req.body;

  try {
    // Validation
    if (!name || !email || !title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      name,
      email,
      title,
      description,
      category,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Complaint stored successfully",
      data: complaint,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getAllComplaints = async (req, res) => {
  try {
    const { category, status } = req.query;
    let filter = {};

    // Non-admins only see their own complaints
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Only owner or admin can view
    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin or owner)
const updateComplaintStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

  try {
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    res.json({
      success: true,
      message: "Updated status shown",
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or owner)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this complaint" });
    }

    await complaint.deleteOne();

    res.json({ success: true, message: "Complaint removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search complaints by location
// @route   GET /api/complaints/search?location=Ghaziabad
// @access  Private
const searchByLocation = async (req, res) => {
  const { location } = req.query;

  try {
    if (!location) {
      return res.status(400).json({ success: false, message: "Location query parameter is required" });
    }

    const filter = {
      location: { $regex: location, $options: "i" }, // case-insensitive search
    };

    // Non-admins only search their own
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Matching complaints displayed",
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
};
