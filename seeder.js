const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({
  path: './config/config.env'
});

const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/course');
const Users = require('./models/User');
const Reviews = require('./models/reviews');


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

const improtData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await Users.create(users);
    await Reviews.create(reviews)
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
}

const deleteData = async () => {

  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log('Data Deleted...'.red.inverse);
    process.exit();

  } catch (err) {
    console.error(err);
  }
}

if (process.argv[2] === '-i') {
  improtData();
} else if (process.argv[2] === '-d') {
  deleteData();
}