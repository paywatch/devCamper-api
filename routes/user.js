const express = require('express');
const {
  getUsers,
  getSingleUser,
  addUser,
  updateUser,
  deleteUser
} = require('../controller/user');

const User = require('../models/User');

const router = express.Router({
  mergeParams: true
});

const advancedResult = require('../moddleware/advancedResult');

const {
  protect,
  authorize
} = require('../moddleware/auth');

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResult(User), getUsers)
  .post(addUser);

router.route('/:id')
  .get(getSingleUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;