const express = require('express');
const uiauthcontroller = require('../../controller/uiauthcontroller/uiauthcontroller');
const uploadImage = require('../../helper/imagehandler') // Image handle Area
const router = express.Router();

router.get('/admin/registration', uiauthcontroller.register) // Show Register Form
router.post('/registrationcreate', uploadImage.single('image'), uiauthcontroller.register);
router.get('/admin/signin', uiauthcontroller.login) // Get data in login
router.post('/signincreate', uiauthcontroller.login) // Post data in login
router.get('/adminlogout', uiauthcontroller.logout); // For Logout


module.exports = router; 