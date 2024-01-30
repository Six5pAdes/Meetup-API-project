"use strict";

const { EventImage } = require("../models");

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
    await EventImage.bulkCreate(
      [
        {
          eventId: 1,
          url: "imgUrl 5",
          preview: false,
        },
        {
          eventId: 2,
          url: "imgUrl 6",
          preview: false,
        },
        {
          eventId: 3,
          url: "imgUrl 7",
          preview: true,
        },
        {
          eventId: 4,
          url: "imgUrl 8",
          preview: true,
        },
      ],
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
    options.tableName = "EventImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.substring]: ["imgUrl"] },
    });
  },
};
