const express = require('express');
const homecontroller = require('../../controller/uicontroller/homecontroller');
const { adminAuth } = require('../../middleware/adminauth'); // For UI auth
const router = express.Router();

router.get('/', adminAuth, homecontroller.home);

module.exports = router; 