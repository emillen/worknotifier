/**
 * The entry point of the Daemon-program.
 *
 * This file is reponsible for creating modules, and passing dependancies.
 */

import Sequelize from "sequelize";
import createDbServices from "./db/db-service";
import createScheduler from "./notifier/notification-scheduler";
import nodeNotifier from "node-notifier";
import Promise from "bluebird";
import sqlite3 from "sqlite3";
// const dbStore = path.resolve(__dirname, "worknotifications.db");
const Op = Sequelize.Op;

const dbStore = "./worknotifications.db";
// const dbStore = "worknotifications.db";
// creates the db file if it doesnt exist.
const db = new sqlite3.Database(dbStore);

const sequelize = new Sequelize(null, null, null, {
  dialect: "sqlite",
  operatorsAliases: Op,
  storage: dbStore,
  logging: false
});

const notifier = new nodeNotifier.NotificationCenter({
  withFallback: false,
  customPath: void 0
});
notifier.notify = Promise.promisify(notifier.notify);

createDbServices(sequelize)
  .then(({ Notification }) => {
    const scheduler = createScheduler({ Notification, notifier });
    scheduler.run();
  })
  .catch(err => console.error(err));
