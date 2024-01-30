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
            "Out interested acceptance our partiality affronting unpleasant why add. Esteem garden men yet shy course.",
          type: "Online",
          capacity: 10,
          price: 17,
          startDate: "2024/10/08 04:47:07",
          endDate: "2024/11/08 04:49:27",
        },
        {
          venueId: 2,
          groupId: 2,
          name: "Party X",
          description:
            "In it except to so temper mutual tastes mother. Interested cultivated its continuing now yet are.",
          type: "Online",
          capacity: 6,
          price: 17,
          startDate: "2024/01/04 19:32:41",
          endDate: "2024/07/22 15:53:15",
        },
        {
          venueId: 3,
          groupId: 3,
          name: "Party Y",
          description:
            "Consulted up my tolerably sometimes perpetual oh. Expression acceptance imprudence particular had eat unsatiable.",
          type: "In person",
          capacity: 5,
          price: 17,
          startDate: "2024/07/07 04:54:49",
          endDate: "2024/07/12 23:00:57",
        },
        {
          venueId: 4,
          groupId: 4,
          name: "Party Z",
          description:
            "Scarcely on striking packages by so property in delicate. Up or well must less rent read walk so be. Easy sold at do hour sing spot.",
          type: "In person",
          capacity: 4,
          price: 17,
          startDate: "2024/07/06 09:29:19",
          endDate: "2024/11/26 00:53:11",
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
    options.tableName = "Events";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.substring]: ["Party"] },
    });
  },
};
