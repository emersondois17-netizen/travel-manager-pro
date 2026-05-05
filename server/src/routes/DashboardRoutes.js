const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const DashboardController = require('../controllers/DashboardController');       

router.get('/stats', DashboardController.getStats);

module.exports = router;