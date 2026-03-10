const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/:id', auth, groupController.getGroupById);
router.delete('/:id', auth, groupController.deleteGroup);

module.exports = router;
