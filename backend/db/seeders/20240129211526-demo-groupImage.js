"use strict";

const { GroupImage } = require("../models");

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
    await GroupImage.bulkCreate(
      [
        {
          groupId: 1,
          url: "imgUrl 1",
          preview: false,
        },
        {
          groupId: 2,
          url: "imgUrl 2",
          preview: false,
        },
        {
          groupId: 3,
          url: "imgUrl 3",
          preview: true,
        },
        {
          groupId: 4,
          url: "imgUrl 4",
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
    options.tableName = "GroupImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.substring]: ["imgUrl"] },
    });
  },
};
