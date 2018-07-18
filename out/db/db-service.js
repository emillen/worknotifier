"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require("sequelize");

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates the db services.
 * @param {Sequelize} sequelize
 * @returns {Object} dbServices
 * @returns {sequelize} dbServices.Type a model that represent notification Types
 * @returns {sequelize} dbServices.Profile a model that represent notification Types
 * @returns {Promise}
 */
var makeDbServices = function makeDbServices(sequelize) {
  var Type = sequelize.define("type", {
    id: { type: _sequelize2.default.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: _sequelize2.default.STRING,
      allowNull: false,
      unique: true
    },
    message: _sequelize2.default.STRING,
    defaultTime: {
      type: _sequelize2.default.STRING,
      allowNull: false
    },
    defaultDays: { type: _sequelize2.default.STRING, allowNull: true }
  });
  var Profile = sequelize.define("profile", {
    id: {
      type: _sequelize2.default.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: _sequelize2.default.STRING,
      allowNull: false,
      unique: true
    }
  });
  Profile.sync();
  var Notification = sequelize.define("notification", {
    id: {
      type: _sequelize2.default.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    acknowledged: {
      type: _sequelize2.default.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    datetime: {
      type: _sequelize2.default.DATE,
      allowNull: false,
      unique: "only_one_per_datetime"
    },
    typeId: {
      type: _sequelize2.default.INTEGER,
      allowNull: false,
      unique: "only_one_per_datetime"
    }
  }, {
    indexes: [{
      unique: true,
      fields: ["typeId", "datetime"]
    }]
  });
  Type.belongsToMany(Profile, { through: "profileTypes" });
  Profile.belongsToMany(Type, { through: "profileTypes" });
  Notification.belongsTo(Type);
  Type.hasMany(Notification);

  return sequelize.sync({ alter: true }).then(function () {
    return Promise.resolve({
      Type: Type,
      Profile: Profile,
      Notification: Notification
    });
  });
};

exports.default = makeDbServices;