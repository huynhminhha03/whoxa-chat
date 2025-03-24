const jwt = require("jsonwebtoken");
const { User, AllContact } = require("../../models");
const { Op, where } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const getAllAvailableContacts = async (req, res) => {
  try {
    let { contact_list } = req.body;
    console.log(req.body);
    const user_id = req.authData.user_id;

    // Kiểm tra dữ liệu đầu vào
    if (!contact_list) {
      return res.status(400).json({ error: "contact_list is required" });
    }

    if (typeof contact_list === "string") {
      try {
        contact_list = JSON.parse(contact_list);
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON format in contact_list" });
      }
    }

    if (!Array.isArray(contact_list)) {
      return res.status(400).json({ error: "contact_list must be an array" });
    }

    // Lấy thông tin người dùng từ database
    const userData = await User.findOne({ where: { user_id } });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Kiểm tra và cập nhật thông tin người dùng trong bảng AllContact
    const [contactDetail, created] = await AllContact.findOrCreate({
      where: { user_id, phone_number: userData.phone_number },
      defaults: {
        phone_number: userData.phone_number,
        full_name: `${userData.first_name} ${userData.last_name}`,
        user_id,
      },
    });

    if (!created) {
      await contactDetail.update({ full_name: `${userData.first_name} ${userData.last_name}` });
    }

    // Loại bỏ số điện thoại trùng lặp trong danh sách liên hệ
    let uniqueContacts = new Map();
    contact_list.forEach((item) => {
      if (item.number && !uniqueContacts.has(item.number)) {
        uniqueContacts.set(item.number, item);
      }
    });

    const uniqueArray = Array.from(uniqueContacts.values());

    // Kiểm tra số điện thoại trong database
    const phoneNumbers = uniqueArray.map((e) => e.number);
    const existingUsers = await User.findAll({
      where: { phone_number: phoneNumbers },
      attributes: { exclude: ["otp"] },
    });

    let newContactList = [];
    let allContactsToCreate = [];

    uniqueArray.forEach((e) => {
      let existingUser = existingUsers.find((user) => user.phone_number === e.number);

      if (existingUser) {
        let contact = existingUser.toJSON();
        contact.full_name = e.name;
        newContactList.push(contact);
      }

      allContactsToCreate.push({
        phone_number: e.number,
        full_name: e.name,
        user_id,
      });
    });

    // Thêm vào AllContact nếu chưa có
    await AllContact.bulkCreate(allContactsToCreate, {
      ignoreDuplicates: true, // Tránh lỗi khi chèn trùng
    });

    return res.status(200).json({
      success: true,
      message: "Done",
      newContactList,
    });
  } catch (error) {
    console.error("Error in getAllAvailableContacts:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


module.exports = { getAllAvailableContacts };
