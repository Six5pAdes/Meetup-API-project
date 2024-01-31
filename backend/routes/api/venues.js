const express = require("express");
const requireAuth = require("../../utils/auth");
const { Venue } = require("../../db/models");

const router = express.Router();

// 15. edit venue by id
// require authentication
router.put("/:venueId", async (req, res) => {
  res.json();
});

module.exports = router;
