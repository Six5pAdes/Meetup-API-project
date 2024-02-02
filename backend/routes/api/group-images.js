const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { GroupImage, Group, Membership } = require("../../db/models");

const router = express.Router();

// 31. delete group image
// require authentication
// require [proper] authorization
router.delete("/:imageId", requireAuth, async (req, res) => {
  const { user } = req;
  const destroyGroupImg = await GroupImage.findByPk(req.params.imageId);
  if (!destroyGroupImg) {
    res.status(404).json({
      message: "Group Image couldn't be found",
    });
  }

  const parentGroup = await GroupImage.findByPk(req.params.imageId, {
    include: { model: Group },
  });
  const member = await Membership.findOne({
    where: { userId: user.id, groupId: parentGroup.Group.id },
  });

  if (
    (member && member.status === "co-host") ||
    parentGroup.Group.organizerId === user.id
  ) {
    await destroyGroupImg.destroy();
    res.json({
      message: "Successfully deleted",
    });
  } else {
    res.status(403).json({
      message: "forbidden",
    });
  }
});

module.exports = router;
