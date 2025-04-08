const mysql = require("mysql2");
const fs = require("fs");

// 1. Kết nối đến MySQL
const connection = mysql.createConnection({
  host: "103.124.93.27",
  user: "master",
  password: "minhha2k3",
  database: "whoxa_enochtech_db"
});

connection.connect(err => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
    return;
  }
  console.log("✅ Kết nối MySQL thành công!");

  // 2. Đọc file JSON
  fs.readFile("abc.json", "utf-8", (err, rawData) => {
    if (err) {
      console.error("❌ Lỗi đọc file JSON:", err);
      connection.end();
      return;
    }

    let records;
    try {
      records = JSON.parse(rawData);
    } catch (parseError) {
      console.error("❌ Lỗi phân tích JSON:", parseError);
      connection.end();
      return;
    }

    // 3. Xóa toàn bộ dữ liệu cũ
    connection.query("DELETE FROM Language_settings", (err, result) => {
      if (err) {
        console.error("❌ Lỗi xóa dữ liệu cũ:", err);
        connection.end();
        return;
      }
      console.log(`🗑 Đã xóa ${result.affectedRows} dòng cũ`);

      // 4. Chèn dữ liệu JSON vào MySQL (Giữ `Việt Nam`)
      const sql = `
        INSERT INTO Language_settings (setting_id, \`key\`, English, \`Việt Nam\`, createdAt, updatedAt)
        VALUES ?
      `;

      const values = records.map(item => [
        item.setting_id,
        item.key,
        item.English,
        item["Việt Nam"], // Giữ nguyên `Việt Nam`
        item.createdAt,
        item.updatedAt
      ]);

      connection.query(sql, [values], (err, result) => {
        if (err) {
          console.error("❌ Lỗi chèn dữ liệu:", err);
        } else {
          console.log(`✅ Đã nhập ${result.affectedRows} dòng mới`);
        }
        connection.end();
      });
    });
  });
});
