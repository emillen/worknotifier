"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _colors = require("colors");

var _colors2 = _interopRequireDefault(_colors);

var _time = require("../utils/time");

var _sequelize = require("sequelize");

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var makeCliController = function makeCliController(_ref) {
  var prompt = _ref.prompt,
      Notification = _ref.Notification,
      Profile = _ref.Profile,
      Type = _ref.Type;

  var addNotificationsForProfile = async function addNotificationsForProfile(profileName, days) {
    var profile = await Profile.findOne({
      where: {
        name: profileName
      }
    });
    var types = await profile.getTypes();
    var notifications = [];
    types.forEach(function (type) {
      notifications = notifications.concat(days.map(function (day) {
        return Notification.create({
          datetime: new Date(day + "T" + type.dataValues.defaultTime),
          typeId: type.dataValues.id
        }).then(function (notification) {
          return type.addNotification(notification);
        }).catch();
      }));
    });
    return _bluebird2.default.all(notifications);
  };
  var addType = function addType() {
    var questions = [{
      type: "input",
      name: "name",
      message: "Enter the name of the type"
    }, {
      type: "input",
      name: "message",
      message: "Enter the message that will be displayed for this type"
    }, {
      type: "input",
      name: "defaultTime",
      message: "Enter the time of the day this type will notfy you"
    }];
    prompt(questions).then(function (answers) {
      if (!(0, _time.isValidTime)(answers.defaultTime)) {
        return _bluebird2.default.reject("\n\t'" + answers.defaultTime + "' not a valid time");
      }
      return answers;
    }).then(function (answers) {
      return Type.build(answers).save();
    }).then(function (type) {
      return type.dataValues;
    }).then(function (type) {
      return console.log("\n\tType '" + _colors2.default.green(type.name) + "' was added");
    }).catch(function (err) {
      return console.log("" + _colors2.default.red(err));
    });
  };
  var addProfile = function addProfile() {
    var questions = [{
      type: "input",
      name: "name",
      message: "Enter the name of the profile"
    }];

    prompt(questions).then(function (answers) {
      return Profile.build(answers).save();
    }).then(function (profile) {
      return profile.dataValues;
    }).then(function (profile) {
      return console.log("\n\t" + _colors2.default.green(profile.name) + " was added");
    }).catch(function (err) {
      console.log("\n\t" + _colors2.default.red("Profile name already exists"));
    });
  };
  var addTypeToProfile = function addTypeToProfile(profileName, typeName) {
    console.log(typeName);
    var promises = [Profile.findOne({
      where: {
        name: profileName
      }
    }).then(function (type) {
      if (!type) return _bluebird2.default.reject("profile does not exist");else return type;
    }), Type.findOne({
      where: {
        name: typeName
      }
    }).then(function (type) {
      if (!type) return _bluebird2.default.reject("type does not exist");else return type;
    })];
    _bluebird2.default.all(promises).then(function (vals) {
      return { profile: vals[0], type: vals[1] };
    }).then(function (vals) {
      vals.profile.addType(vals.type);
      return vals;
    }).then(function (vals) {
      return console.log("Type '" + _colors2.default.green(vals.type.dataValues.name) + "' was added to Profile '" + _colors2.default.green(vals.profile.dataValues.name) + "'");
    });
  };

  var addNotificationForType = function addNotificationForType(typeName, date, time) {
    if (!(0, _time.isValidDate)(date)) {
      console.log(_colors2.default.red("date") + " must be a valid date");
      return;
    }

    if (time && !(0, _time.isValidTime)(time)) {
      console.log(_colors2.default.red("time") + " must be a valid time");
      return;
    }

    Type.findOne({
      where: {
        name: typeName
      }
    }).then(function (type) {
      if (!type) return _bluebird2.default.reject("Type does not exist");
      return type;
    }).then(function (type) {
      var datetime = time ? new Date(date + "T" + time) : new Date(date + "T" + type.dataValues.defaultTime);

      return Notification.create({
        datetime: datetime,
        typeId: type.dataValues.id
      }).catch(function (err) {
        return _bluebird2.default.reject("Notification already exists for that date and time");
      });
    }).then(function () {
      return console.log(_colors2.default.green("Notification") + " added");
    }).catch(function (err) {
      return console.log("\n\t" + _colors2.default.red(err));
    });
  };
  var listProfiles = function listProfiles() {
    return Profile.findAll().then(function (profiles) {
      return profiles.forEach(function (profile) {
        return profile.getTypes().then(function (types) {
          console.log("\t" + _colors2.default.green(profile.dataValues.name));
          types.forEach(function (type) {
            return console.log("\t * " + _colors2.default.blue(type.dataValues.name));
          });
        });
      });
    }).catch(function (err) {
      return console.log(_colors2.default.red(err));
    });
  };
  var listTypes = function listTypes() {
    return Type.findAll().then(function (types) {
      return types.map(function (type) {
        return type.dataValues;
      });
    }).then(function (types) {
      return types.forEach(function (type) {
        console.log("" + _colors2.default.green(type.name));
        console.log("   message: " + _colors2.default.blue(type.message));
      });
    }).catch(function (err) {
      return console.log(_colors2.default.red(err));
    });
  };

  var listNotifications = function listNotifications() {
    Notification.findAll({
      where: { datetime: _defineProperty({}, _sequelize.Op.gte, new Date()) },
      order: [["datetime"]]
    }).then(function (notifications) {
      return notifications.map(async function (notification) {
        var type = await notification.getType();
        console.log(_colors2.default.green(type.dataValues.name) + ": [ id: " + notification.id + " ]");
        console.log(" " + notification.dataValues.datetime + "\n");
      });
    }).catch(function (err) {
      return console.log(err);
    });
  };

  var runBrofileBetween = function runBrofileBetween(profileName, from, until) {
    if (from && !(0, _time.isValidDateExpression)(from)) return console.log(_colors2.default.red("from") + " is not a valid date");
    if (!(0, _time.isValidDateExpression)(until)) return console.log(_colors2.default.red("until") + " is not a valid date");

    var fromDate = from ? (0, _time.nextOfWeekday)(from) ? (0, _time.nextOfWeekday)(from) : new Date(from) : new Date();
    var untilDate = (0, _time.nextOfWeekday)(until) ? (0, _time.nextOfWeekday)(until) : new Date(until);
    var days = (0, _time.datesBetween)(fromDate, untilDate);

    Profile.findOne({ where: { name: profileName } }).then(function (profile) {
      return profile.getTypes();
    }).then(function (types) {
      return _bluebird2.default.all(types.map(function (type) {
        return _bluebird2.default.all(days.map(function (day) {
          var datetime = new Date(day + "T" + type.defaultTime);
          if ((0, _time.inBetween)(datetime, fromDate, untilDate)) {
            return Notification.build({
              datetime: datetime,
              typeId: type.id
            }).save()
            // Do nothing since we don't want the user to know
            .catch(_bluebird2.default.resolve);
          }
        }));
      }));
    }).then(function () {
      return console.log("\t" + _colors2.default.green(profileName) + " has been activivated");
    }).catch(function (err) {
      return console.log(err);
    });
  };

  var runProfileOn = function runProfileOn(profileName, days) {
    if (!days.map(function (date) {
      return (0, _time.isValidDate)(date) || (0, _time.nextOfWeekday)(date);
    }).every(function (validDate) {
      return validDate;
    })) {
      console.log(_colors2.default.red("all dates") + " must be valid");
    }

    var dates = days.map(function (day) {
      return (0, _time.nextOfWeekday)(day) ? (0, _time.nextOfWeekday)(day) : day;
    });

    addNotificationsForProfile(profileName, dates).then(function () {
      console.log("\t" + _colors2.default.green(profileName) + " has been activivated");
    }).catch(function (err) {
      return console.log(_colors2.default.red(err));
    });
  };
  var removeType = function removeType(typeName) {
    Type.findOne({ where: { name: typeName } }).then(async function (type) {
      await type.getNotifications().map(function (notification) {
        notification.destroy();
      });
      await type.setProfiles([]);
      return type.destroy();
    }).then(function () {
      return console.log("type removed");
    }).catch(console.log);
  };

  var removeProfile = function removeProfile(profileName) {
    Profile.findOne({ where: { name: profileName } }).then(async function (profile) {
      await profile.setTypes([]);
      profile.destroy();
    }).then(function () {
      console.log("Profile removed");
    }).catch(console.log);
  };

  var removeNotification = function removeNotification(id) {
    Notification.destroy({ where: { id: id } }).then(function () {
      return console.log("Notification removed");
    });
  };

  return {
    addType: addType,
    addProfile: addProfile,
    addTypeToProfile: addTypeToProfile,
    addNotificationForType: addNotificationForType,
    removeProfile: removeProfile,
    removeType: removeType,
    removeNotification: removeNotification,
    listProfiles: listProfiles,
    listTypes: listTypes,
    listNotifications: listNotifications,
    runBrofileBetween: runBrofileBetween,
    runProfileOn: runProfileOn
  };
};

exports.default = makeCliController;