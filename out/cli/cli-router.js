"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var run = function run(_ref) {
  var commander = _ref.commander,
      cliController = _ref.cliController;

  commander.version("1.0.0");
  commander.command("add-type").alias("at").description("add a notification type").action(cliController.addType);
  commander.command("add-profile").alias("ap").description("add a notification profile").action(cliController.addProfile);
  commander.command("add-profile-type <profile> <type>").alias("pt").description("Add a notification type to a profile").action(cliController.addTypeToProfile);
  commander.command("add-notification <type> <date> [time]").alias("an").description("add a notification for a type. [time] will override type default time").action(cliController.addNotificationForType);
  commander.command("remove-type <typeName>").alias("rt").description("removes a type by its name").action(cliController.removeType);
  commander.command("remove-profile <profileName>").alias("rp").description("removes a profile by its name").action(cliController.removeProfile);
  commander.command("remove-notification <id>").alias("rn").description("removes a notification by its id").action(cliController.removeNotification);
  commander.command("list-types").alias("lt").description("list all notifications types").action(cliController.listTypes);
  commander.command("list-notifications").option("--type <type>", "the type").option("--date <date>", "the date").alias("ln").description("list all scheduled notifications").action(cliController.listNotifications);
  commander.command("list-profiles").alias("lp").description("list all notification profiles").action(cliController.listProfiles);
  commander.command("run-profile <profile>").alias("r").description("Activates notifcations for selected profile").option("--from <date>").option("--until <date>").option("--on [dates..]").action(function (profile, options) {
    return cliController.runBrofileBetween(profile, options.from, options.until);
  });
  commander.parse(process.argv);
};

exports.default = {
  run: run
};