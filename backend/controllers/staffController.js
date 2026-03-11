const User = require('../models/User');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Manager only)
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private (Manager only)
const getStaffMember = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Manager only)
const updateStaff = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const staff = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Manager only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
};

