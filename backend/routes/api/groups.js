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

const validateVenue = [
  check("address")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Street address is required"),
  check("city")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: [" ", "-"] })
    .withMessage("City is required."),
  check("state")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: "-" })
    .withMessage("State is required."),
  check("lat")
    .exists({ checkFalsy: true })
    .isInt({ min: -90 })
    .isInt({ max: 90 })
    .withMessage("Latitude must within -90 and 90 degrees."),
  check("lng")
    .exists({ checkFalsy: true })
    .isInt({ min: -180 })
    .isInt({ max: 180 })
    .withMessage("Longitude must within -180 and 180 degrees."),
  handleValidationErrors,
];

const validateEvent = [
  check("name")
    .exists({ checkFalsy: true })
    .isLength({ max: 60 })
    .withMessage("Name must be 60 characters or less."),
  check("type")
    .exists({ checkFalsy: true })
    .isIn(["Online", "In person"])
    .withMessage("Type must be 'Online' or 'In person.'"),
  check("capacity")
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage("Capacity must be an integer"),
  check("price")
    .exists({ checkFalsy: true })
    .isCurrency({
      require_symbol: false,
      allow_negatives: false,
      require_decimal: false,
    })
    .withMessage("Price is invalid"),
  check("description")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Description is required"),
  check("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date must be in the future"),
  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date is less than start date"),
  handleValidationErrors,
];

// 6. get all groups
router.get("/", async (req, res) => {
  const allMembers = await Membership.findAll({
    order: [["groupId", "ASC"]],
  });
  const everyImage = await GroupImage.findAll({
    order: [["groupId", "ASC"]],
  });

  const everyGroup = await Group.findAll({
    attributes: [
      "id",
      "organizerId",
      "name",
      "about",
      "type",
      "private",
      "city",
      "state",
      "createdAt",
      "updatedAt",
    ],
  });

  const results = [];
  everyGroup.forEach((group) => results.push(group.toJSON()));

  const num = [];
  allMembers.forEach((member) => num.push([member.toJSON()]));
  for (let index = 0; index < results.length; index++) {
    if (num[index] && num[index].length)
      results[index].numMembers = num[index].length;
    if (everyImage[index].url) {
      results[index].previewImage = everyImage[index].url;
    }
  }

  res.json({
    Groups: results,
  });
});

// 7. get all groups joined/organized by current user
// require authentication
router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;
  const allMembers = await Membership.findAll({
    where: { userId: user.id },
    order: [["groupId", "ASC"]],
  });
  const everyImage = await GroupImage.findAll({
    include: { model: Group, where: { organizerId: user.id } },
    order: [["groupId", "ASC"]],
  });

  const everyGroup = await Group.findAll({
    where: { organizerId: user.id },
    attributes: [
      "id",
      "organizerId",
      "name",
      "about",
      "type",
      "private",
      "city",
      "state",
      "createdAt",
      "updatedAt",
    ],
  });

  const results = [];
  everyGroup.forEach((group) => results.push(group.toJSON()));

  const num = [];
  allMembers.forEach((member) => num.push([member.toJSON()]));
  for (let index = 0; index < results.length; index++) {
    if (num[index] && num[index].length)
      results[index].numMembers = num[index].length;
    if (everyImage[index].url) {
      results[index].previewImage = everyImage[index].url;
    }
  }

  res.json({
    Groups: results,
  });
});

// 8. get group details from id
router.get("/:groupId", async (req, res) => {
  const getGroupById = await Group.findByPk(req.params.groupId);

  if (!getGroupById) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  const allMembers = await Membership.findAll({
    where: { groupId: req.params.groupId },
  });
  const everyImage = await GroupImage.findAll({
    where: { groupId: req.params.groupId },
    attributes: ["id", "url", "preview"],
  });
  const getOrganizer = await User.findOne({
    where: { id: getGroupById.organizerId },
    attributes: ["id", "firstName", "lastName"],
  });
  const getVenue = await Venue.findAll({
    where: { groupId: req.params.groupId },
    attributes: ["id", "groupId", "address", "city", "state", "lat", "lng"],
  });
  const wholeGroup = getGroupById.toJSON();

  res.json({
    ...wholeGroup,
    numMembers: allMembers,
    GroupImages: everyImage,
    Organizer: getOrganizer,
    Venues: getVenue,
  });
});

// 9. create group
// require authentication
router.post("/", [requireAuth, validateGroup], async (req, res) => {
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
router.put("/:groupId", [requireAuth, validateGroup], async (req, res) => {
  const { user } = req;
  const { name, about, type, private, city, state } = req.body;

  const editGroup = await Group.findByPk(req.params.groupId);
  if (!editGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }
  if (editGroup.organizerId !== user.id) {
    res.status(403).json({
      message: "forbidden",
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
  const { user } = req;
  const destroyGroup = await Group.findByPk(req.params.groupId);
  if (!destroyGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  if (destroyGroup.organizerId === user.id) {
    await destroyGroup.destroy();
    res.json({ message: "Successfully deleted" });
  } else {
    res.status(403).json({
      message: "forbidden",
    });
  }
});

// 10. add image to group based on group id
// require authentication
// require [proper] authorization
router.post("/:groupId/images", requireAuth, async (req, res) => {
  const { user } = req;
  const { url, preview } = req.body;

  const findGroup = await Group.findByPk(req.params.groupId);
  if (!findGroup) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  if (findGroup.organizerId !== user.id) {
    res.status(403).json({
      message: "forbidden",
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
  const { user } = req;
  const getGroupById = await Group.findByPk(req.params.groupId);
  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: req.params.groupId },
  });
  if (!getGroupById)
    res.status(404).json({ message: "Group couldn't be found" });

  if (
    (memberValidate && memberValidate.status === "co-host") ||
    getGroupById.organizerId === user.id
  ) {
    const getVenueByGroupId = await getGroupById.getVenues();
    const results = [];
    getVenueByGroupId.forEach((result) => results.push(result.toJSON()));
    res.json({ Venues: results });
  } else {
    res.status(403).json({
      message: "forbidden",
    });
  }
});

// 14. create new group venue by id
// require authentication
router.post(
  "/:groupId/venues",
  [requireAuth, validateVenue],
  async (req, res) => {
    const { user } = req;
    const { address, city, state, lat, lng } = req.body;

    const getGroupById = await Group.findByPk(req.params.groupId);
    if (!getGroupById)
      res.status(404).json({ message: "Group couldn't be found" });

    const memberValidate = await Membership.findOne({
      where: { userId: user.id, groupId: req.params.groupId },
    });

    if (
      (memberValidate && memberValidate.status === "co-host") ||
      getGroupById.organizerId === user.id
    ) {
      const makeNewVenue = await getGroupById.createVenue({
        address,
        city,
        state,
        lat,
        lng,
      });
      res.json(makeNewVenue);
    } else {
      res.status(403).json({
        message: "forbidden",
      });
    }
  }
);

// <----------------------------------------------------->

// event endpoints
// 17. get all group events by id
router.get("/:groupId/events", async (req, res) => {
  const getGroupsById = await Group.findByPk(req.params.groupId);
  if (!getGroupsById) {
    res.status(404).json({
      message: "Group couldn't be found",
    });
  }

  const numAttending = await Attendance.findAll({
    order: [["eventId", "ASC"]],
  });
  const everyImage = await EventImage.findAll({
    order: [["eventId", "ASC"]],
  });
  const getGroupsAndVenues = await Event.findAll({
    include: [
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
  });

  const getEvent = await Event.findAll({
    where: { groupId: getGroupsById.id },
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "startDate",
      "endDate",
    ],
  });

  let results = [];
  getEvent.forEach((event) => results.push(event.toJSON()));

  const num = [];
  numAttending.forEach((attendee) => num.push([attendee.toJSON()]));

  for (let index = 0; index < results.length; index++) {
    results[index].numAttending = num[index].length;
    if (everyImage[index].url) {
      results[index].previewImage = everyImage[index].url;
    }
    results[index].Group = getGroupsAndVenues[index].Group;
    if (getGroupsAndVenues[index].Venue) {
      results[index].Venue = getGroupsAndVenues[index].Venue;
    }
  }

  res.json({
    Events: results,
  });
});

// 19. create group events by id
// require authentication
// require authorization
router.post(
  "/:groupId/events",
  [requireAuth, validateEvent],
  async (req, res) => {
    const { user } = req;
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

    const getVenueById = await Venue.findByPk(venueId);
    if (!getVenueById) {
      res.status(404).json({
        message: "Venue couldn't be found",
      });
    }
    const getGroupById = await Group.findByPk(req.params.groupId);
    if (!getGroupById) {
      res.status(404).json({
        message: "Group couldn't be found",
      });
    }

    const memberValidate = await Membership.findOne({
      where: { userId: user.id, groupId: req.params.groupId },
    });
    const organizerValidate = await Group.findOne({
      where: { organizerId: user.id },
    });

    if (
      (memberValidate && memberValidate.status === "co-host") ||
      (organizerValidate &&
        organizerValidate.organizerId === getGroupById.groupId)
    ) {
      const newEvents = await Event.create({
        venueId,
        groupId: req.params.groupId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate,
      });
      res.json(newEvents);
    } else {
      res.status(403).json({
        message: "forbidden",
      });
    }
  }
);

// <----------------------------------------------------->

// membership endpoints
// 23. get group members by id
router.get("/:groupId/members", async (req, res) => {
  const { user } = req;
  const getGroupById = await Group.findByPk(req.params.groupId);
  if (!getGroupById)
    res.status(404).json({ message: "Group couldn't be found" });
  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: getGroupById.id },
  });
  const organizerValidate = await Group.findOne({
    where: { organizerId: user.id },
  });

  if (
    (memberValidate && memberValidate.status === "co-host") ||
    (organizerValidate &&
      organizerValidate.organizerId === getGroupById.organizerId)
  ) {
    const getMember = await Membership.findAll({
      where: { groupId: req.params.groupId },
      attributes: ["status"],
      include: {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
    });
    res.json({ Members: getMember });
  } else {
    const getMember = await User.findAll({
      attributes: ["id", "firstName", "lastName"],
      include: {
        model: Membership,
        where: { groupId: getGroupById.id },
        status: ["co-host", "organizer", "member"],
      },
    });
    res.json({ Members: getMember });
  }
});

// 24. request group membership by id
// require authentication
router.post("/:groupId/membership", requireAuth, async (req, res) => {
  const { user } = req;
  const getGroupById = await Group.findByPk(req.params.groupId);
  if (!getGroupById)
    res.status(404).json({ message: "Group couldn't be found" });

  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: getGroupById.id },
  });
  if (memberValidate) {
    if (memberValidate.status === "pending") {
      res.status(400).json({
        message: "Membership has already been requested",
      });
    }
    if (
      memberValidate.status === "co-host" ||
      memberValidate.status === "organizer" ||
      memberValidate.status === "member"
    ) {
      res.status(400).json({
        message: "User is already a member of the group",
      });
    }
  }

  const newMember = await Membership.create({
    groupId: req.params.groupId,
    userId: user.id,
    status: "pending",
  });
  res.json({
    memberId: newMember.userId,
    status: newMember.status,
  });
});

// 25. change membership status for group specified by id
// require authentication
// require [proper] authorization
router.put("/:groupId/membership", requireAuth, async (req, res) => {
  const { user } = req;
  const { memberId, status } = req.body;

  const getGroupById = await Group.findByPk(req.params.groupId);
  if (!getGroupById)
    res.status(404).json({ message: "Group couldn't be found" });
  const getUserById = await User.findByPk(memberId);
  if (!getUserById) res.status(404).json({ message: "User couldn't be found" });
  const getMemberById = await Membership.findOne({
    where: { groupId: getGroupById.id, userId: getUserById.id },
  });
  if (!getMemberById)
    res.status(404).json({
      message: "Membership between the user and the group does not exist",
    });

  const editMember = await Membership.findOne({
    where: { groupId: req.params.groupId, userId: memberId },
  });
  if (status && status === "pending") {
    res.status(400).json({
      message: "Bad Request",
      errors: {
        status: "Cannot change a membership status to pending",
      },
    });
  }
  if (status && status === "member") {
    if (
      (editMember && editMember.status === "co-host") ||
      user.id === getGroupById.organizerId
    ) {
      if (status) changeMember.status = status;
      else changeMember.status;
      await changeMember.save();
      res.json(changeMember);
    } else {
      return res.status(403).json({
        message: "forbidden",
      });
    }
  }
  if (status && status === "co-host") {
    if (user.id === getGroupById.organizerId) {
      if (status) changeMember.status = status;
      else changeMember.status;
      await changeMember.save();
      res.json(changeMember);
    } else {
      return res.status(403).json({
        message: "forbidden",
      });
    }
  }
});

// 26. delete group membership specified by id
// require authentication
// require [proper] authorization
router.delete(
  "/:groupId/membership/:memberId",
  requireAuth,
  async (req, res) => {
    const { user } = req;
    const getMemberById = await User.findByPk(req.params.memberId);
    if (!getMemberById)
      res.status(404).json({ message: "User couldn't be found" });
    const getGroupById = await Group.findByPk(req.params.groupId);
    if (!getGroupById)
      res.status(404).json({ message: "Group couldn't be found" });

    const destroyMember = await Membership.findOne({
      where: { groupId: req.params.groupId, userId: req.params.memberId },
    });
    if (!destroyMember) {
      res.status(404).json({
        message: "Membership does not exist for this User",
      });
    }

    const userMembership = await Membership.findOne({
      where: { userId: user.id, groupId: getGroupById.id },
    });
    if (
      userMembership.userId === destroyMember.userId ||
      user.id === getGroupById.organizerId
    ) {
      await destroyMember.destroy();
      res.json({ message: "Successfully deleted membership from group" });
    } else {
      res.status(403).json({
        message: "forbidden",
      });
    }
  }
);

module.exports = router;
