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
          name: "Posse 1",
          about:
            "Ignorant branched humanity led now marianne too strongly entrance. Remark fat set why are sudden depend change entire wanted.",
          type: "In person",
          private: true,
          city: "Anaheim",
          state: "California",
        },
        {
          organizerId: 2,
          name: "Posse 2",
          about:
            "Rose to shew bore no ye of paid rent form. Old design are dinner better nearer silent excuse.",
          type: "Online",
          private: true,
          city: "Laredo",
          state: "Texas",
        },
        {
          organizerId: 3,
          name: "Posse 3",
          about:
            "She which are maids boy sense her shade. Considered reasonable we affronting on expression in.",
          type: "In person",
          private: false,
          city: "St Paul",
          state: "Minnesota",
        },
        {
          organizerId: 4,
          name: "Posse 4",
          about:
            "So cordial anxious mr delight. Shot his has must wish from sell nay. Yadda yadda yadda",
          type: "Online",
          private: false,
          city: "Buffalo",
          state: "New York",
        },
      ], options,
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
      name: {
        [Op.substring]: ["Posse"],
      },
    });
  },
};
