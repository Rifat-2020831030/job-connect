const jobStat = require('../controller/job-stat');
const companyList = require('../controller/company-list');
const express = require('express');
const router = express.Router();

router.get('/', jobStat.getJobStats);
router.get('/companies', companyList.getCompanies);

module.exports = router;