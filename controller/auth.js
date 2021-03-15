const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const aysncHandler = require('../moddleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');


exports.register = aysncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role
  } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);

  // const token = user.getSingnedJwtToken();

  // res.status(200).send({
  //   success: true,
  //   token
  // });
});


exports.login = aysncHandler(async (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide an email and password`, 400)
    );
  }

  const user = await User.findOne({
    email: email
  }).select('+password');

  if (!user) {
    return next(
      new ErrorResponse(`Invalid Credential`, 401)
    );
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse(`Invalid Credential`, 401)
    );
  }

  sendTokenResponse(user, 200, res);

  // const token = user.getSingnedJwtToken();

  // res.status(200).send({
  //   success: true,
  //   token
  // }); 
});

exports.forgetPassword = aysncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return next(
      new ErrorResponse(`There is no user with the that email`, 404)
    )
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({
    validateBeforeSave: false
  });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;


  const message =
    `You receive this email because you or someone else require
     to reset of password. please make a put request to: \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).send({
      success: true,
      data: 'Email sent'
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({
      validateBeforeSave: false
    });

    return next(
      new ErrorResponse(`Email could not be sent`, 500)
    );
  }

  res.status(200).send({
    success: true,
    data: user
  })
});


exports.getMe = aysncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).send({
    success: true,
    data: user
  })
});

exports.logout = aysncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).send({
    success: true,
    data: {}
  });
});

exports.updateDetails = aysncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findById(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).send({
    success: true,
    data: user
  });
});

exports.updatePassword = aysncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(
      new ErrorResponse(`Password is incorrect`,
        401)
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.resetPassword = aysncHandler(async (req, res, next) => {
  const resetPasswordToken =
    crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return next(
      new ErrorResponse(`Invalid Token`, 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});


const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSingnedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
}