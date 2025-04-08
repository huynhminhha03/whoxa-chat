module.exports = (sequelize, DataTypes) => {
  const isFriend = sequelize.define("isFriend", {
    user_id_1: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    user_id_2: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    status: {
      type: DataTypes.INTEGER, // 0: Pending, 1: Accepted, 2: Blocked
      defaultValue: 0,
    },
  });

  isFriend.associate = function (models) {
    isFriend.belongsTo(models.User, {
      foreignKey: "user_id_1",
      as: "sender", // Người gửi lời mời kết bạn
    });

    isFriend.belongsTo(models.User, {
      foreignKey: "user_id_2",
      as: "receiver", // Người nhận lời mời kết bạn
    });
  };

  return isFriend;
};
