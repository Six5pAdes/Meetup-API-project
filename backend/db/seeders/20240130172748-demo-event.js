"use strict";

const { Event } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await Event.bulkCreate(
      [
        {
          venueId: 1,
          groupId: 1,
          name: "Party W",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          type: "Online",
          capacity: 13,
          price: 34.99,
          startDate: "2024/04/09 10:10:09",
          endDate: "2024/11/01 00:36:27",
        },
        {
          venueId: 2,
          groupId: 2,
          name: "Party X",
          description:
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          type: "Online",
          capacity: 60,
          price: 50.99,
          startDate: "2024/02/18 21:51:01",
          endDate: "2024/10/17 20:06:31",
        },
        {
          venueId: 3,
          groupId: 3,
          name: "Party Y",
          description:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          type: "In person",
          capacity: 47,
          price: 10.99,
          startDate: "2024/08/26 18:35:39",
          endDate: "2024/11/08 08:46:51",
        },
        {
          venueId: 4,
          groupId: 4,
          name: "Party Z",
          description:
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          type: "In person",
          capacity: 38,
          price: 35.99,
          startDate: "2024/07/12 05:10:43",
          endDate: "2024/08/12 22:06:00",
        },
      ],
      options,
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Events";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: {
        [Op.substring]: ["Party"],
      },
    });
  },
};
