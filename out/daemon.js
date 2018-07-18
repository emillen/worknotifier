"use strict";

var _sequelize = require("sequelize");

var _sequelize2 = _interopRequireDefault(_sequelize);

var _dbService = require("./db/db-service");

var _dbService2 = _interopRequireDefault(_dbService);

var _notificationScheduler = require("./notifier/notification-scheduler");

var _notificationScheduler2 = _interopRequireDefault(_notificationScheduler);

var _nodeNotifier = require("node-notifier");

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _sqlite = require("sqlite3");

var _sqlite2 = _interopRequireDefault(_sqlite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const dbStore = path.resolve(__dirname, "worknotifications.db");
/**
 * The entry point of the Daemon-program.
 *
 * This file is reponsible for creating modules, and passing dependancies.
 */

var Op = _sequelize2.default.Op;

var dbStore = "./worknotifications.db";
// const dbStore = "worknotifications.db";
// creates the db file if it doesnt exist.
var db = new _sqlite2.default.Database(dbStore);

var sequelize = new _sequelize2.default(null, null, null, {
  dialect: "sqlite",
  operatorsAliases: Op,
  storage: dbStore,
  logging: false
});

var notifier = new _nodeNotifier2.default.NotificationCenter({
  withFallback: false,
  customPath: void 0
});
notifier.notify = _bluebird2.default.promisify(notifier.notify);

(0, _dbService2.default)(sequelize).then(function (_ref) {
  var Notification = _ref.Notification;

  var scheduler = (0, _notificationScheduler2.default)({ Notification: Notification, notifier: notifier });
  scheduler.run();
}).catch(function (err) {
  return console.error(err);
});