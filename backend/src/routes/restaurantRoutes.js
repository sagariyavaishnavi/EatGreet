const express = require('express');
const router = express.Router();
const { getRestaurantDetails, updateRestaurantDetails, createRestaurant, getRestaurantPublic, getAllRestaurants } = require('../controllers/restaurantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getRestaurantDetails)
    .put(protect, admin, updateRestaurantDetails)
    .post(protect, admin, createRestaurant);

router.get('/all', protect, getAllRestaurants);

router.get('/:id', getRestaurantPublic);

module.exports = router;
