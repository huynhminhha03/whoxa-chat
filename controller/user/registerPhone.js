// const { default: axios } = require("axios");
const { User } = require("../../models");
const fs = require("fs"); // Require the Node.js 'fs' module for file system operations
// const baseUrl = process.env.baseUrl;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("../../config/serviceAccountKey"); // Đường dẫn tới file JSON của Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const client = require("twilio")(accountSid, authToken);
const jwt = require("jsonwebtoken");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const registerPhone = async (req, res) => {
  // console.log(accountSid, "accountSid");
  // console.log(authToken, "authToken");
  console.log(req.body);
  let { country_code, phone_number, country, country_full_name } = req.body;
  // console.log(`${country_code}${phone_number}`);
  if (phone_number == "" || !phone_number) {
    return res
      .status(400)
      .json({ message: "phone_number field is required!", success: false });
  }

  try {
    // const resData = await User.create({ phone_number });
    const checkUser = await User.findOne({
      where: { country_code, phone_number },
    });
    // console.log(checkUser);
    let generatedOtp = Math.floor(100000 + Math.random() * 900000);
    // console.log(generatedOtp, "generatedOtp");

    if (!checkUser) {
      // check if user is allready exist or not this condition evaluate true if user not exist

      client.messages
        .create({
          body: `Otp from Chat App is ${generatedOtp}.`,
          to: `${country_code}${phone_number}`,
          from: process.env.TWILIO_FROM_NUMBER,
        })
        .then((message) => {
          // console.log(message, "message from twillio");

          // console.log(message.sid);
          User.create({
            phone_number,
            otp: generatedOtp,
            country_code,
            country,
            country_full_name,
          });
          return res.status(200).json({ message: "Otp Sent!", success: true });
        })
        .catch((error) => {
          console.error(error);
          return res
            .status(200)
            .json({ message: "Otp not sent!", success: false });
        });
    } else {
      client.messages
        .create({
          body: `Otp from Whoxa Chat is ${generatedOtp}.`,
          to: `${country_code}${phone_number}`,
          from: process.env.TWILIO_FROM_NUMBER,
        })
        .then((message) => {
          // console.log(message.sid);
          // console.log(message, "message from twillio");

          User.update(
            { otp: generatedOtp, country_code },
            {
              where: { country_code, phone_number, country, country_full_name },
            }
          );
          return res.status(200).json({ message: "Otp Sent!", success: true });
        })
        .catch((error) => {
          console.error(error);
          return res
            .status(200)
            .json({ message: "Otp not sent", success: false });
        });

      // return res
      //   .status(400)
      //   .json({ message: "User allready registered!", success: false });
    }
  } catch (error) {
    console.error(error);
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error });
  }
};

const registerPhoneByFirebase = async (req, res) => {
  try {
    let { country_code, phone_number, country, country_full_name } = req.body;
    // console.log(`${country_code}${phone_number}`);
    if (phone_number == "" || !phone_number) {
      return res
        .status(400)
        .json({ message: "phone_number field is required!", success: false });
    }

    // Tạo phiên đăng nhập OTP với Firebase
    const session = await admin.auth().createSessionCookie(phone_number, {
      expiresIn: 60000, // OTP hết hạn sau 60 giây
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
      session,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const verifyPhoneOtp = async (req, res) => {
  let { country_code, phone_number, otp, device_token, one_signal_player_id } =
    req.body;

  if (phone_number == "" || !phone_number) {
    return res
      .status(400)
      .json({ message: "phone_number field is required!", success: false });
  }

  if (country_code == "" || !country_code) {
    return res
      .status(400)
      .json({ message: "country_code field is required!", success: false });
  }

  if (otp == "" || !otp) {
    return res
      .status(400)
      .json({ message: "otp field is required!", success: false });
  }

  try {
    const resData = await User.findOne({
      where: { country_code, phone_number, otp },
    });
    // console.log("newResData", newResData);
    // console.log(resData);
    if (resData) {
      // console.log(newResData);
      const token = jwt.sign(resData.dataValues, jwtSecretKey);

      // Update Device Token ==================================================================
      User.update(
        { device_token, one_signal_player_id },
        {
          where: { country_code, phone_number },
        }
      );

      // let is_require_filled = false;
      // if (
      //   // resData.dataValues.phone_number != "" &&
      //   // resData.dataValues.email_id != "" &&
      //   resData.dataValues.first_name != "" &&
      //   resData.dataValues.last_name != ""
      // ) {
      //   is_require_filled = true;
      // }
      res.status(200).json({
        message: "Otp Verified",
        success: true,
        token: token,
        resData: resData,
        // is_require_filled,
      });
    } else {
      res.status(200).json({ message: "Invalid otp!", success: false });
    }
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    res.status(500).json({ error: error.message });
  }
};

const verifyPhoneOtpFirebase = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log dữ liệu nhận được từ client

    const {
      id_token,
      country_code,
      phone_number,
      device_token,
      one_signal_player_id,
    } = req.body;

    if (!id_token || !phone_number || !country_code) {
      return res
        .status(400)
        .json({ message: "Missing required fields!", success: false });
    }

    // Xác thực ID Token của Firebase
    const decodedToken = await admin.auth().verifyIdToken(id_token);
    console.log("Decoded Token:", decodedToken); // Log dữ liệu từ Firebase

    const firebaseUid = decodedToken.uid;

    let user = await User.findOne({ where: { phone_number, country_code } });
    let resData;
    if (!user) {
      resData = await User.create({
        firebase_uid: firebaseUid,
        phone_number,
        country_code,
        device_token,
        one_signal_player_id,
      });
    } else {
      await User.update(
        { device_token, one_signal_player_id, firebase_uid: firebaseUid },
        { where: { phone_number, country_code } }
      );
    }
    resData = await User.findOne({ where: { phone_number, country_code } });
    console.log("User data:", resData);
    const token = jwt.sign(resData.dataValues, jwtSecretKey, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "OTP Verified Successfully!",
      success: true,
      token: token,
      resData: resData,
    });
  } catch (error) {
    console.error("Error verifying OTP with Firebase:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerPhone,
  verifyPhoneOtp,
  verifyPhoneOtpFirebase,
  registerPhoneByFirebase,
};
