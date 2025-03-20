const {
  User,
  Chat,
  ConversationsUser,
  ClearAllChat,
  DeleteMessage,
  StarMessage,
  Status,
  StatusMedia,
  AllContact,
} = require("../../../models");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const receiveMessage = async (io, socket, data) => {
  try {
    const user_id = socket.handshake.query.user_id;
    const {
      conversation_id,
      user_timezone = "America/Hermosillo",
      page = 1,
      per_page_message = 50,
      message_id = 0, // Provide message_id if you want to fetch all the messages upto that message_id
    } = data;

    // console.log(typeof per_page_message, "per_page_message");

    if (!conversation_id) {
      socket.emit("messageReceived", { MessageList: [] });
      return;
    }

    const clearAllChatRes = await ClearAllChat.findOne({
      where: {
        user_id,
        conversation_id: conversation_id,
      },
      order: [["updatedAt", "DESC"]],
    });
    

    let updatedFiled = {};
    if (clearAllChatRes) {
      updatedFiled.message_id = {
        [Op.gt]: clearAllChatRes.dataValues.message_id,
      };
    }
    if (message_id != 0 && message_id != undefined) {
      updatedFiled.message_id = {
        [Op.gt]: message_id,
      };
    }


    const totalMessages = await Chat.count({
      where: {
        ...updatedFiled,
        conversation_id: conversation_id,
      },
    });

    const limit = Number(per_page_message);

    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalMessages / limit);

    const conversationUsers = await ConversationsUser.findAll({
      where: {
        conversation_id: conversation_id,
      },
    });


    const resData = await Chat.findAll({
      where: {
        ...updatedFiled,
        conversation_id: conversation_id,
      },
      order: [["message_id", "DESC"]],
      // limit: limit,
      limit: message_id == 0 ? limit : 10000,
      offset: offset,
    });

    resData.reverse();

    const modifiedDataWithDate = [];
    let lastDate = null;

    for (let item of resData) {

      const isDeleted = await DeleteMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.dataValues.message_id,
        },
      });

      if (isDeleted) continue;

      const message_stared = await StarMessage.findOne({
        where: {
          user_id: user_id,
          message_id: item.dataValues.message_id,
        },
      });

      const senderId = item.dataValues.senderId;
      const myMessage = senderId === user_id;

      const user = await User.findOne({
        where: { user_id: senderId },
        attributes: [
          "user_id",
          "user_name",
          "profile_image",
          "first_name",
          "last_name",
          "phone_number",
        ],
      });


      //  For Status data ==================================================================================
      if (item.dataValues.status_id != 0) {
        let existingStatus = await Status.findOne({
          attributes: ["status_id", "updatedAt", "createdAt"],
          include: [
            {
              model: StatusMedia,
              where: {
                status_media_id: item.dataValues.status_id,
              },
              attributes: [
                "status_media_id",
                "url",
                "status_text",
                "updatedAt",
              ],
            },
          ],
        });
        if (existingStatus) {
          item.dataValues.statusData = [existingStatus];
        } else {
          // some how status is not found then
          item.dataValues.statusData = [];
        }
      } else {
        // if message type is not status then
        item.dataValues.statusData = [];
      }

      // For Member added or Removed from group =============================================================================
      if (
        item.dataValues.message_type == "member_added" ||
        item.dataValues.message_type == "member_removed"
      ) {
        // Who Added the new member to group
        let adminDetails = await User.findOne({
          where: {
            user_id: item.dataValues.message,
          },
          attributes: [
            "user_id",
            "phone_number",
            "first_name",
            "last_name",
            "user_name",
          ],
        });

        // New Member details
        let newUserDetails = await User.findOne({
          where: {
            user_id: item.dataValues.senderId,
          },
          attributes: [
            "user_id",
            "phone_number",
            "first_name",
            "last_name",
            "user_name",
          ],
        });

        // Now check how  user saved their name in their device
        let adminUserName = await AllContact.findOne({
          where: {
            phone_number: adminDetails.dataValues.phone_number,
            user_id,
          },
          attributes: ["full_name"],
        });

        // Now check how  user saved their name in their device
        let newUserName = await AllContact.findOne({
          where: {
            phone_number: newUserDetails.dataValues.phone_number,
            user_id,
          },
          attributes: ["full_name"],
        });

        item.dataValues.message = `${
          adminDetails.dataValues.user_id == user_id
            ? "You"
            : adminUserName
            ? adminUserName.dataValues.full_name
            : adminDetails.dataValues.user_name
        } ${
          item.dataValues.message_type == "member_added" ? "added" : "removed"
        } ${
          newUserDetails.dataValues.user_id == user_id
            ? "You"
            : newUserName
            ? newUserName.dataValues.full_name
            : newUserDetails.dataValues.user_name
        }`;
      }

      const senderData = user.get();
      item.dataValues.is_star_message = !!message_stared;
      item.dataValues.myMessage = myMessage;
      item.dataValues.senderData = senderData;

      const messageDate = moment
        .tz(item.dataValues.createdAt, user_timezone)
        .format("YYYY-MM-DD");

      if (lastDate !== messageDate && limit != 1) {
        //limit != 1 means if user only want one message then don't provide date
        modifiedDataWithDate.push({
          url: "",
          thumbnail: "",
          message_id: 0,
          message: item.dataValues.createdAt, // Use the date instead of `item.dataValues.createdAt`
          message_type: "date",
          who_seen_the_message: "",
          message_read: 0,
          video_time: "",
          audio_time: "",
          latitude: "",
          longitude: "",
          shared_contact_name: "",
          shared_contact_profile_image: "",
          shared_contact_number: "",
          forward_id: 0,
          reply_id: 0,
          status_id: 0,
          createdAt: "",
          updatedAt: "",
          senderId: 0,
          conversation_id: 0,
          delete_for_me: "",
          delete_from_everyone: false,
          is_star_message: false,
          myMessage: false,
          statusData: [],
          senderData: {
            profile_image: "",
            user_id: 0,
            user_name: "",
            first_name: "",
            last_name: "",
            phone_number: "",
          },
        });
        lastDate = messageDate;
      }

      const who_seen_list = item.dataValues.who_seen_the_message
        ? item.dataValues.who_seen_the_message.split(",")
        : [];

      if (!who_seen_list.includes(String(user_id))) {
        who_seen_list.push(user_id.toString());
        item.dataValues.who_seen_the_message = who_seen_list.join(",");
        await Chat.update(
          { who_seen_the_message: who_seen_list.join(",") },
          {
            where: {
              conversation_id: conversation_id,
              message_id: item.dataValues.message_id,
            },
          }
        );

        const updatedItem = await Chat.findOne({
          where: { message_id: item.dataValues.message_id },
        });
        
        const user_id_list = conversationUsers.map((u) => u.user_id.toString());
        const allSeen = user_id_list.every((uid) =>
          who_seen_list.includes(uid)
        );

        if (allSeen) {
          await Chat.update(
            { message_read: 1 },
            { where: { message_id: item.dataValues.message_id } }
          );
          item.dataValues.message_read = 1;
          await item.save();
        }
      } else {
        const user_id_list = conversationUsers.map((u) => u.user_id.toString());
        const allSeen = user_id_list.every((uid) =>
          who_seen_list.includes(uid)
        );

        if (allSeen) {
          item.dataValues.message_read = 1;
          await item.save();
        }
      }

      modifiedDataWithDate.push(item);
    }

    if (limit == 1) {
      // This means user only want one message so that in frontend it will be appended to existing message list
      socket.emit("messageReceived", modifiedDataWithDate[0]);
    } else {
      socket.emit("messageReceived", {
        MessageList: modifiedDataWithDate,
        totalPages: totalPages,
        currentPage: page,
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("errorMessage", {
      message: "Something went wrong!",
      error: error,
    });
  }
};

module.exports = { receiveMessage };
