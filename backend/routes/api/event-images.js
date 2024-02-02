const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { EventImage } = require("../../db/models");

const router = express.Router();

// 32. delete event image
// require authentication
// require [proper] authorization
router.delete("/:imageId", requireAuth, async (req, res) => {
  const destroyEventImg = await EventImage.findByPk(req.params.imageId);
  await destroyEventImg.destroy();
  res.json({
    message: "Successfully deleted",
  });
});

module.exports = router;
