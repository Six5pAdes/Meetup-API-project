const express = require("express");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const {
  Group,
  GroupImage,
  Membership,
  User,
  Venue,
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
      organizerId: req.User.id,
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
  res.json();
});

// 12. delete group
// require authentication
// require [proper] authorization
router.delete("/:groupId", requireAuth, async (req, res) => {
  res.json();
});

// 10. add image to group based on group id
// require authentication
// require [proper] authorization
router.post("/:groupId/images", requireAuth, async (req, res) => {
  res.json();
});

// <----------------------------------------------------->

// venue endpoints
// 13. get all group venues by id
// require authentication
router.get("/:groupId/venues", requireAuth, async (req, res) => {
  res.json();
});

// 14. create new group venue by id
// require authentication
router.post("/:groupId/venues", requireAuth, async (req, res) => {
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
router.post("/:groupId/events", requireAuth, async (req, res) => {
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
router.post("/:groupId/membership", requireAuth, async (req, res) => {
  res.json();
});

// 25. change membership status for group specified by id
// require authentication
// require [proper] authorization
router.put("/:groupId/membership", requireAuth, async (req, res) => {
  res.json();
});

// 26. delete group membership specified by id
// require authentication
// require [proper] authorization
router.delete(
  "/:groupId/membership/:memberId",
  requireAuth,
  async (req, res) => {
    res.json();
  }
);

module.exports = router;
