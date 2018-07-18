"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextOfWeekday = exports.datesBetween = exports.inBetween = exports.isValidDateExpression = exports.isValidTime = exports.isValidDate = undefined;

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if a string could represent a date (without time)
 * @param {string} date
 */
var isValidDate = exports.isValidDate = function isValidDate(date) {
  return (0, _moment2.default)(new Date(date + "T11:00")).isValid();
};

/**
 * Checks if a string could represent time of the day.
 * @param {string} time the string that should represent time of day.
 * @returns {boolean}
 */
var isValidTime = exports.isValidTime = function isValidTime(time) {
  return (0, _moment2.default)(new Date("2018-03-04T" + time)).isValid();
};

var isValidDateExpression = exports.isValidDateExpression = function isValidDateExpression(expression) {
  return isValidDate(expression) || isValidTime(expression) || (0, _moment2.default)(new Date()).isValid();
};

var inBetween = exports.inBetween = function inBetween(shouldBeBetween, left, right) {
  return (0, _moment2.default)(shouldBeBetween).diff((0, _moment2.default)(left)) >= 0 && (0, _moment2.default)(shouldBeBetween).diff((0, _moment2.default)(right)) <= 0;
};

/**
 * @function datesBetween
 * @description Creates a list of strings that represents dates between
 * start and finish
 * @param {Date} start the start date.
 * @param {Date} finish the end date.
 */
var datesBetween = exports.datesBetween = function datesBetween(start, finish) {
  var dates = [];

  var currDate = (0, _moment2.default)(start).subtract(1, "day").startOf("day");
  var lastDate = (0, _moment2.default)(finish).startOf("day");

  while (currDate.add(1, "days").diff(lastDate) <= 0) {
    dates.push(currDate.clone().format("YYYY-MM-DD"));
  }

  return dates;
};

/**
 * Takes a string that represents a weekday, and returns a string containing
 * the next date that weekday occurs. (If you enter friday, and today is friday,
 *  it will return the next friday.)
 * @param {string} dayString a string representing a weekday. eg "Friday"
 */
var nextOfWeekday = exports.nextOfWeekday = function nextOfWeekday(dayString) {
  var dayLookup = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  if (!dayString || typeof daystring !== "string" || !dayLookup[dayString.toLowerCase()]) {
    return null;
  }
  var today = (0, _moment2.default)().day();
  var next = dayLookup[dayString.toLowerCase()];

  if (next > today) {
    return (0, _moment2.default)().add(next - today, "day").format("YYYY-MM-DD");
  } else if (today > next) {
    return (0, _moment2.default)().add(7 - (today - next), "day").format("YYYY-MM-DD");
  } else {
    return (0, _moment2.default)().add(7, "day").format("YYYY-MM-DD");
  }
};