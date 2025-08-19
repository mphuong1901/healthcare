import Advice from '../models/adviceModel.js';

// @desc    Lấy danh sách lời khuyên cho bệnh nhân
// @route   GET /api/advice
// @access  Private/Patient
export const getAdvice = async (req, res) => {
  try {
    console.log("👤 req.user:", req.user);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { 
      patient: req.user._id,
      isActive: true
    };

    const advice = await Advice.find(filter)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Advice.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: advice,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách lời khuyên",
      error: error.message
    });
  }
};

// @desc    Lấy lời khuyên theo ID
// @route   GET /api/advice/:id
// @access  Private
export const getAdviceById = async (req, res) => {
  try {
    const advice = await Advice.findById(req.params.id)
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName email')
      .populate('relatedHealthLog')
      .populate('relatedQuestion');

    if (!advice) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lời khuyên"
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role === 'patient' && advice.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập lời khuyên này"
      });
    }

    if (req.user.role === 'doctor' && advice.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập lời khuyên này"
      });
    }

    res.status(200).json({
      success: true,
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin lời khuyên",
      error: error.message
    });
  }
};

// @desc    Đánh dấu lời khuyên đã đọc
// @route   PUT /api/advice/:id/read
// @access  Private/Patient
export const markAdviceAsRead = async (req, res) => {
  try {
    const advice = await Advice.findById(req.params.id);

    if (!advice) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lời khuyên"
      });
    }

    // Kiểm tra quyền
    if (advice.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền thực hiện hành động này"
      });
    }

    advice.isRead = true;
    advice.readAt = new Date();
    await advice.save();

    res.status(200).json({
      success: true,
      message: "Đánh dấu đã đọc thành công",
      data: advice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Không thể đánh dấu đã đọc",
      error: error.message
    });
  }
};

// @desc    Lấy danh sách lời khuyên cho bác sĩ
// @route   GET /api/advice/doctor
// @access  Private/Doctor
export const getDoctorAdvice = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const advices = await Advice.find({ doctor: req.user._id })
      .populate('patient', 'fullName email')  // nếu có patient
      .skip(skip)
      .limit(Number(limit));

    const total = await Advice.countDocuments({ doctor: req.user._id });

    res.json({
      advices,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ getDoctorAdvice error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo lời khuyên mới
// @route   POST /api/advice
// @access  Private/Doctor
export const createAdvice = async (req, res) => {
  try {
    const advice = new Advice({
      ...req.body,
      doctor: req.user._id   
    });

    const createdAdvice = await advice.save();
    await createdAdvice.populate('doctor', 'fullName specialization');

    res.status(201).json({
      success: true,
      message: 'Tạo lời khuyên thành công',
      data: createdAdvice
    });
  } catch (error) {
    console.error("❌ Error creating advice:", error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Cập nhật lời khuyên
// @route   PUT /api/advice/:id
// @access  Private/Doctor
export const updateAdvice = async (req, res) => {
  try {
    const advice = await Advice.findById(req.params.id);

    if (!advice) {
      return res.status(404).json({ message: 'Không tìm thấy lời khuyên' });
    }

    // Kiểm tra quyền cập nhật
    if (req.user.role !== 'admin' && 
        advice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền cập nhật lời khuyên này' });
    }

    const updatedAdvice = await Advice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'fullName doctorInfo');

    res.json({
      success: true,
      message: 'Cập nhật lời khuyên thành công',
      data: updatedAdvice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xóa lời khuyên
// @route   DELETE /api/advice/:id
// @access  Private/Admin
export const deleteAdvice = async (req, res) => {
  try {
    const advice = await Advice.findById(req.params.id);

    if (!advice) {
      return res.status(404).json({ message: 'Không tìm thấy lời khuyên' });
    }

    await advice.deleteOne();

    res.json({
      success: true,
      message: 'Xóa lời khuyên thành công'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy lời khuyên theo category
// @route   GET /api/advice/category/:category
// @access  Public
export const getAdviceByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const advice = await Advice.find({ 
      category, 
      status: 'published' 
    })
      .populate('author', 'fullName doctorInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Advice.countDocuments({ 
      category, 
      status: 'published' 
    });

    res.json({
      success: true,
      data: advice,
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

// XÓA TOÀN BỘ export cuối file
// export {
//   createAdvice,
//   getAdvice,
//   getAdviceById,
//   updateAdvice,
//   deleteAdvice,
//   getAdviceByCategory
// };