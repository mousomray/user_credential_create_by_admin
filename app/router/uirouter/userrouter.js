const express = require('express');
const usercontroller = require('../../controller/uicontroller/usercontroller');
const { adminAuth } = require('../../middleware/adminauth')
const { userAuth } = require('../../middleware/userauth'); // For UI auth
const uploadImage = require('../../helper/imagehandler') // Image handle Area
const router = express.Router();

router.get('/adduser', adminAuth, usercontroller.adduser);
router.post('/addusercreate', adminAuth, uploadImage.single('image'), usercontroller.adduser);
router.get('/:role/login', usercontroller.login); // For login page
router.post('/:role/logincreate', usercontroller.login); // For login form submission
router.get('/:role/dashboard', userAuth, usercontroller.dashboardpage);//Dynamic user dashboard
router.get('/userlogout', usercontroller.logout); // For Logout

module.exports = router;   