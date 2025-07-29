const express = require('express');
const JobController = require('../controller/job-controller');

const router = express.Router();

router.get('/', JobController.getJobs);
router.get('/:id', JobController.getJobById);

module.exports = router;