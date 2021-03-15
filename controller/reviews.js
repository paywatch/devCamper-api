const ErrorResponse = require('../utils/errorResponse');
const aysncHandler = require('../moddleware/async');
const Reviews = require('../models/reviews');
const Bootcamp = require('../models/Bootcamps');

exports.getReviews = aysncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Reviews.find({
      bootcamp: req.params.bootcampId
    });

    return res.status(200).send({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).send(res.advancedResults)
  }
});

exports.getSingleReview = aysncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the given id of ${req.params.id}`, 404)
    );
  }

  res.status(200).send({
    success: true,
    data: review
  });
});

exports.addReview = aysncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return new ErrorResponse(`No bootcamp with the given id of ${req.params.bootcampId}`, 404)
  }

  const review = await Reviews.create(req.body);

  res.status(201).send({
    success: true,
    data: review
  });
});

exports.updateReview = aysncHandler(async (req, res, next) => {
  let review = await Reviews.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the given id ${req.params.id}`, 404)
    );
  }

  //Make sure that review belong to logged in user or an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to update review`, 401)
    )
  }

  review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).send({
    success: true,
    data: review
  });
});

exports.deleteReview = aysncHandler(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the given id ${req.params.id}`)
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Un authorized to delete this review ${req.params.id}`)
    );
  }

  await review.remove();

  res.status(200).send({
    success: true,
    data: {}
  });
});