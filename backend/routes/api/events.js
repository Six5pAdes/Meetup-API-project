const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Event, Venue } = require("../../db/models");

const router = express.Router();

// 16. get all events
router.get("/", async (req, res) => {
  const everyEvent = await Event.unscoped().findAll({
    include: [{ model: Membership }, { model: EventImage }],
  });
  // 33. add query filters to get all events
  res.json({
    Events: everyEvent,
  });
});

// 18. get event details by id
router.get("/:eventId", async (req, res) => {
  res.json();
});

// 21. edit event by id
// require authentication
// require authorization
router.put("/:eventId", async (req, res) => {
  res.json();
});

// 22. delete event by id
// require authentication
// require authorization
router.delete("/:eventId", async (req, res) => {
  res.json();
});

// 20. add image to event based on id
// require authentication
// require [proper] authorization
router.post("/:eventId/images", async (req, res) => {
  res.json();
});

// <----------------------------------------------------->

// attendance endpoints
// 27. get all event attendees by id
router.get("/:eventId/attendees", async (req, res) => {
  res.json();
});

// 28. request to attend event based on id
// require authentication
// require [proper] authorization
router.post("/:eventId/attendance", async (req, res) => {
  res.json();
});

// 29. change attendance status for event specified by id
// require authentication
// require [proper] authorization
router.put("/:eventId/attendance", async (req, res) => {
  res.json();
});

// 30. delete event attendance specified by id
// require authentication
// require [proper] authorization
router.delete("/:eventId/attendance/userId", async (req, res) => {
  res.json();
});

module.exports = router;
