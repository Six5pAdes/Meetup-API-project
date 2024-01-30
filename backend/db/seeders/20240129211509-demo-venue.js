"use strict";

const { Venue } = require("../models");

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
    await Venue.bulkCreate(
      [
        {
          groupId: 1,
          address: "West Street",
          city: "Honolulu",
          state: "Hawaii",
          lat: 99,
          lng: 21,
        },
        {
          groupId: 2,
          address: "North Street",
          city: "Cincinnati",
          state: "Ohio",
          lat: -175,
          lng: 32,
        },
        {
          groupId: 3,
          address: "East Street",
          city: "New Hampstead",
          state: "New York",
          lat: 90,
          lng: 148,
        },
        {
          groupId: 4,
          address: "South Street",
          city: "Albuquerque",
          state: "New Mexico",
          lat: 172,
          lng: -26,
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
    options.tableName = "Venues";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.substring]: ["Street"] },
    });
  },
};
