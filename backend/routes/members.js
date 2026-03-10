const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { auth } = require('../middleware/auth');

router.post('/', auth, memberController.addMember);
router.get('/', auth, memberController.getMembers);
router.delete('/:id', auth, memberController.deleteMember);

module.exports = router;
