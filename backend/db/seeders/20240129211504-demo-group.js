"use strict";

const { Group } = require("../models");

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
    await Group.bulkCreate(
      [
        {
          organizerId: 1,
          name: "Posse One",
          about:
            "Lorem ipsum dolor sit amet. Ea saepe rerum et vero enim eos quae optio qui atque architecto est placeat natus nam earum vitae.",
          type: "Online",
          private: true,
          city: "Honolulu",
          state: "Hawaii",
        },
        {
          organizerId: 2,
          name: "Posse Two",
          about:
            "Et culpa omnis aut quae sint non consequatur temporibus aut deleniti eveniet aut totam sint et amet magni id obcaecati quia.",
          type: "In person",
          private: true,
          city: "Cincinnati",
          state: "Ohio",
        },
        {
          organizerId: 3,
          name: "Posse Three",
          about:
            "In repellendus repudiandae eum beatae quos sed quidem obcaecati et asperiores aliquid.",
          type: "Online",
          private: false,
          city: "North Hempstead",
          state: "New York",
        },
        {
          organizerId: 4,
          name: "Posse Four",
          about:
            "Et dignissimos reiciendis id cumque veritatis ea pariatur distinctio aut optio illum qui incidunt quae!",
          type: "In person",
          private: false,
          city: "Albuquerque",
          state: "New Mexico",
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
    options.tableName = "Groups";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.substring]: ["Posse"] },
    });
  },
};
