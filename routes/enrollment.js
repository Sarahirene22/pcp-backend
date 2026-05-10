import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect, studentOnly, instructorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enroll in a course (Student only)
router.post('/', protect, studentOnly, async (req, res) => {
  const { courseId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Critical Business Rule: Enrollment not allowed after start date
    const currentDate = new Date();
    if (currentDate > course.startDate) {
      return res.status(400).json({ message: 'Enrollment is closed for this course. Start date has passed.' });
    }

    const alreadyEnrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled in this course' });

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View enrolled courses (Student only)
router.get('/my-enrollments', protect, studentOnly, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).populate('course');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View enrolled students for instructor's courses (Instructor only)
router.get('/course/:courseId/students', protect, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('student', 'name email');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
