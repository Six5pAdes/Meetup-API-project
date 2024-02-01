const express = require("express");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { Venue } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

// 15. edit venue by id
// require authentication
router.put("/:venueId", requireAuth, async (req, res) => {
  const { address, city, state, lat, lng } = req.body;

  const editVenue = await Venue.findByPk(req.params.venueId);

  if (!editVenue) {
    res.status(404).json({
      message: "Venue couldn't be found",
    });
  }

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
});

module.exports = router;
