const express = require('express');

const router = express.Router();

// Contact routes
router.get('/', (req, res) => {
  // The optional first parameter to `res.redirect()` is a numeric
  // HTTP status.
  res.redirect(301, '/opensearch?searchTerms=leadership');
});

// Export API routes
module.exports = router;
