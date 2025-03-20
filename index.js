const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./models");
const upload = require("./middleware/upload");
dotenv.config();
const cors = require("cors");
const fs = require("fs");
const no_auth_route = require("./routes/NoAuthRoutes");
const auth_routes = require("./routes/AuthRoutes");
const admin_routes = require("./routes/Admin.routes");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const {
  UserSocket,
  Language_status
} = require("./models");
const jwt = require("jsonwebtoken");
const os = require("os");
const getmac = require("getmac")["default"];
const axios = require("axios");
const io = socketIo(server, {
  cors: {
    origin: true
  },
  path: "/socket"
});
const port = process.env.PORT || 0xbb8;
const authMiddleware = require("./middleware/authMiddleware");
const socketService = require("./reusable/socketService");
const cron = require("node-cron");
const {
  removeStatusAfter24Hours
} = require("./controller/Status/removeStatusAfter24Hours");
app.use(cors({
  origin: "*"
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(upload.array("files"));
app.use("/uploads", express["static"]("uploads"));
app.use("/public", express["static"]("public"));
cron.schedule("0 * * * *", () => {
  removeStatusAfter24Hours();
});
// const validatePurchaseCode = async (_0x30c56f, _0x44aa5a, _0x1ecb63) => {
//   if (!fs.existsSync("./validatedToken.txt")) {
//     return _0x44aa5a.sendFile(path.join(__dirname, "public", "validate.html"));
//   } else {
//     const _0x4aa326 = await verifyToken();
//     if (!_0x4aa326) {
//       return _0x44aa5a.sendFile(path.join(__dirname, "public", "validate.html"));
//     }
//   }
//   _0x1ecb63();
// };
// app.use((_0x17b1ac, _0x190529, _0x51efac) => {
//   if (_0x17b1ac.path === "/api/validate") {
//     return _0x51efac();
//   }
//   validatePurchaseCode(_0x17b1ac, _0x190529, _0x51efac);
// });
// app.post("/api/validate", async (_0xee98a2, _0x16049b) => {
//   console.log("Received Headers:", _0xee98a2.headers);
//   console.log("Received Body:", _0xee98a2.body);
//   const _0x9f58f1 = getMacAddress();
//   const {
//     purchase_code: _0x39ba55,
//     username: _0x3db116
//   } = _0xee98a2.body;
//   if (!_0x9f58f1) {
//     return _0x16049b.status(0x1f4).json({
//       error: "Unable to retrieve MAC address."
//     });
//   }
//   if (!_0x39ba55) {
//     return _0x16049b.status(0x190).json({
//       error: "Purchase code is required."
//     });
//   }
//   if (!_0x3db116) {
//     return _0x16049b.status(0x190).json({
//       error: "username is required."
//     });
//   }
//   try {
//     const _0x48c85e = await axios.post("http://62.72.36.245:1142/validate", {
//       purchase_code: _0x39ba55,
//       username: _0x3db116
//     }, {
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "User-Agent": "Your User Agent",
//         "X-MAC-Address": getMacAddress(),
//         "X-Device-IP": getServerIP()
//       }
//     });
//     console.log(_0x48c85e);
//     if (_0x48c85e.data.status == "used") {
//       return _0x16049b.status(0x190).json({
//         error: _0x48c85e.data.message
//       });
//     }
//     if (_0x48c85e.data.status == "error") {
//       return _0x16049b.status(0x190).json({
//         error: _0x48c85e.data.message
//       });
//     }
//     if (_0x48c85e.data.status == "invalid") {
//       return _0x16049b.status(0x190).json({
//         error: _0x48c85e.data.message
//       });
//     }
//     const {
//       token: _0x44eddb
//     } = _0x48c85e.data;
//     fs.writeFileSync("./validatedToken.txt", _0x44eddb);
//     _0x16049b.json({
//       message: "Validation successful!",
//       token: _0x44eddb
//     });
//   } catch (_0xdf43b0) {
//     console.error("Validation error:", _0xdf43b0);
//     _0x16049b.status(0x190).json({
//       error: "Validation failed!"
//     });
//   }
// });
// async function verifyToken() {
//   const _0x13707b = path.join(__dirname, "validatedToken.txt");
//   if (!fs.existsSync(_0x13707b)) {
//     console.log("Token file does not exist. No verification needed.");
//     return false;
//   }
//   try {
//     const _0x1840c6 = await fs.promises.readFile(_0x13707b, "utf-8");
//     const _0x17293f = await axios.post("http://62.72.36.245:1142/verify_new", {
//       server_ip: getServerIP(),
//       mac_address: getMacAddress(),
//       token: _0x1840c6
//     });
//     if (!_0x17293f.data.success) {
//       console.log("Token verification failed. Removing current directory...");
//       return false;
//     }
//     return _0x17293f.data.success;
//   } catch (_0x1c11d7) {
//     console.error("Error during token verification:", _0x1c11d7);
//     return false;
//   }
// }
// function getMacAddress() {
//   try {
//     const _0x1199e1 = getmac();
//     return _0x1199e1;
//   } catch (_0x3637dd) {
//     console.error("Error fetching MAC address:", _0x3637dd);
//     return null;
//   }
// }
// function getServerIP() {
//   const _0x1e7dd3 = os.networkInterfaces();
//   for (const _0x27d771 in _0x1e7dd3) {
//     for (const _0x531cbc of _0x1e7dd3[_0x27d771]) {
//       if (_0x531cbc.family === "IPv4" && !_0x531cbc.internal) {
//         return _0x531cbc.address;
//       }
//     }
//   }
//   return "IP address not found";
// }
app.use(express["static"](path.join(__dirname, "/frontend")));
app.use(express["static"](path.join(__dirname, "/admin")));
app.get("/", async (_0xe14c70, _0x2925ce) => {
  try {
    return _0x2925ce.sendFile(path.join(__dirname, "/frontend", "index.html"));
  } catch (_0x308588) {
    _0x2925ce.status(0x1f4).json({
      error: _0x308588.message
    });
  }
});
app.get("/admin/*", async (_0x2d70ba, _0x1509b2) => {
  try {
    return _0x1509b2.sendFile(path.join(__dirname, "/admin", "index.html"));
  } catch (_0x1ccab6) {
    _0x1509b2.status(0x1f4).json({
      error: _0x1ccab6.message
    });
  }
});
app.get("/admin", async (_0x3541de, _0x315bd6) => {
  try {
    return _0x315bd6.sendFile(path.join(__dirname, "/admin", "index.html"));
  } catch (_0xa580c) {
    _0x315bd6.status(0x1f4).json({
      error: _0xa580c.message
    });
  }
});
app.use("/api", no_auth_route);
const handleUserSocketAssociation = async (_0x155391, _0x1447fd) => {
  let _0x5bb2d6 = _0x155391.handshake.query.token;
  let _0xe0cffb;
  if (!_0x5bb2d6) {
    return _0x1447fd(new Error("Missing token during connection."));
  }
  try {
    let _0x28de69 = process.env.JWT_SECRET_KEY;
    _0xe0cffb = jwt.verify(_0x5bb2d6, _0x28de69);
    _0x155391.handshake.query.user_id = _0xe0cffb.user_id;
    _0x155391.handshake.query.user_id = _0xe0cffb.user_id;
  } catch (_0x56beb9) {
    console.error(_0x56beb9);
    return _0x1447fd(new Error("Invalid token"));
  }
  try {
    const _0x3d7a05 = _0x155391.handshake.query.user_id;
    await UserSocket.create({
      user_id: _0x3d7a05,
      socketId: _0x155391.id
    });
    _0x1447fd();
  } catch (_0x433150) {
    console.error("Error storing user/socket association:", _0x433150);
    _0x1447fd(new Error("Error storing user/socket association."));
  }
};
io.use(handleUserSocketAssociation);
socketService.initSocket(io);
app.use("/api", authMiddleware, auth_routes);
app.use("/api", authMiddleware, admin_routes);
app.get("*", (_0x2fa79f, _0x24fa08) => {
  _0x24fa08.sendFile(path.join(__dirname, "frontend", "index.html"));
});
app.use((_0x359891, _0x4e1da1, _0x1a907e, _0x5b8ab7) => {
  console.error(_0x359891.stack);
  _0x1a907e.status(0x1f4).json({
    message: "Something went wrong!",
    success: false
  });
});
const {
  addLanguageColumn,
  addDefaultEntries
} = require("./reusable/add_new_language");
const {
  checkAppFlowAndCreate
} = require("./controller/Admin/AppFlow.Controller");
const {
  checkAdminAndCreate
} = require("./controller/Admin/admin.login");
const {
  checkAppsettingAndCreate
} = require("./controller/Admin/appsettingController");
const {
  checkOneSignalsettingAndCreate
} = require("./controller/Admin/oneSignalsettingController");
async function fetchLanguages() {
  try {
    const _0x5d235b = await Language_status.findAll();
    const _0x4dd02c = _0x5d235b.map(_0x58aead => {
      return _0x58aead.dataValues.language;
    });
    return _0x4dd02c;
  } catch (_0x374ba7) {
    console.error("Error fetching languages:", _0x374ba7);
  }
}
db.sequelize.sync({
  alter: false
}).then(async () => {
  await checkAppFlowAndCreate();
  await checkAdminAndCreate();
  await checkAppsettingAndCreate();
  await checkOneSignalsettingAndCreate();
  await addDefaultEntries();
  console.log("Database Connected ✅!");

      const _0x150748 = await fetchLanguages();
      if (_0x150748 && _0x150748.length > 0x0) {
        for (let _0x2ba779 = 0x0; _0x2ba779 < _0x150748.length; _0x2ba779++) {
          const _0x44ae1e = _0x150748[_0x2ba779];
          await addLanguageColumn(_0x44ae1e);
        }
      } else {
        console.log("No languages found.");
      };
    

  server.listen(port, () => {
    console.log("Server listening on port " + port + "!");
  });
});
