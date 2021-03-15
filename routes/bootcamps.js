const express = require('express');
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampInRadius,
  bootcampFileUpload
} = require('../controller/bootcamps');

const {
  protect,
  authorize
} = require('../moddleware/auth');

const courseRouter = require('./courses');
const reviewRouter = require('./reviews');


const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../moddleware/advancedResult');

//Reroute in to other resource route
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampFileUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;