const email = require("../controller/email-controller");
const express = require("express");
const router = express.Router();

router.post("/subscribe", email.subscribeEmail);
router.post("/unsubscribe", email.unsubscribeEmail);
router.get("/", email.getEmailList);

module.exports = router;