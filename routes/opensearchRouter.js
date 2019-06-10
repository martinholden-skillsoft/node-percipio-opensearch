const express = require('express');

const router = express.Router();

// Import home controller
const opensearchController = require('../controllers/opensearchController');

// Contact routes
router.get('/', opensearchController.opensearchViewAsync);

// Export API routes
module.exports = router;
