const express = require("express");
const { requireAuth } = require("../../utils/auth");
const {
  Group,
  Venue,
  Event,
  EventImage,
  Attendance,
  User,
} = require("../../db/models");
const { Op } = require("sequelize");

const router = express.Router();

// 16. get all events
router.get("/", async (req, res) => {
  // 33. add query filters to get all events
  let { page, size, name, type, startDate } = req.query;
  let pagination = {
    limit: size,
    offset: size * (page - 1),
  };
  if (page) page = parseInt(page);
  else page = 1;
  if (size) size = parseInt(size);
  else size = 20;
  if (isNaN(page)) page = 1;
  if (isNaN(size)) size = 20;

  let where = {};
  if (name) {
    where.name = { [Op.substring]: name };
  } else {
    where.name;
  }
  if (type) {
    where.type = { [Op.substring]: type };
  } else {
    where.type;
  }
  if (startDate) {
    where.startDate = { [Op.substring]: startDate };
  } else {
    where.startDate;
  }

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
    include: [
      { model: Attendance },
      { model: EventImage, attributes: [["preview", "previewImage"]] },
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
    ...pagination,
  });
  res.json({
    Events: everyEvent,
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
    include: [
      { model: Attendance },
      { model: EventImage, attributes: [["preview", "previewImage"]] },
      { model: Group, attributes: ["id", "name", "city", "state"] },
      { model: Venue, attributes: ["id", "city", "state"] },
    ],
  });
  res.json({
    Events: getEventsById,
  });
});

// 21. edit event by id
// require authentication
// require authorization
router.put("/:eventId", requireAuth, async (req, res) => {
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

  const editEvent = await Event.findByPk(req.params.eventId);

  if (!editEvent) {
    res.status(404).message({
      message: "Event couldn't be found",
    });
  }

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
  res.json({
    venueId: editEvent.venueId,
    name: editEvent.name,
    type: editEvent.type,
    capacity: editEvent.capacity,
    price: editEvent.price,
    description: editEvent.description,
    startDate: editEvent.startDate,
    endDate: editEvent.endDate,
  });
});

// 22. delete event by id
// require authentication
// require authorization
router.delete("/:eventId", requireAuth, async (req, res) => {
  const destroyEvent = await Event.findByPk(req.params.eventId);

  if (!destroyEvent) {
    res.status(404).message({
      message: "Event couldn't be found",
    });
  }
  await destroyEvent.destroy();
  res.json({ message: "Successfully deleted" });
});

// 20. add image to event based on id
// require authentication
// require [proper] authorization
router.post("/:eventId/images", requireAuth, async (req, res) => {
  const { url, preview } = req.body;

  const findEvent = await Event.findByPk(req.params.eventId);
  if (!findEvent) {
    res.status(404).message({
      message: "Event couldn't be found",
    });
  }

  const newEventImage = await findEvent.createEventImage({
    eventId: eventId,
    url,
    preview,
  });
  res.json(newEventImage);
});

// <----------------------------------------------------->

// attendance endpoints
// 27. get all event attendees by id
router.get("/:eventId/attendees", async (req, res) => {
  const getAttendee = await Attendance.findAll({
    where: { eventId: req.params.eventId },
    attributes: ["status"],
    include: {
      model: User,
      attributes: ["id", "firstName", "lastName"],
    },
  });
  if (!getAttendee) {
    res.status(404).message({
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
    groupId: req.params.eventId,
    userId: user.id,
    status: "pending",
  });
  res.json(newAttendee);
});

// 29. change attendance status for event specified by id
// require authentication
// require [proper] authorization
router.put("/:eventId/attendance", requireAuth, async (req, res) => {
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
  const destroyAttendee = await Attendance.findOne({
    where: { eventId: req.params.eventId, userId: req.params.userId },
  });

  if (!destroyAttendee) {
    res.status(404).message({
      message: "User couldn't be found",
    });
  }
  await destroyAttendee.destroy();
  res.json({ message: "Successfully deleted attendance from event" });
});

module.exports = router;
