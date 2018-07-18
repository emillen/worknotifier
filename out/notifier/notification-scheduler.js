"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _sequelize = require("sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * This module shows notifications on their scheduled times.
                                                                                                                                                                                                                   * It also shows missed/dissmissed functions
                                                                                                                                                                                                                   * @exports createScheduler
                                                                                                                                                                                                                   * @module notifier/notification-scheduler
                                                                                                                                                                                                                   */

/**
 * @typedef {Object} Scheduler
 * @description The main object of this module
 * @property {run} run - starts the background process.
 */

/**
 * @typedef run
 * @typedef
 * @description Runs the background process.
 */

/**
 * @typedef {Function} showNotificationsByQuery
 * @description runs notify on all notifications fetched by a query
 * @param {Object} query - a sequelize query
 */

/**
 * @typedef {Function} notify
 * @description Shows desktop notifications
 * @param {Object} type -
 * @param {String} type.name - the name of the notification type.
 * @param {String} type.message - the message to be displayed.
 */

/**
 * @function createNotify
 * @description creates the notify function
 * @param {Object} notifier - an object with "node-notifiers" API,
 * but with promises instead of callbacks.
 * @returns {notify}
 */
var createNotify = function createNotify(notifier) {
  return function (type) {
    return notifier.notify({
      title: type.name,
      message: type.message,
      sound: true,
      wait: true,
      closeLabel: "Snooze",
      actions: "Acknowledge"
    });
  };
};

/**
 * @function createShowNotificationsByQuery
 * @description creates showNotificationsByQuery
 * @param {Object} dependancies - showNotifications dependancies.
 * @param {ModelObject} dependancies.Notification - a model object that represents
 * notifications.
 * @param {Function} dependancies.notify - a function that shows desktop
 * notifications.
 * @returns {showNotificationsByQuery}
 */
var createShowNotificationsByQuery = function createShowNotificationsByQuery(_ref) {
  var Notification = _ref.Notification,
      notify = _ref.notify;
  return function (query) {
    Notification.findAll(query).then(async function (notifications) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = async function _loop() {
          var notification = _step.value;

          var type = await notification.getType();

          /* we must wait for a "notify" to resolve synchronously or we 
          won't see all notifications */
          await notify(type.dataValues).then(async function (response) {
            if (response === "activate") {
              notification.acknowledged = true;
              await notification.save();
            }
            console.log("notification for type\"" + type.dataValues.name + " shown\"");
          });
        };

        for (var _iterator = notifications[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          await _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return notifications;
    }).catch(function (err) {
      return console.error(err);
    });
  };
};

/**
 * @function runFunctionEveryXminutes
 * @description runs a function every "X" minutes. It starts on a "whole" minute
 * @param {Function} func - the function to be run.
 * @param {Integer} minutes - the amount of minutes between the runs.
 */
var runFunctionEveryXminutes = function runFunctionEveryXminutes(func, minutes) {
  func();
  var nextTick = (0, _moment2.default)().add(minutes, "minute").startOf("minute");
  var diff = nextTick.diff((0, _moment2.default)(), "millisecond");

  setTimeout(function () {
    runFunctionEveryXminutes(func, minutes);
  }, diff);
};

/**
 * @public
 * @static
 * @function createScheduler
 * @description The factory for this module.
 * @param {Object} dependancies - The module dependancies
 * @param {ModelObject} dependancies.Notification - A model object representing
 * notifications
 * @param {Object} dependancies.notifier - an object with "node-notifiers" API,
 * but with promises instead of callbacks.
 * @returns {Scheduler}
 */
var createScheduler = function createScheduler(_ref2) {
  var Notification = _ref2.Notification,
      notifier = _ref2.notifier;

  var notify = createNotify(notifier);
  var showNotificationsByQuery = createShowNotificationsByQuery({
    Notification: Notification,
    notify: notify
  });

  var run = function run() {
    // Every minute we show the notifications scheduled for that minute.
    runFunctionEveryXminutes(function () {
      var _Op$and;

      var startOfThisMinute = (0, _moment2.default)().startOf("minute").toDate();
      var endOfThisMinute = (0, _moment2.default)().endOf("minute").toDate();
      showNotificationsByQuery({
        where: {
          datetime: _defineProperty({}, _sequelize.Op.and, (_Op$and = {}, _defineProperty(_Op$and, _sequelize.Op.gte, startOfThisMinute), _defineProperty(_Op$and, _sequelize.Op.lte, endOfThisMinute), _Op$and))
        }
      });
    }, 1);

    // Every five minutes we show missed or dismissed notifications
    runFunctionEveryXminutes(function () {
      var _Op$and2;

      var startOfThisDay = (0, _moment2.default)().startOf("day").toDate();
      var lastMinute = (0, _moment2.default)().subtract(1, "minute").toDate();
      showNotificationsByQuery({
        where: _defineProperty({}, _sequelize.Op.and, {
          datetime: _defineProperty({}, _sequelize.Op.and, (_Op$and2 = {}, _defineProperty(_Op$and2, _sequelize.Op.gte, startOfThisDay), _defineProperty(_Op$and2, _sequelize.Op.lte, lastMinute), _Op$and2)),
          acknowledged: _defineProperty({}, _sequelize.Op.eq, false)
        })
      });
    }, 5);
  };

  return { run: run };
};

exports.default = createScheduler;