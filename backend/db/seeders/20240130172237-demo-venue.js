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
          city: "Anaheim",
          state: "California",
          lat: -75,
          lng: 146,
        },
        {
          groupId: 2,
          address: "South Street",
          city: "Laredo",
          state: "Texas",
          lat: -33,
          lng: 58,
        },
        {
          groupId: 3,
          address: "North Street",
          city: "St Paul",
          state: "Minnesota",
          lat: 2,
          lng: -153,
        },
        {
          groupId: 4,
          address: "East Street",
          city: "Buffalo",
          state: "New York",
          lat: -31,
          lng: 129,
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
      address: {
        [Op.substring]: ["Street"],
      },
    });
  },
};
