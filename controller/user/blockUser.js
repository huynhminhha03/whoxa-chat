const jwt = require("jsonwebtoken");
const { Chat, Block } = require("../../models");
const { Op } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const blockUser = async (req, res) => {
  let { conversation_id } = req.body;
  if (!conversation_id || conversation_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "conversation_id field is required" });
  }

  try {
    const user_id = req.authData.user_id;

    const isBlocked = await Block.findOne({
      where: {
        user_id,
        conversation_id,
      },
    });

    if (isBlocked) {
      // Delete the block row
      await Block.destroy({
        where: {
          user_id,
          conversation_id,
        },
      });

      return res.status(200).json({
        is_block: false,
        success: true,
        message: "User Unblocked successfully",
        // isBlocked: [],
      });
    }
    // else {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Users are not blocked",
    //   });
    // }

    findLastMessage = await Chat.findOne({
      where: {
        conversation_id,
      },
      // attributes: ["message_id"],
      order: [["message_id", "DESC"]],
      limit: 1,
    });

    // Block the user
    await Block.create({
      user_id,
      conversation_id,
      message_id_before_block: findLastMessage.message_id,
    });

    // const blockData = await Block.findOne({
    //   where: {
    //     [Op.or]: [
    //       { userId: authData.user_id, blockedUserId: blockedUserId },
    //       { userId: blockedUserId, blockedUserId: authData.user_id },
    //     ],
    //   },
    // });

    res.status(200).json({
      is_block: true,
      success: true,
      message: "User blocked successfully",
      // isBlocked: blockData,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { blockUser };
