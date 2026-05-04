const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const VooController = require('../controllers/VooController');

router.post('/processar', upload.single('file'), VooController.processarBilhete);
router.get('/', VooController.listar);

module.exports = router;