const { User, AllContact } = require("../models");

async function addOrUpdateContactInAllcontacts({
  first_name,
  last_name,
  user_id,
}) {
  // Check if the user already exists in database
  let userData = await User.findOne({
    where: { user_id },
  });

  userData = userData.dataValues;
  // Create or update entry in AllContact of this user
  const contactDetail = await AllContact.findOne({
    where: {
      user_id: user_id,
      phone_number: userData.phone_number,
    },
  });

  if (contactDetail) {
    await AllContact.update(
      { full_name: `${first_name} ${last_name}` },
      {
        where: {
          user_id: user_id,
          phone_number: userData.phone_number,
        },
      }
    );
  } else {
    await AllContact.create({
      phone_number: userData.phone_number,
      full_name: `${first_name} ${last_name}`,
      user_id: user_id,
    });
  }
}

module.exports = addOrUpdateContactInAllcontacts;
