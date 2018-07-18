# Worknotifier

## What is worknotifier?

Worknotifier is a cli-program for setting up notifications for work. The app is mainly geared towards shift-workers who who have different routines during the different shifts.

## How does it work?

### Description

Worknotifier contains, mainly, three datatypes:

- **Type** - Contains a _message_ to be shown with the notifications, a _name_ which is used to identify the type, along with _default time_, and _default days_.
- **Profile** - Contains _types_, and a _name_ used for identifying the profile. Profiles are used to activate multiple types at the same time. Profiles can be activated on a range of days. For example, a profile could be called _night-shift_
- **Notification** - Notifications contain a _datetime_, and a connection to a _type_. A notification is mainly a time/date to show a certain type. Notification can override its types default time/days.

### Help

```
Usage: cli [options] [command]

  Options:

    -V, --version                             output the version number
    -h, --help                                output usage information

  Commands:

    add-type|at                               add a notification type
    add-profile|ap                            add a notification profile
    add-profile-type|pt <profile> <type>      Add a notification type to a profile
    add-notification|an <type> <date> [time]  add a notification for a type. [time] will override type default time
    remove-type|rt <typeName>                 removes a type by its name
    remove-profile|rp <profileName>           removes a profile by its name
    remove-notification|rn <id>               removes a notification by its id
    list-types|lt                             list all notifications types
    list-notifications|ln [options]           list all scheduled notifications
    list-profiles|lp                          list all notification profiles
    run-profile|r [options] <profile>         Activates notifcations for selected profile
```

## Examples
