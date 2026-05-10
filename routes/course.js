import express from 'express';
import Course from '../models/Course.js';
import { protect, instructorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all courses
router.get('/', protect, async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a course (Instructor only)
router.post('/', protect, instructorOnly, async (req, res) => {
  const { title, description, startDate } = req.body;
  try {
    const course = await Course.create({
      title,
      description,
      startDate,
      instructor: req.user.id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
