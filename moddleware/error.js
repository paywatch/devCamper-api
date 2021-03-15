const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = {
    ...err
  };

  error.message = err.message;

  if (err.name === 'CastError') {
    const message = `Resource not found`
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidatorError') {
    const message = err.errors.map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Server Error'
  });
}

module.exports = errorHandler;