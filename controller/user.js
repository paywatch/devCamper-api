const ErrorResponse = require('../utils/errorResponse');
const aysncHandler = require('../moddleware/async');
const User = require('../models/User');
const advancedResults = require('../moddleware/advancedResult');


exports.getUsers = aysncHandler(async (req, res, next) => {
  res.status(200).send(res.advancedResults);
});

exports.getSingleUser = aysncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).send({
    success: true,
    data: user
  });
});

exports.addUser = aysncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).send({
    success: true,
    data: user
  });
});

exports.updateUser = aysncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).send({
    success: true,
    data: user
  });
});

exports.deleteUser = aysncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).send({
    success: true,
    data: {}
  });
});