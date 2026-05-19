/**
 * pageRoutes.js
 *
 * Server-side rendered page routes.
 * These must be registered in server.js BEFORE express.static()
 * so that /photographer/:slug is handled here instead of falling
 * through to the static file directory.
 */

const express    = require("express");
const router     = express.Router();
const { servePhotographerPage } = require("../controllers/photographerPageController");

// Clean SEO-friendly URL for photographer profiles
// e.g. /photographer/john-doe-lahore  or  /photographer/64abc123...
router.get("/photographer/:slug", servePhotographerPage);

module.exports = router;
