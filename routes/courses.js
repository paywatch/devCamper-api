const express = require('express');

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controller/course');

const router = express.Router({
  mergeParams: true
});

const {
  protect,
  authorize
} = require('../moddleware/auth');

const Course = require('../models/course');
const advancedResults = require('../moddleware/advancedResult');


router.route('/')
  .get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
  }), getCourses)
  .post(protect, authorize('publisher', 'admin'), addCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;