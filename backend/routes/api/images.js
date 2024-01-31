const express = require("express");
const requireAuth = require("../../utils/auth");
const { GroupImage, EventImage } = require("../../db/models");

const router = express.Router();

// 31. delete group image
// require authentication
// require [proper] authorization
router.delete("/group-images/:imageId", async (req, res) => {
  res.json();
});

// 32. delete event image
// require authentication
// require [proper] authorization
router.delete("/event-images/:imageId", async (req, res) => {
  res.json();
});

module.exports = router;
