"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.hasMany(models.EventImage, { foreignKey: "eventId" });
      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: "eventId",
        otherKey: "userId",
      });
      Event.belongsTo(models.Venue, {
        foreignKey: "venueId",
      });
      Event.belongsTo(models.Group, {
        foreignKey: "groupId",
      });
    }
  }
  Event.init(
    {
      venueId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER,
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [5, 60],
        },
      },
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: ["Online", "In person"],
        },
      },
      capacity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      startDate: { type: DataTypes.DATE, allowNull: false },
      endDate: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
