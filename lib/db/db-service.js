import Sequelize from "sequelize";

/**
 * Creates the db services.
 * @param {Sequelize} sequelize
 * @returns {Object} dbServices
 * @returns {sequelize} dbServices.Type a model that represent notification Types
 * @returns {sequelize} dbServices.Profile a model that represent notification Types
 * @returns {Promise}
 */
const makeDbServices = sequelize => {
  const Type = sequelize.define("type", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    message: Sequelize.STRING,
    defaultTime: {
      type: Sequelize.STRING,
      allowNull: false
    },
    defaultDays: { type: Sequelize.STRING, allowNull: true }
  });
  const Profile = sequelize.define("profile", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  });
  Profile.sync();
  const Notification = sequelize.define(
    "notification",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      acknowledged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      datetime: {
        type: Sequelize.DATE,
        allowNull: false,
        unique: "only_one_per_datetime"
      },
      typeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: "only_one_per_datetime"
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["typeId", "datetime"]
        }
      ]
    }
  );
  Type.belongsToMany(Profile, { through: "profileTypes" });
  Profile.belongsToMany(Type, { through: "profileTypes" });
  Notification.belongsTo(Type);
  Type.hasMany(Notification);

  return sequelize.sync({ alter: true }).then(() =>
    Promise.resolve({
      Type,
      Profile,
      Notification
    })
  );
};

export default makeDbServices;
