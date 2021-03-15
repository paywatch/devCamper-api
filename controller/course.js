const ErrorResponse = require('../utils/errorResponse');
const aysncHandler = require('../moddleware/async');
const Course = require('../models/course');
const Bootcamp = require('../models/Bootcamps');

exports.getCourses = aysncHandler(async (req, res, next) => {

  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId
    });

    return res.status(200).send({
      success: true,
      count: courses.length,
      data: courses
    });

  } else {
    res.status(200).send(res.advancedResults);
  }
});


exports.getCourse = aysncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).send({
    success: true,
    data: course
  });
});

exports.addCourse = aysncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  //Make sure that the user is the owner of the course
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${bootcamp.user} is not authorized to add course to this bootcamp ${bootcamp._id}`, 401))
  }

  const course = await Course.create(req.body);

  res.status(200).send({
    success: true,
    data: course
  });
});

exports.updateCourse = aysncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course find with the given id ${req.params.id}`),
      404
    );
  }

  //Make sure that the user is the owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${course.user} is not authorized to update course ${course._id}`, 401))
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).send({
    success: true,
    data: course
  });
});

exports.deleteCourse = aysncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course find with the given id ${req.params.id}`),
      404
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${course.user} is not authorized to delete course ${course._id}`, 401))
  }

  await course.remove();

  res.status(200).send({
    success: true,
    data: {}
  });
});