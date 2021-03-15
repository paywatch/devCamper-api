const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const aysncHandler = require('../moddleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamps');

exports.getBootcamps = aysncHandler(async (req, res, next) => {

  res.status(200).send(res.advancedResults);
  // try {
  //   const bootcamp = await Bootcamp.find();
  //   res.status(200).send({
  //     success: true,
  //     count: bootcamp.length,
  //     data: bootcamp
  //   });
  // }

  // } catch (err) {
  //   // res.status(400).send({
  //   //   success: false,
  //   // });
  //   next(err);
  // }
})

exports.getBootcamp = aysncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).send({
    //   success: false
    // });
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  }

  res.status(200).send({
    success: true,
    data: bootcamp
  });

  // try {
  //   const bootcamp = await Bootcamp.findById(req.params.id);

  //   if (!bootcamp) {
  //     // return res.status(400).send({
  //     //   success: false
  //     // });
  //     return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  //   }

  //   res.status(200).send({
  //     success: true,
  //     data: bootcamp
  //   });
  // } catch (err) {
  //   // res.status(400).send({
  //   //   success: false
  //   // });
  //   next(err);
  // }
});

exports.createBootcamp = aysncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  const publishBootcamp = await Bootcamp.findOne({
    user: req.user.id
  });

  if (publishBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`The user with ID ${req.user.id} has alerady publish bootcamp`, 400)
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).send({
    success: true,
    data: bootcamp
  });

  // try {
  //   const bootcamp = await Bootcamp.create(req.body);
  //   res.status(201).send({
  //     success: true,
  //     data: bootcamp
  //   });
  // } catch (err) {
  //   // res.status(400).send({
  //   //   success: false
  //   // });
  //   next(err);
  // }
});

exports.updateBootcamp = aysncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with given id not found ${req.params.id}`));
  }

  //Make sure that the user is the owner of bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${bootcamp.user} is not authorized to update this bootcamp`, 401)
    )
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).send({
    success: true,
    data: bootcamp
  });

  // try {
  //   const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
  //     new: true,
  //     runValidators: true
  //   });

  //   if (!bootcamp) {
  //     // return res.status(400).send({
  //     //   success: false
  //     // });
  //     return next(new ErrorResponse(`Bootcamp with given id not found ${req.params.id}`));
  //   }

  //   res.status(200).send({
  //     success: true,
  //     data: bootcamp
  //   });
  // } catch (err) {
  //   // res.status(400).send({
  //   //   success: false
  //   // });
  //   next(err);
  // }
});

exports.deleteBootcamp = aysncHandler(async (req, res, next) => {
  //findByIdAndDelet will not trigger middleware;
  // so we user find by id to triger middleware
  //and user remove method after that to delete it 

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // return res.status(400).send({
    //   success: false,
    // });
    return next(new ErrorResponse(`Bootcamp with the given id not found ${req.params.id}`));
  }

  if (req.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${bootcamp.user} is not authorized to delete this bootcamp`, 401)
    )
  }

  bootcamp.remove();

  res.status(200).send({
    success: true,
    data: {}
  });

  // try {
  //   const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  //   if (!bootcamp) {
  //     // return res.status(400).send({
  //     //   success: false,
  //     // });
  //     return next(new ErrorResponse(`Bootcamp with the given id not found ${req.params.id}`));
  //   }

  //   res.status(200).send({
  //     success: true,
  //     data: {}
  //   });
  // } catch (err) {
  //   // res.status(400).send({
  //   //   success: false
  //   // });
  //   next(err);
  // }
});

exports.getBootcampInRadius = aysncHandler(async (req, res, next) => {
  const {
    zipcode,
    distance
  } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calc radius using radians
  // Divide dist by radius of Earth
  //Earth radius =  3,963 mi / 6,387 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], radius
        ]
      }
    }
  });

  res.status(200).send({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

exports.bootcampFileUpload = aysncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the given id ${req.params.id}`),
      404
    );
  }

  if (req.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${bootcamp.user} is not authorized to delete this bootcamp`, 401)
    )
  }

  if (!req.files) {
    return next(
      new ErrorResponse(`Please upload a file`, 400)
    );
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    next(
      new ErrorResponse(`Please upload an image file`, 400)
    );
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      next(
        new ErrorResponse(`Problem with file upload`, 500)
      );
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });

    res.status(200).send({
      success: true,
      data: file.name
    });
  });
});