const express = require("express");
const { requireAuth } = require("../../utils/auth");
const {
  Group,
  Venue,
  Event,
  EventImage,
  Attendance,
  User,
  Membership,
} = require("../../db/models");
const { Op } = require("sequelize");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

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

// 16. get all events
router.get("/", async (req, res) => {
  // 33. add query filters to get all events
  let { page, size, name, type, startDate } = req.query;
  if (page) page = parseInt(page);
  else page = 1;
  if (size) size = parseInt(size);
  else size = 20;
  if (isNaN(page)) page = 1;
  if (isNaN(size)) size = 20;
  let pagination = {
    limit: size,
    offset: size * (page - 1),
  };

  let where = {};
  if (name) {
    where.name = { [Op.substring]: name };
  } else where.name;
  if (type) {
    where.type = { [Op.substring]: type };
  } else where.type;
  if (startDate) {
    where.startDate = { [Op.substring]: startDate };
  } else where.startDate;

  const numAttending = await Attendance.count({ group: "eventId" });
  const everyImage = await EventImage.findAll({
    group: "eventId",
  });
  const getGroupsAndVenues = await Event.findAll({
    include: [
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
    group: "event.id",
  });

  const everyEvent = await Event.findAll({
    where,
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "startDate",
      "endDate",
    ],
    ...pagination,
  });

  const results = [];
  everyEvent.forEach((event) => results.push(event.toJSON()));

  for (let index = 0; index < results.length; index++) {
    results[index].numAttending = numAttending[index].count;
    results[index].previewImage = everyImage[index].url;
    results[index].Group = getGroupsAndVenues[index].Group;
    results[index].Venue = getGroupsAndVenues[index].Venue;
  }

  res.json({
    Events: results,
  });
});

// 18. get event details by id
router.get("/:eventId", async (req, res) => {
  const getEventsById = await Event.findByPk(req.params.eventId, {
    attributes: [
      "id",
      "groupId",
      "venueId",
      "name",
      "type",
      "capacity",
      "price",
      "startDate",
      "endDate",
    ],
  });

  if (!getEventsById) {
    res.status(404).json({
      message: "Event couldn't be found",
    });
  }

  const numAttending = await Attendance.count({
    where: { eventId: req.params.eventId },
  });
  const everyImage = await EventImage.findOne({
    where: { eventId: req.params.eventId },
  });
  const getGroupsAndVenues = await Event.findByPk(req.params.eventId, {
    include: [
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
    group: "event.id",
  });

  const results = getEventsById.toJSON();
  results.numAttending = numAttending;
  results.Group = getGroupsAndVenues.Group;
  results.Venue = getGroupsAndVenues.Venue;
  results.everyImage = everyImage;

  res.json(results);
});

// 21. edit event by id
// require authentication
// require authorization
router.put("/:eventId", [requireAuth, validateEvent], async (req, res) => {
  const { user } = req;
  const {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  } = req.body;

  const editVenue = await Venue.findByPk(venueId);
  if (!editVenue) {
    res.status(404).json({
      message: "Venue couldn't be found",
    });
  }
  const editEvent = await Event.findByPk(req.params.eventId);
  if (!editEvent) {
    res.status(404).json({
      message: "Event couldn't be found",
    });
  }

  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: editEvent.groupId },
  });
  const organizerValidate = await Group.findOne({
    where: { organizerId: user.id },
  });

  if (
    (memberValidate && memberValidate.status === "co-host") ||
    (organizerValidate && organizerValidate.organizerId === user.id)
  ) {
    if (venueId) {
      editEvent.venueId = venueId;
    } else editEvent.venueId;
    if (name) {
      editEvent.name = name;
    } else editEvent.name;
    if (type) {
      editEvent.type = type;
    } else editEvent.type;
    if (capacity) {
      editEvent.capacity = capacity;
    } else editEvent.capacity;
    if (price) {
      editEvent.price = price;
    } else editEvent.price;
    if (description) {
      editEvent.description = description;
    } else editEvent.description;
    if (startDate) {
      editEvent.startDate = startDate;
    } else editEvent.startDate;
    if (endDate) {
      editEvent.endDate = endDate;
    } else editEvent.endDate;

    await editEvent.save();
    res.json(editEvent);
  } else {
    res.status(403).json({
      message:
        "Current User must be the organizer of the group or a member of the group with a status of 'co-host'",
    });
  }
});

// 22. delete event by id
// require authentication
// require authorization
router.delete("/:eventId", requireAuth, async (req, res) => {
  const { user } = req;
  const destroyEvent = await Event.findByPk(req.params.eventId);
  if (!destroyEvent) {
    res.status(404).json({
      message: "Event couldn't be found",
    });
  }

  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: destroyEvent.groupId },
  });
  const organizerValidate = await Group.findOne({
    where: { organizerId: user.id },
  });

  if (
    (memberValidate && memberValidate.status === "co-host") ||
    (organizerValidate && organizerValidate.organizerId === user.id)
  ) {
    await destroyEvent.destroy();
    res.json({ message: "Successfully deleted" });
  } else {
    res.status(403).json({
      message:
        "Current User must be the organizer of the group or a member of the group with a status of 'co-host'",
    });
  }
});

// 20. add image to event based on id
// require authentication
// require [proper] authorization
router.post("/:eventId/images", requireAuth, async (req, res) => {
  const { url, preview } = req.body;

  const findEvent = await Event.findByPk(req.params.eventId);
  if (!findEvent) {
    res.status(404).json({
      message: "Event couldn't be found",
    });
  }
  if (findGroup.organizerId !== user.id) {
    res.status(403).json({
      message: "Current User must be the organizer for the group",
    });
  }

  const newEventImage = await findEvent.createEventImage({
    url,
    preview,
  });
  res.json(newEventImage);
});

// <----------------------------------------------------->

// attendance endpoints
// 27. get all event attendees by id
router.get("/:eventId/attendees", async (req, res) => {
  const { user } = req;
  const { userId, status } = req.body;
  const getAttendee = await Attendance.findAll({
    where: { eventId: req.params.eventId },
    attributes: ["status"],
    include: {
      model: User,
      attributes: ["id", "firstName", "lastName"],
    },
  });
  if (!getAttendee) {
    res.status(404).json({
      message: "Event couldn't be found",
    });
  }
  res.json({ Members: getAttendee });
});

// 28. request to attend event based on id
// require authentication
// require [proper] authorization
router.post("/:eventId/attendance", requireAuth, async (req, res) => {
  const { user } = req;
  const newAttendee = await Attendance.create({
    eventId: req.params.eventId,
    userId: user.id,
    status: "pending",
  });
  res.json(newAttendee);
});

// 29. change attendance status for event specified by id
// require authentication
// require [proper] authorization
router.put("/:eventId/attendance", requireAuth, async (req, res) => {
  const { user } = req;
  const { userId, status } = req.body;
  const editAttendee = await Attendance.findOne({
    where: { eventId: req.params.eventId, userId },
  });
  if (status) {
    editAttendee.status = status;
  } else editAttendee.status;
  await editAttendee.save();
  res.json(editAttendee);
});

// 30. delete event attendance specified by id
// require authentication
// require [proper] authorization
router.delete("/:eventId/attendance/userId", requireAuth, async (req, res) => {
  const { user } = req;

  const destroyAttendee = await Attendance.findOne({
    where: { eventId: req.params.eventId, userId: req.params.userId },
  });

  if (!destroyAttendee) {
    res.status(404).json({
      message: "User couldn't be found",
    });
  }
  await destroyAttendee.destroy();
  res.json({ message: "Successfully deleted attendance from event" });
});

module.exports = router;
