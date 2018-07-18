#!/usr/bin/env node
/**
 * The entry point of the CLI-program.
 *
 * This file is reponsible for creating modules, and passing dependancies.
 */

import sqlite3 from "sqlite3";
import inquirer from "inquirer";
import commander from "commander";
import makeCliController from "./cli/cli-controller";
import cli from "./cli/cli-router";
import path from "path";
import Sequelize from "sequelize";
import createDbServices from "./db/db-service";
import AppDirectory from "appdirectory";
import shelljs from "shelljs";
const dirs = new AppDirectory("worknotifier");

shelljs.mkdir("-p", dirs.userData());

const dbStore = path.join(dirs.userData(), "worknotifications.db");
// creates the db file if it doesnt exist.
const db = new sqlite3.Database(dbStore);
db.close(); // i don't think this matters, but here goes
const Op = Sequelize.Op;
const sequelize = new Sequelize(null, null, null, {
  dialect: "sqlite",
  operatorsAliases: Op,
  storage: dbStore,
  logging: false
});

createDbServices(sequelize)
  .then(({ Notification, Profile, Type }) => {
    const prompt = inquirer.createPromptModule();
    const cliController = makeCliController({
      prompt,
      Notification,
      Profile,
      Type
    });

    cli.run({ commander, cliController });
  })
  .catch(err => console.error(err));
