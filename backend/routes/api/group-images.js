const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { GroupImage } = require("../../db/models");

const router = express.Router();

// 31. delete group image
// require authentication
// require [proper] authorization
router.delete("/group-images/:imageId", requireAuth, async (req, res) => {
  const destroyGroupImg = await GroupImage.findByPk(req.params.imageId);
  await GroupImage.destroy();
  res.json(destroyGroupImg);
});

module.exports = router;
