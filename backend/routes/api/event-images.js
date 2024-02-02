const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { EventImage, Event, Membership } = require("../../db/models");

const router = express.Router();

// 32. delete event image
// require authentication
// require [proper] authorization
router.delete("/:imageId", requireAuth, async (req, res) => {
  const { user } = req;
  const destroyEventImg = await EventImage.findByPk(req.params.imageId);
  if (!destroyEventImg) {
    res.status(404).json({
      message: "Event Image couldn't be found",
    });
  }

  const parentEvent = await EventImage.findByPk(req.params.imageId, {
    include: { model: Event },
  });
  const member = await Membership.findOne({
    where: { userId: user.id, groupId: parentEvent.Event.id },
  });

  if (
    (member && member.status === "co-host") ||
    parentEvent.Event.organizerId === user.id
  ) {
    await destroyEventImg.destroy();
    res.json({
      message: "Successfully deleted",
    });
  } else {
    res.status(403).json({
      message:
        "Current user must be the organizer or 'co-host' of the Group that the Event belongs to",
    });
  }
});

module.exports = router;
