const scrapeRunner = require('../controller/scrape-runner');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        console.log('Starting scrape process...');
        const output = await scrapeRunner.runScraper();
        console.log('Scrape process completed successfully.');
        res.status(200).json({ message: 'Scraping completed successfully', data: output });
    } catch (error) {
        console.error('Error running scraper:', error);
        res.status(500).json({ message: 'Error running scraper', error: error.message });
    }
});

module.exports = router;