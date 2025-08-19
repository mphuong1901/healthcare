import Question from '../models/questionModel.js';

// @desc    Tạo câu hỏi mới
// @route   POST /api/questions
// @access  Private/Patient
const createQuestion = async (req, res) => {
  try {
    console.log('=== Creating question ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);

    const question = new Question({
      ...req.body,
      patient: req.user._id,
      status: 'pending'
    });

    const createdQuestion = await question.save();
    await createdQuestion.populate('patient', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: createdQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách câu hỏi cho bác sĩ
// @route   GET /api/questions/doctor
// @access  Private/Doctor
const getDoctorQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName role specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getDoctorQuestions:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy danh sách câu hỏi (bệnh nhân/public)
// @route   GET /api/questions
// @access  Private/Patient or Public
const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName role specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getQuestions:', error);
    res.status(500).json({ message: error.message });
  }
};


const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName doctorInfo');

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    question.views = (question.views || 0) + 1;
    await question.save();

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error("Error getQuestionById:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Trả lời câu hỏi
// @route   PUT /api/questions/:id/answer
// @access  Private/Doctor
const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ message: 'Vui lòng nhập câu trả lời' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    question.answer = answer;
    question.doctor = req.user._id;
    question.status = 'answered';
    question.answeredAt = new Date();

    const updatedQuestion = await question.save();
    await updatedQuestion.populate('patient', 'fullName email');
    await updatedQuestion.populate('doctor', 'fullName role specialization');

    res.json({
      success: true,
      message: 'Trả lời câu hỏi thành công',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error answerQuestion:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Xóa câu hỏi
// @route   DELETE /api/questions/:id
// @access  Private (chỉ admin hoặc chính bệnh nhân tạo câu hỏi)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    // Kiểm tra quyền xóa: admin hoặc chính bệnh nhân
    if (req.user.role !== 'admin' && question.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền xóa câu hỏi này' });
    }

    await question.deleteOne(); // Xóa khỏi DB

    res.json({
      success: true,
      message: 'Xóa câu hỏi thành công'
    });
  } catch (error) {
    console.error('Error deleteQuestion:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });

    if (req.user.role !== 'admin' && question.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền cập nhật câu hỏi này' });
    }

    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    await updatedQuestion.populate('patient', 'fullName').populate('doctor', 'fullName');

    res.json({
      success: true,
      message: 'Cập nhật câu hỏi thành công',
      data: updatedQuestion
    });
  } catch (error) {
    console.error("Error updateQuestion:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  getDoctorQuestions,
  answerQuestion,
  deleteQuestion
};
