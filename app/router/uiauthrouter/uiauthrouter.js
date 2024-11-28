const express = require('express');
const uiauthcontroller = require('../../controller/uiauthcontroller/uiauthcontroller');
const uploadImage = require('../../helper/imagehandler') // Image handle Area
const router = express.Router();

router.get('/admin/registration', uiauthcontroller.registerGet) // Show Register Form
router.post('/registrationcreate', uploadImage.single('image'), uiauthcontroller.registerPost);
router.get('/admin/signin', uiauthcontroller.loginGet) // Get data in login
router.post('/signincreate', uiauthcontroller.loginPost) // Post data in login
router.get('/adminlogout', uiauthcontroller.logout); // For Logout


module.exports = router; 