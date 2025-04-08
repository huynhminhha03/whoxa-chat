const { isFriend, User } = require("../../models");
const { Op } = require("sequelize");

const addFriend = async (req, res) => {
  let { phone_number } = req.body;

  if (!phone_number || phone_number.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại là bắt buộc" });
  }
  phone_number = phone_number.slice(1);

  try {
    const user_id_send = req.authData.user_id; // ID của người đang đăng nhập
    const user = await User.findOne({ where: { phone_number } });
    console.log("user", user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng chưa đăng ký trong hệ thống.",
      });
    }

    const user_id_received = user.user_id; // ID của người cần kết bạn
    console.log("user_id_received", user_id_received);
    // Kiểm tra trạng thái bạn bè
    const existingFriendship = await isFriend.findOne({
      where: {
        user_id_1: user_id_send,
        user_id_2: user_id_received,
      },
    });

    if (existingFriendship) {
      return res.status(200).json({
        success: false,
        message: "Người này đã là bạn bè hoặc đang chờ xác nhận.",
      });
    }

    // Tạo yêu cầu kết bạn với trạng thái 0 (đang chờ xác nhận)
    await isFriend.create({
      user_id_1: user_id_send,
      user_id_2: user_id_received,
      status: 0,
    });

    return res
      .status(200)
      .json({ success: true, message: "Yêu cầu kết bạn đã được gửi." });
  } catch (error) {
    console.error("Lỗi khi thêm liên hệ:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

const checkAddFriend = async (req, res) => {
  try {
    let { phone_number } = req.body;
    const user_id_send = req.authData.user_id;

    phone_number = phone_number.slice(1); // Cắt bỏ số 0 đầu nếu có
    console.log("phone_number", phone_number);

    const user = await User.findOne({ where: { phone_number } });

    // Nếu không tìm thấy user, trả về success: false nhưng vẫn HTTP 200
    if (!user) {
      return res.status(200).json({
        sender_id: user_id_send,
        receiver_id: null,
        is_friend: false,
        success: false,
        message: "Người dùng chưa đăng ký trong hệ thống.",
      });
    }

    const user_id_received = user.user_id;

    // Kiểm tra trạng thái quan hệ bạn bè
    const friendship = await isFriend.findOne({
      where: {
        [Op.or]: [
          { user_id_1: user_id_send, user_id_2: user_id_received },
          { user_id_1: user_id_received, user_id_2: user_id_send }
        ]
      }
    });

    return res.status(200).json({
      success: true,
      status: friendship ? friendship.status : null,
      sender_id: user_id_send,
      receiver_id: user_id_received,
      full_name: user.first_name + " " + user.last_name,
    });
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái bạn bè:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server. Vui lòng thử lại sau." });
  }
};


const acceptFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.body;
    const user_id = req.authData.user_id; // ID của người đang đăng nhập

    if (!friend_id) {
      return res
        .status(400)
        .json({ success: false, message: "Friend ID is required." });
    }

    // Kiểm tra xem có lời mời kết bạn đang chờ xác nhận không
    const friendship = await isFriend.findOne({
      where: {
        user_id_1: friend_id,
        user_id_2: user_id,
        status: 0, // Pending status
      },
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "No pending friend request found.",
      });
    }

    // Cập nhật trạng thái thành Accepted (1)
    await friendship.update({ status: 1 });

    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const listFriends = async (req, res) => {
  try {
    const user_id = String(req.authData.user_id); // Ép kiểu về string để đảm bảo so sánh đúng

    // Lấy danh sách bạn bè với trạng thái đã chấp nhận (status = 1)
    const friends = await isFriend.findAll({
      where: {
        [Op.or]: [
          { user_id_1: user_id, status: 1 },
          { user_id_2: user_id, status: 1 },
        ],
      },
    });

    if (!friends.length) {
      return res
        .status(200)
        .json({
          success: true,
          friends: [],
          message: "Bạn chưa có bạn bè nào.",
        });
    }

    console.log("friends:", JSON.stringify(friends, null, 2)); // Log chi tiết danh sách bạn bè

    // Lấy danh sách ID bạn bè mà không bao gồm chính user_id
    const friendIds = friends
      .map((friend) => {
        const id1 = String(friend.user_id_1);
        const id2 = String(friend.user_id_2);
        return id1 === user_id ? id2 : id1; // Nếu user_id là user_id_1, lấy user_id_2 và ngược lại
      })
      .filter((id) => id !== user_id); // Loại bỏ chính user_id

    console.log("friendIds:", friendIds); // Log danh sách ID bạn bè

    // Lấy thông tin chi tiết của bạn bè từ User model
    const friendList = await User.findAll({
      where: { user_id: { [Op.in]: friendIds } }, // Lọc danh sách user_id từ bạn bè
      attributes: ["user_id", "first_name", "last_name", "phone_number"],
    });

    return res.status(200).json({ success: true, friends: friendList });
  } catch (error) {
    console.error("Lỗi lấy danh sách bạn bè:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

// Xóa bạn bè
const deleteFriend = async (req, res) => {
  try {
    const { friend_id } = req.body;
    const user_id = req.authData.user_id;

    if (!friend_id) {
      return res
        .status(400)
        .json({ success: false, message: "Friend ID là bắt buộc." });
    }

    // Kiểm tra xem có tồn tại quan hệ bạn bè không
    const friendship = await isFriend.findOne({
      where: {
        [Op.or]: [
          { user_id_1: user_id, user_id_2: friend_id, status: 1 },
          { user_id_1: friend_id, user_id_2: user_id, status: 1 },
        ],
      },
    });

    if (!friendship) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bạn bè này." });
    }

    // Xóa quan hệ bạn bè
    await friendship.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Xóa bạn bè thành công." });
  } catch (error) {
    console.error("Lỗi xóa bạn bè:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server. Vui lòng thử lại sau." });
  }
};

const countFriendRequests = async (req, res) => {
  try {
    const user_id = req.authData.user_id;

    // Đếm số lượng lời mời kết bạn đang chờ xác nhận
    const pendingRequests = await isFriend.count({
      where: {
        user_id_2: user_id,
        status: 0, // Trạng thái 0 là đang chờ xác nhận
      },
    });

    console.log("pendingRequests:", pendingRequests); // Log số lượng lời

    return res.status(200).json({
      success: true,
      count: pendingRequests,
      message: "Số lượng lời mời kết bạn đang chờ xác nhận.",
    });
  } catch (error) {
    console.error("Lỗi đếm lời mời kết bạn:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server. Vui lòng thử lại sau.",
    });
  }
};

const getAllFriendRequests = async (req, res) => {
  try {
    const user_id = req.authData.user_id;

    const friendRequests = await isFriend.findAll({
      where: { user_id_2: user_id, status: 0 }, // Chỉ lấy lời mời đang chờ
      include: [
        {
          model: User,
          as: "sender", // Đây phải trùng với alias trong models
          attributes: ["user_id", "first_name", "last_name", "phone_number"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      requests: friendRequests.map((request) => ({
        user_id: request.sender?.user_id, // Dùng optional chaining để tránh lỗi
        full_name: `${request.sender?.first_name} ${request.sender?.last_name}`,
        phone_number: request.sender?.phone_number,
      })),
      message: "Danh sách lời mời kết bạn đang chờ xác nhận.",
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server. Vui lòng thử lại sau.",
    });
  }
};

const respondFriendRequest = async (req, res) => {
  try {
    const { friend_id, action } = req.body; // friend_id: người gửi lời mời, action: "accept" hoặc "reject"
    const user_id = req.authData.user_id; // Người đang đăng nhập

    if (!friend_id || !["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu friend_id hoặc action không hợp lệ (chỉ 'accept' hoặc 'reject').",
      });
    }

    // Tìm lời mời kết bạn đang chờ xác nhận
    const friendship = await isFriend.findOne({
      where: {
        user_id_1: friend_id,
        user_id_2: user_id,
        status: 0, // Đang chờ xác nhận
      },
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lời mời kết bạn đang chờ xác nhận.",
      });
    }

    if (action === "accept") {
      // Chấp nhận lời mời kết bạn (Cập nhật trạng thái thành 1)
      await friendship.update({ status: 1 });

      return res.status(200).json({
        success: true,
        message: "Đã chấp nhận lời mời kết bạn.",
      });
    } else if (action === "reject") {
      // Từ chối lời mời kết bạn (Xóa khỏi DB)
      await friendship.destroy();

      return res.status(200).json({
        success: true,
        message: "Đã từ chối lời mời kết bạn.",
      });
    }
  } catch (error) {
    console.error("Lỗi xử lý lời mời kết bạn:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server. Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  addFriend,
  checkAddFriend,
  acceptFriendRequest,
  getAllFriendRequests,
  respondFriendRequest,
  listFriends,
  deleteFriend,
  countFriendRequests,
};
