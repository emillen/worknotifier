import moment from "moment";

/**
 * Checks if a string could represent a date (without time)
 * @param {string} date
 */
export const isValidDate = date => {
  return moment(new Date(`${date}T11:00`)).isValid();
};

/**
 * Checks if a string could represent time of the day.
 * @param {string} time the string that should represent time of day.
 * @returns {boolean}
 */
export const isValidTime = time => {
  return moment(new Date(`2018-03-04T${time}`)).isValid();
};

export const isValidDateExpression = expression => {
  return (
    isValidDate(expression) ||
    nextOfWeekday(expression) ||
    moment(new Date(expression)).isValid()
  );
};

export const inBetween = (shouldBeBetween, left, right) => {
  return (
    moment(shouldBeBetween).diff(moment(left)) >= 0 &&
    moment(shouldBeBetween).diff(moment(right)) <= 0
  );
};

/**
 * @function datesBetween
 * @description Creates a list of strings that represents dates between
 * start and finish
 * @param {Date} start the start date.
 * @param {Date} finish the end date.
 */
export const datesBetween = (start, finish) => {
  const dates = [];

  const currDate = moment(start)
    .subtract(1, "day")
    .startOf("day");
  const lastDate = moment(finish).startOf("day");

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
export const nextOfWeekday = dayString => {
  const dayLookup = {
    now: moment(),
    today: moment().startOf("day"),
    tommorrow: moment()
      .add(1, "day")
      .startOf("day"),
    sun: moment()
      .day(0)
      .startOf("day"),
    mon: moment()
      .day(1)
      .startOf("day"),
    tue: moment()
      .day(2)
      .startOf("day"),
    wed: moment()
      .day(3)
      .startOf("day"),
    thu: moment()
      .day(4)
      .startOf("day"),
    fri: moment()
      .day(5)
      .startOf("day"),
    sat: moment()
      .day(6)
      .startOf("day"),
    sunday: moment()
      .day(0)
      .startOf("day"),
    monday: moment()
      .day(1)
      .startOf("day"),
    tuesday: moment()
      .day(2)
      .startOf("day"),
    wednesday: moment()
      .day(3)
      .startOf("day"),
    thursday: moment()
      .day(4)
      .startOf("day"),
    friday: moment()
      .day(5)
      .startOf("day"),
    saturday: moment()
      .day(6)
      .startOf("day")
  };
  const lowerDayString = dayString.toLowerCase();

  if (!dayString || dayLookup[lowerDayString] == null) {
    return null;
  }

  const today = moment();
  const next = dayLookup[lowerDayString];
  if (lowerDayString == "today" || lowerDayString == "now") {
    return next.clone().toDate();
  } else if (next.diff(today) > 0) {
    return next.clone().toDate();
  } else {
    return next
      .clone()
      .add(7, "day")
      .startOf("day")
      .toDate();
  }
};
