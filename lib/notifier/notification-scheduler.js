/**
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

import moment from "moment";
import { Op } from "sequelize";

/**
 * @function createNotify
 * @description creates the notify function
 * @param {Object} notifier - an object with "node-notifiers" API,
 * but with promises instead of callbacks.
 * @returns {notify}
 */
const createNotify = notifier => type => {
  return notifier.notify({
    title: type.name,
    message: type.message,
    sound: true,
    wait: true,
    closeLabel: "Snooze",
    actions: "Acknowledge"
  });
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
const createShowNotificationsByQuery = ({ Notification, notify }) => query => {
  Notification.findAll(query)
    .then(async notifications => {
      for (const notification of notifications) {
        const type = await notification.getType();

        /* we must wait for a "notify" to resolve synchronously or we 
						won't see all notifications */
        await notify(type.dataValues).then(async response => {
          if (response === "activate") {
            notification.acknowledged = true;
            await notification.save();
          }
          console.log(`notification for type"${type.dataValues.name} shown"`);
        });
      }
      return notifications;
    })
    .catch(err => console.error(err));
};

/**
 * @function runFunctionEveryXminutes
 * @description runs a function every "X" minutes. It starts on a "whole" minute
 * @param {Function} func - the function to be run.
 * @param {Integer} minutes - the amount of minutes between the runs.
 */
const runFunctionEveryXminutes = (func, minutes) => {
  func();
  const nextTick = moment()
    .add(minutes, "minute")
    .startOf("minute");
  const diff = nextTick.diff(moment(), "millisecond");

  setTimeout(() => {
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
const createScheduler = ({ Notification, notifier }) => {
  const notify = createNotify(notifier);
  const showNotificationsByQuery = createShowNotificationsByQuery({
    Notification,
    notify
  });

  const run = () => {
    // Every minute we show the notifications scheduled for that minute.
    runFunctionEveryXminutes(() => {
      const startOfThisMinute = moment()
        .startOf("minute")
        .toDate();
      const endOfThisMinute = moment()
        .endOf("minute")
        .toDate();
      showNotificationsByQuery({
        where: {
          datetime: {
            [Op.and]: {
              [Op.gte]: startOfThisMinute,
              [Op.lte]: endOfThisMinute
            }
          }
        }
      });
    }, 1);

    // Every five minutes we show missed or dismissed notifications
    runFunctionEveryXminutes(() => {
      const startOfThisDay = moment()
        .startOf("day")
        .toDate();
      const lastMinute = moment()
        .subtract(1, "minute")
        .toDate();
      showNotificationsByQuery({
        where: {
          [Op.and]: {
            datetime: {
              [Op.and]: {
                [Op.gte]: startOfThisDay,
                [Op.lte]: lastMinute
              }
            },
            acknowledged: {
              [Op.eq]: false
            }
          }
        }
      });
    }, 5);
  };

  return { run };
};

export default createScheduler;
