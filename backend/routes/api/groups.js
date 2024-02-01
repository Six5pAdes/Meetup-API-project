const express = require("express");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  User,
  Group,
  Venue,
  Event,
  GroupImage,
  EventImage,
  Membership,
  Attendance,
} = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateGroup = [
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 60 })
    .withMessage("Name must be 60 characters or less."),
  check("about")
    .exists({ checkFalsy: true })
    .isLength({ min: 50 })
    .withMessage("About must be 50 characters or more."),
  check("type")
    .exists({ checkFalsy: true })
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person.'"),
  check("private")
    .exists({ checkFalsy: true })
    .isBoolean()
    .withMessage("Private must be a boolean."),
  check("city")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: [" ", "-"] })
    .withMessage("City is required."),
  check("state")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: "-" })
    .withMessage("State is required."),
  handleValidationErrors,
];

// 6. get all groups
router.get("/", async (req, res) => {
  const everyGroup = await Group.unscoped().findAll({
    include: [{ model: Membership }, { model: GroupImage }],
  });
  res.json({
    Groups: everyGroup,
  });
});

// 7. get all groups joined/organized by current user
// require authentication
router.get("/current", requireAuth, async (req, res) => {
  const everyGroup = await Group.unscoped().findAll({
    where: {
      organizerId: req.user.id,
    },
    include: [{ model: Membership }, { model: GroupImage }],
  });
  res.json({
    Groups: everyGroup,
  });
});

// 8. get group details from id
router.get("/:groupId", async (req, res) => {
  const getGroupById = await Group.findByPk(req.params.groupId, {
    include: [{ model: GroupImage }, { model: Membership }, { model: Venue }],
  });

  if (!getGroupById) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  res.json(getGroupById);
});

// 9. create group
// require authentication
router.post("/", requireAuth, validateGroup, async (req, res) => {
  const { user } = req;
  const { name, about, type, private, city, state } = req.body;
  const newGroup = await Group.create({
    organizerId: user.id,
    name,
    about,
    type,
    private,
    city,
    state,
  });
  res.status(201).json(newGroup);
});

// 11. edit group
// require authentication
// require [proper] authorization
router.put("/:groupId", requireAuth, async (req, res) => {
  const { name, about, type, private, city, state } = req.body;

  const editGroup = await Group.findByPk(req.params.groupId);

  if (!editGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  if (name) {
    editGroup.name = name;
  } else editGroup.name;
  if (about) {
    editGroup.about = about;
  } else editGroup.about;
  if (type) {
    editGroup.type = type;
  } else editGroup.type;
  if (private) {
    editGroup.private = private;
  } else editGroup.private;
  if (city) {
    editGroup.city = city;
  } else editGroup.city;
  if (state) {
    editGroup.state = state;
  } else editGroup.state;

  await editGroup.save();
  res.json({
    editGroup,
  });
});

// 12. delete group
// require authentication
// require [proper] authorization
router.delete("/:groupId", requireAuth, async (req, res) => {
  const destroyGroup = await Group.findByPk(req.params.groupId);

  if (!destroyGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }
  await destroyGroup.destroy();
  res.json({ message: "Successfully deleted" });
});

// 10. add image to group based on group id
// require authentication
// require [proper] authorization
router.post("/:groupId/images", requireAuth, async (req, res) => {
  const { url, preview } = req.body;

  const findGroup = await Group.findByPk(req.params.groupId);
  if (!findGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  const newGroupImage = await findGroup.createGroupImage({
    url,
    preview,
  });
  res.json(newGroupImage);
});

// <----------------------------------------------------->

// venue endpoints
// 13. get all group venues by id
// require authentication
router.get("/:groupId/venues", requireAuth, async (req, res) => {
  const getVenueById = await Venue.findByPk(req.params.groupId);
  if (!getVenueById)
    res.status(404).json({ message: "Group couldn't be found" });
  res.json({ Venues: getVenueById });
});

// 14. create new group venue by id
// require authentication
router.post("/:groupId/venues", requireAuth, async (req, res) => {
  const { address, city, state, lat, lng } = req.body;

  const makeNewVenue = await Venue.create({
    groupId: req.params.groupId,
    address,
    city,
    state,
    lat,
    lng,
  });
  if (!makeNewVenue)
    res.status(404).json({ message: "Group couldn't be found" });
  res.json({ Venues: getVenueById });
  res.json(makeNewVenue);
});

// <----------------------------------------------------->

// event endpoints
// 17. get all group events by id
router.get("/:groupId/events", async (req, res) => {
  const getEventsById = await Event.findAll({
    where: { groupId: req.params.groupId },
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "startDate",
      "endDate",
    ],
    include: [
      { model: Attendance },
      { model: EventImage, attributes: [["preview", "previewImage"]] },
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
  });
  if (!getEventsById) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }
  res.json({
    Events: getEventsById,
  });
});

// 19. create group events by id
// require authentication
// require authorization
router.post("/:groupId/events", requireAuth, async (req, res) => {
  const {
    venueId,
    name,
    description,
    type,
    capacity,
    price,
    startDate,
    endDate,
  } = req.body;

  const newEvents = await Event.create({
    venueId,
    groupId: req.params.groupId,
    name,
    description,
    type,
    capacity,
    price,
    startDate,
    endDate,
  });

  if (!newEvents) {
    res.status(404).json({
      message: "Venue couldn't be found",
    });
  }

  res.json(newEvents);
});

// <----------------------------------------------------->

// membership endpoints
// 23. get group members by id
router.get("/:groupId/members", async (req, res) => {
  const getMember = await Membership.findAll({
    where: { groupId: req.params.groupId },
    attributes: ["status"],
    include: {
      model: User,
      attributes: ["id", "firstName", "lastName"],
    },
  });
  if (!getMember) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }
  res.json({ Members: getMember });
});

// 24. request group membership by id
// require authentication
router.post("/:groupId/membership", requireAuth, async (req, res) => {
  const { user } = req;
  const newMember = await Membership.create({
    groupId: req.params.groupId,
    userId: user.id,
    status: "pending",
  });
  if (!newMember) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }
  res.json(newMember);
});

// 25. change membership status for group specified by id
// require authentication
// require [proper] authorization
router.put("/:groupId/membership", requireAuth, async (req, res) => {
  const { memberId, status } = req.body;
  const editMember = await Membership.findOne({
    where: { groupId: req.params.groupId, userId: memberId },
  });
  if (status) {
    editMember.status = status;
  } else editMember.status;
  await editMember.save();
  res.json(editMember);
});

// 26. delete group membership specified by id
// require authentication
// require [proper] authorization
router.delete(
  "/:groupId/membership/:memberId",
  requireAuth,
  async (req, res) => {
    const destroyMember = await Membership.findOne({
      where: { groupId: req.params.groupId, userId: req.params.userId },
    });

    if (!destroyMember) {
      res.status(404).json({
        message: "User couldn't be found",
      });
    }
    await destroyMember.destroy();
    res.json({ message: "Successfully deleted membership from group" });
  }
);

module.exports = router;
