const express = require("express");
const {
  setTokenCookie,
  requireAuth,
  restoreUser,
} = require("../../utils/auth");
const { Venue, Group, Membership } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

const validateVenue = [
  check("address")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Street address is required"),
  check("city")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: [" ", "-"] })
    .notEmpty()
    .withMessage("City is required."),
  check("state")
    .exists({ checkFalsy: true })
    .isAlpha("en-US", { ignore: "-" })
    .notEmpty()
    .withMessage("State is required."),
  check("lat")
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must within -90 and 90 degrees."),
  check("lng")
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must within -180 and 180 degrees."),
  handleValidationErrors,
];

// 15. edit venue by id
// require authentication
router.put("/:venueId", [requireAuth, validateVenue], async (req, res) => {
  const { user } = req;
  const { address, city, state, lat, lng } = req.body;

  const editVenue = await Venue.findOne({
    where: { id: req.params.venueId },
  });

  if (!editVenue) {
    res.status(404).json({
      message: "Venue couldn't be found",
    });
  }

  const memberValidate = await Membership.findOne({
    where: { userId: user.id, groupId: editVenue.groupId },
  });
  const organizerValidate = await Group.findOne({
    where: { organizerId: user.id },
  });

  if (
    (memberValidate && memberValidate.status === "co-host") ||
    (organizerValidate && organizerValidate.organizerId === editVenue.groupId)
  ) {
    if (address) {
      editVenue.address = address;
    } else editVenue.address;
    if (city) {
      editVenue.city = city;
    } else editVenue.city;
    if (state) {
      editVenue.state = state;
    } else editVenue.state;
    if (lat) {
      editVenue.lat = lat;
    } else editVenue.lat;
    if (lng) {
      editVenue.lng = lng;
    } else editVenue.lng;

    await editVenue.save();
    res.json(editVenue);
  } else {
    res.status(403).json({
      message: "forbidden",
    });
  }
});

module.exports = router;
