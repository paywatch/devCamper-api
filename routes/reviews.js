const express = require('express');

const {
  getReviews,
  getSingleReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controller/reviews');

const Reviews = require('../models/reviews');

const advancedResults = require('../moddleware/advancedResult');

const {
  protect,
  authorize
} = require('../moddleware/auth');


const router = express.Router({
  mergeParams: true
});


router.route('/')
  .get(advancedResults(Reviews, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)
  .post(protect, authorize('user', 'admin'), addReview);

router.route('/:id')
  .get(getSingleReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;