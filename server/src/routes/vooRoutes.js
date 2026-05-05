const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const VooController = require('../controllers/VooController');

router.post('/processar', upload.single('file'), VooController.processarBilhete);
router.get('/', VooController.listar);
router.get('/:id/sincronizar', VooController.sincronizarStatus);
router.put('/:id', VooController.atualizar);
router.delete('/:id', VooController.excluir);

module.exports = router;