#!/usr/bin/env node
"use strict";

var _sqlite = require("sqlite3");

var _sqlite2 = _interopRequireDefault(_sqlite);

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _cliController = require("./cli/cli-controller");

var _cliController2 = _interopRequireDefault(_cliController);

var _cliRouter = require("./cli/cli-router");

var _cliRouter2 = _interopRequireDefault(_cliRouter);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _sequelize = require("sequelize");

var _sequelize2 = _interopRequireDefault(_sequelize);

var _dbService = require("./db/db-service");

var _dbService2 = _interopRequireDefault(_dbService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The entry point of the CLI-program.
 *
 * This file is reponsible for creating modules, and passing dependancies.
 */

var dbStore = "worknotifications.db";
// creates the db file if it doesnt exist.
var db = new _sqlite2.default.Database(dbStore);
db.close(); // i don't think this matters, but here goes
var Op = _sequelize2.default.Op;
var sequelize = new _sequelize2.default(null, null, null, {
  dialect: "sqlite",
  operatorsAliases: Op,
  storage: dbStore,
  logging: false
});

(0, _dbService2.default)(sequelize).then(function (_ref) {
  var Notification = _ref.Notification,
      Profile = _ref.Profile,
      Type = _ref.Type;

  var prompt = _inquirer2.default.createPromptModule();
  var cliController = (0, _cliController2.default)({
    prompt: prompt,
    Notification: Notification,
    Profile: Profile,
    Type: Type
  });

  _cliRouter2.default.run({ commander: _commander2.default, cliController: cliController });
}).catch(function (err) {
  return console.error(err);
});