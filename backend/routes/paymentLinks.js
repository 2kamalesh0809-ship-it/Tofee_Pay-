const express = require('express');
const router = express.Router();
const paymentLinkController = require('../controllers/paymentLinkController');
const { auth } = require('../middleware/auth');

router.post('/', auth, paymentLinkController.createPaymentLink);
router.get('/', auth, paymentLinkController.getPaymentLinks);
router.get('/:token', paymentLinkController.getPaymentLinkByToken);
router.post('/:token/pay', paymentLinkController.initiatePayment);

module.exports = router;
