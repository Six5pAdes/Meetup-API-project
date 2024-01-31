const express = require("express");
const requireAuth = require("../../utils/auth");
const {
  Group,
  GroupImage,
  Membership,
  User,
  Venue,
} = require("../../db/models");

const router = express.Router();

// 6. get all groups
router.get("/", async (req, res) => {
  const where = {};
  const numMembers = await Membership.count({
    group: "groupId",
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

    include: {
      model: GroupImage,
      attributes: [["preview", "previewImage"]],
    },
  });
  res.json(everyGroup);
});

// 7. get all groups joined/organized by current user
// require authentication
router.get("/current", async (req, res) => {
  const { User } = req.query;

  const getGroupByUser = await Group.findAll({
    where: { organizerId: User.Id },
  });

  res.json(getGroupByUser);
});

// 8. get group details from id
router.get("/:groupId", async (req, res) => {
  const getGroupById = await Group.findByPk(req.params.groupId, {
    include: [{ model: GroupImage }, { model: Membership }, { model: Venue }],
  });
  res.json(getGroupById);
});

// 9. create group
// require authentication
router.post("/", async (req, res) => {
  res.json();
});

// 11. edit group
// require authentication
// require [proper] authorization
router.put("/:groupId", async (req, res) => {
  res.json();
});

// 12. delete group
// require authentication
// require [proper] authorization
router.delete("/:groupId", async (req, res) => {
  res.json();
});

// 10. add image to group based on group id
// require authentication
// require [proper] authorization
router.post("/:groupId/images", async (req, res) => {
  res.json();
});

// <----------------------------------------------------->

// venue endpoints
// 13. get all group venues by id
// require authentication
router.get("/:groupId/venues", async (req, res) => {
  res.json();
});

// 14. create new group venue by id
// require authentication
router.post("/:groupId/venues", async (req, res) => {
  res.json();
});

// <----------------------------------------------------->

// event endpoints
// 17. get all group events by id
router.get("/:groupId/events", async (req, res) => {
  res.json();
});

// 19. create group events by id
// require authentication
// require authorization
router.post("/:groupId/events", async (req, res) => {
  res.json();
});

// <----------------------------------------------------->

// membership endpoints
// 23. get group members by id
router.get("/:groupId/members", async (req, res) => {
  res.json();
});

// 24. request group membership by id
// require authentication
router.post("/:groupId/membership", async (req, res) => {
  res.json();
});

// 25. change membership status for group specified by id
// require authentication
// require [proper] authorization
router.put("/:groupId/membership", async (req, res) => {
  res.json();
});

// 26. delete group membership specified by id
// require authentication
// require [proper] authorization
router.delete("/:groupId/membership/:memberId", async (req, res) => {
  res.json();
});

module.exports = router;
