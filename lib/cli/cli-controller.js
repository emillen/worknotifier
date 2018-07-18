import colors from "colors";
import {
  datesBetween,
  isValidDate,
  isValidTime,
  nextOfWeekday,
  inBetween,
  isValidDateExpression
} from "../utils/time";
import { Op } from "sequelize";
import Promise from "bluebird";

const makeCliController = ({ prompt, Notification, Profile, Type }) => {
  const addNotificationsForProfile = async (profileName, days) => {
    const profile = await Profile.findOne({
      where: {
        name: profileName
      }
    });
    const types = await profile.getTypes();
    let notifications = [];
    types.forEach(type => {
      notifications = notifications.concat(
        days.map(day =>
          Notification.create({
            datetime: new Date(`${day}T${type.dataValues.defaultTime}`),
            typeId: type.dataValues.id
          })
            .then(notification => type.addNotification(notification))
            .catch()
        )
      );
    });
    return Promise.all(notifications);
  };
  const addType = () => {
    const questions = [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the type"
      },
      {
        type: "input",
        name: "message",
        message: "Enter the message that will be displayed for this type"
      },
      {
        type: "input",
        name: "defaultTime",
        message: "Enter the time of the day this type will notfy you"
      }
    ];
    prompt(questions)
      .then(answers => {
        if (!isValidTime(answers.defaultTime)) {
          return Promise.reject(
            `\n\t'${answers.defaultTime}' not a valid time`
          );
        }
        return answers;
      })
      .then(answers => Type.build(answers).save())
      .then(type => type.dataValues)
      .then(type =>
        console.log(`\n\tType '${colors.green(type.name)}' was added`)
      )
      .catch(err => console.log(`${colors.red(err)}`));
  };
  const addProfile = () => {
    const questions = [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the profile"
      }
    ];

    prompt(questions)
      .then(answers => Profile.build(answers).save())
      .then(profile => profile.dataValues)
      .then(profile =>
        console.log(`\n\t${colors.green(profile.name)} was added`)
      )
      .catch(err => {
        console.log(`\n\t${colors.red("Profile name already exists")}`);
      });
  };
  const addTypeToProfile = (profileName, typeName) => {
    console.log(typeName);
    const promises = [
      Profile.findOne({
        where: {
          name: profileName
        }
      }).then(type => {
        if (!type) return Promise.reject("profile does not exist");
        else return type;
      }),
      Type.findOne({
        where: {
          name: typeName
        }
      }).then(type => {
        if (!type) return Promise.reject("type does not exist");
        else return type;
      })
    ];
    Promise.all(promises)
      .then(vals => ({ profile: vals[0], type: vals[1] }))
      .then(vals => {
        vals.profile.addType(vals.type);
        return vals;
      })
      .then(vals =>
        console.log(
          `Type '${colors.green(
            vals.type.dataValues.name
          )}' was added to Profile '${colors.green(
            vals.profile.dataValues.name
          )}'`
        )
      );
  };

  const addNotificationForType = (typeName, date, time) => {
    if (!isValidDate(date)) {
      console.log(`${colors.red("date")} must be a valid date`);
      return;
    }

    if (time && !isValidTime(time)) {
      console.log(`${colors.red("time")} must be a valid time`);
      return;
    }

    Type.findOne({
      where: {
        name: typeName
      }
    })
      .then(type => {
        if (!type) return Promise.reject("Type does not exist");
        return type;
      })
      .then(type => {
        const datetime = time
          ? new Date(`${date}T${time}`)
          : new Date(`${date}T${type.dataValues.defaultTime}`);

        return Notification.create({
          datetime,
          typeId: type.dataValues.id
        }).catch(err =>
          Promise.reject("Notification already exists for that date and time")
        );
      })
      .then(() => console.log(`${colors.green("Notification")} added`))
      .catch(err => console.log(`\n\t${colors.red(err)}`));
  };
  const listProfiles = () =>
    Profile.findAll()
      .then(profiles =>
        profiles.forEach(profile => {
          return profile.getTypes().then(types => {
            console.log(`\t${colors.green(profile.dataValues.name)}`);
            types.forEach(type =>
              console.log(`\t * ${colors.blue(type.dataValues.name)}`)
            );
          });
        })
      )
      .catch(err => console.log(colors.red(err)));
  const listTypes = () =>
    Type.findAll()
      .then(types => types.map(type => type.dataValues))
      .then(types =>
        types.forEach(type => {
          console.log(`${colors.green(type.name)}`);
          console.log(`   message: ${colors.blue(type.message)}`);
        })
      )
      .catch(err => console.log(colors.red(err)));

  const listNotifications = () => {
    Notification.findAll({
      where: { datetime: { [Op.gte]: new Date() } },
      order: [["datetime"]]
    })
      .then(notifications => {
        return notifications.map(async notification => {
          const type = await notification.getType();
          console.log(
            `${colors.green(type.dataValues.name)}: [ id: ${notification.id} ]`
          );
          console.log(` ${notification.dataValues.datetime}\n`);
        });
      })
      .catch(err => console.log(err));
  };

  const runBrofileBetween = (profileName, from, until) => {
    if (from && !isValidDateExpression(from)) {
      console.log(`${colors.red("from")} is not a valid date`);
      return;
    }
    if (!isValidDateExpression(until)) {
      console.log(`${colors.red("until")} is not a valid date`);
      return;
    }

    const fromDate = from
      ? nextOfWeekday(fromDate) || new Date(from)
      : new Date();
    const untilDate = nextOfWeekday(until)
      ? nextOfWeekday(until)
      : new Date(until);

    const days = datesBetween(fromDate, untilDate);
    Profile.findOne({ where: { name: profileName } })
      .then(profile => {
        return profile.getTypes();
      })
      .then(types => {
        return Promise.all(
          types.map(type => {
            return Promise.all(
              days.map(day => {
                const datetime = new Date(`${day}T${type.defaultTime}`);
                if (inBetween(datetime, fromDate, untilDate)) {
                  return Notification.create({
                    datetime,
                    typeId: type.id
                  }).catch(Promise.resolve);
                }
              })
            );
          })
        );
      })
      .then(() =>
        console.log(`\t${colors.green(profileName)} has been activivated`)
      )
      .catch(err => console.log(err));
  };

  const runProfileOn = (profileName, days) => {
    if (
      !days
        .map(date => isValidDate(date) || nextOfWeekday(date))
        .every(validDate => validDate)
    ) {
      console.log(`${colors.red("all dates")} must be valid`);
    }

    const dates = days.map(
      day => (nextOfWeekday(day) ? nextOfWeekday(day) : day)
    );

    addNotificationsForProfile(profileName, dates)
      .then(() => {
        console.log(`\t${colors.green(profileName)} has been activivated`);
      })
      .catch(err => console.log(colors.red(err)));
  };
  const removeType = typeName => {
    Type.findOne({ where: { name: typeName } })
      .then(async type => {
        await type.getNotifications().map(notification => {
          notification.destroy();
        });
        await type.setProfiles([]);
        return type.destroy();
      })
      .then(() => console.log("type removed"))
      .catch(console.log);
  };

  const removeProfile = profileName => {
    Profile.findOne({ where: { name: profileName } })
      .then(async profile => {
        await profile.setTypes([]);
        profile.destroy();
      })
      .then(() => {
        console.log("Profile removed");
      })
      .catch(console.log);
  };

  const removeNotification = id => {
    Notification.destroy({ where: { id } }).then(() =>
      console.log("Notification removed")
    );
  };

  return {
    addType,
    addProfile,
    addTypeToProfile,
    addNotificationForType,
    removeProfile,
    removeType,
    removeNotification,
    listProfiles,
    listTypes,
    listNotifications,
    runBrofileBetween,
    runProfileOn
  };
};

export default makeCliController;
