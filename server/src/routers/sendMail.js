const express = require('express');
const router = express.Router();

const mailSender = require('../controller/mail-sender');

router.post('/sendMail', mailSender.sendMail);

module.exports = router;