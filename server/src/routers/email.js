const email = require("../controller/email-controller");
const express = require("express");
const router = express.Router();

router.post("/subscribe", email.subscribeEmail);
router.get("/unsubscribe", email.unsubscribeEmail);
router.get("/", email.getEmailList);
router.post("/verify-code", email.verifyCode);

module.exports = router;