// to add New website settings
const { Website_Setting, Admin } = require("../../models");
const updateEnvVariables = require("../../reusable/updateEnvVariables");

async function checkWebsettingAndCreate() {
  try {
    const isWebSetting = await Website_Setting.findOne({
      where: {
        setting_id: 1,
      },
    });
    if (isWebSetting) {
      return;
    } else {
      await Website_Setting.create({
        website_name: "Whoxa Chat",
        website_email: "demo@whoxa.com",
        website_text: "whoxa text",
        website_color_primary: "#ffff",
        website_color_secondary: "#ffff",
        website_link: "https://whoxachat.com/",
        ios_link: "ios_link",
        android_link: "android_link",
        tell_a_friend_link: "tell_a_friend_link",
        baseUrl: "https://whoxachat.com/",
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// Edit WebSettings
async function editWebSettings(req, res) {
  try {
    const { admin_id } = req.authData;
    const {
      website_name,
      website_text,
      website_color_primary,
      website_color_secondary,
      setting_id,
      website_email,
      website_link,
      ios_link,
      android_link,
      tell_a_friend_link,
      baseUrl,
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_NUMBER,
      JWT_SECRET_KEY,
    } = req.body;

    const website_logo = req.files;

    let payload = {};
    if (website_name) payload.website_name = website_name;
    if (website_email) payload.website_email = website_email;
    if (website_text) payload.website_text = website_text;
    if (website_link) payload.website_link = website_link;
    if (website_logo?.length > 0) payload.website_logo = website_logo[0].path;
    if (ios_link) payload.ios_link = ios_link;
    if (android_link) payload.android_link = android_link;
    if (tell_a_friend_link) payload.tell_a_friend_link = tell_a_friend_link;
    if (website_color_primary)
      payload.website_color_primary = website_color_primary;
    if (website_color_secondary)
      payload.website_color_secondary = website_color_secondary;
    if (baseUrl) {
      updateEnvVariables({ baseUrl: baseUrl });
      payload.baseUrl = baseUrl;
    }
    if (TWILIO_ACCOUNT_SID) {
      updateEnvVariables({ TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID });
      payload.TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID;
    }
    if (TWILIO_AUTH_TOKEN) {
      updateEnvVariables({ TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN });
      payload.TWILIO_AUTH_TOKEN = TWILIO_AUTH_TOKEN;
    }
    if (TWILIO_FROM_NUMBER) {
      updateEnvVariables({ TWILIO_FROM_NUMBER: TWILIO_FROM_NUMBER });
      payload.TWILIO_FROM_NUMBER = TWILIO_FROM_NUMBER;
    }
    if (JWT_SECRET_KEY) {
      updateEnvVariables({ JWT_SECRET_KEY: JWT_SECRET_KEY });
      payload.JWT_SECRET_KEY = JWT_SECRET_KEY;
    }
    // if (website_logo && website_logo.length > 0)
    //   payload.website_logo = website_logo[0].path;
    if (await Admin.findOne({ where: { admin_id } })) {
      if (await Website_Setting.findOne({ where: { setting_id } })) {
        const editedWebSetting = await Website_Setting.update(payload, {
          where: { setting_id },
        });
        res.status(200).json({
          success: true,
          message: "Settings Edited Successfully",
        });
      } else {
        let websiteData = await Website_Setting.create(payload);
        return res.status(200).json({
          success: true,
          message: "Settings Edited Successfully",
        });

        // res.status(404).json({
        //   success: false,
        //   message: "Setting Not Found",
        // });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "You are Unauthorized for This action",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in Edit Settings" });
  }
}

async function getWebsiteSetting(req, res) {
  try {
    let settings = await Website_Setting.findAll();

    if (settings.length == 0) {
      await Website_Setting.create({});
      settings = await Website_Setting.findAll();
    }

    res.status(200).json({
      success: true,
      message: "Web Setting",
      Data: "Ommm",
      settings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in listing Web Settings from Id" });
  }
}
// Delete Web Setting

async function UploadLogo(req, res) {
  try {
    const { admin_id } = req.authData;
    const { logotype, setting_id } = req.body;

    const media = req.files;
    if (await Admin.findOne({ where: { admin_id } })) {
      if (logotype == "logo") {
        if (await Website_Setting.findOne({ where: { setting_id } })) {
          const editedWebSetting = await Website_Setting.update(
            { website_logo: media[0].path },
            {
              where: { setting_id },
            }
          );
          res.status(200).json({
            success: true,
            message: "Settings Edited Successfully",
          });
        }
      }
      if (logotype == "FAVICON") {
        if (await Website_Setting.findOne({ where: { setting_id } })) {
          const editedWebSetting = await Website_Setting.update(
            { website_fav_icon: media[0].path },
            {
              where: { setting_id },
            }
          );

          res.status(200).json({
            success: true,
            message: "Settings Edited Successfully",
          });
        }
      }
    } else {
      res.status(404).json({
        success: false,
        message: "You are Unauthorized for This action",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in Edit Settings" });
  }
}
module.exports = {
  editWebSettings,
  getWebsiteSetting,
  UploadLogo,
};
