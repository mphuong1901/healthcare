import HealthLog from '../models/healthLogModel.js';

// @desc    Tạo health log mới
// @route   POST /api/healthLogs
// @access  Private/Patient
const createHealthLog = async (req, res) => {
  try {
    const healthLog = new HealthLog({
      ...req.body,
      patient: req.user._id
    });

    const createdHealthLog = await healthLog.save();
    await createdHealthLog.populate('patient', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Tạo nhật ký sức khỏe thành công',
      data: createdHealthLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách health logs
// @route   GET /api/healthLogs
// @access  Private
const getHealthLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Lọc theo role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Bác sĩ có thể xem logs của bệnh nhân mình điều trị
      // Cần implement logic này dựa trên appointments
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const healthLogs = await HealthLog.find(query)
      .populate('patient', 'fullName email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HealthLog.countDocuments(query);

    res.json({
      success: true,
      data: healthLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy health log theo ID
// @route   GET /api/healthLogs/:id
// @access  Private
const getHealthLogById = async (req, res) => {
  try {
    const healthLog = await HealthLog.findById(req.params.id)
      .populate('patient', 'fullName email');

    if (!healthLog) {
      return res.status(404).json({ message: 'Không tìm thấy nhật ký sức khỏe' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && 
        healthLog.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập nhật ký này' });
    }

    res.json({
      success: true,
      data: healthLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật health log
// @route   PUT /api/healthLogs/:id
// @access  Private
const updateHealthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findById(req.params.id);

    if (!healthLog) {
      return res.status(404).json({ message: 'Không tìm thấy nhật ký sức khỏe' });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin' && 
        healthLog.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền cập nhật nhật ký này' });
    }

    const updatedHealthLog = await HealthLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patient', 'fullName email');

    res.json({
      success: true,
      message: 'Cập nhật nhật ký sức khỏe thành công',
      data: updatedHealthLog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa health log
// @route   DELETE /api/healthLogs/:id
// @access  Private
const deleteHealthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findById(req.params.id);

    if (!healthLog) {
      return res.status(404).json({ message: 'Không tìm thấy nhật ký sức khỏe' });
    }

    // Kiểm tra quyền xóa
    if (req.user.role !== 'admin' && 
        healthLog.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa nhật ký này' });
    }

    await healthLog.deleteOne();

    res.json({
      success: true,
      message: 'Xóa nhật ký sức khỏe thành công'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy thống kê sức khỏe
// @route   GET /api/healthLogs/stats
// @access  Private
const getHealthStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'patient') {
      matchQuery.patient = req.user._id;
    }

    const stats = await HealthLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          latestDate: { $max: '$date' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createHealthLog,
  getHealthLogs,
  getHealthLogById,
  updateHealthLog,
  deleteHealthLog,
  getHealthStats
};