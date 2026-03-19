const registrationService = require('../services/registrationService');
const authService = require('../services/authService');
const AppError = require('../exceptions/AppError');

const getSuggestions = async (req, res, next) => {
  try {
    const studentId = authService.mockSessions.get(req.sessionId);
    if (!studentId) throw new AppError('Invalid session', 401);

    const suggestions = registrationService.suggestCourses(studentId);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const studentId = authService.mockSessions.get(req.sessionId);
    if (!studentId) throw new AppError('Invalid session', 401);

    const { courses } = req.body;
    if (!courses || !Array.isArray(courses)) {
      throw new AppError('A valid courses array is required', 400);
    }

    const registered = registrationService.registerForCourses(studentId, courses);

    res.status(200).json({
      success: true,
      data: registered
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuggestions,
  register
};
