import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔥 Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4oAfK9h9_7Jiztrj3M7XrQ6cd7h5lNqU",
  authDomain: "unimonollc-chat.firebaseapp.com",
  projectId: "unimonollc-chat",
  storageBucket: "unimonollc-chat.appspot.com",
  messagingSenderId: "261407303220",
  appId: "1:261407303220:web:608a2bed5e00539de98c61",
  measurementId: "G-LF73KMG6J5",
};

// 🔹 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("✅ Firebase Auth initialized!");

// 🔹 Khởi tạo reCAPTCHA (đợi Firebase sẵn sàng)
function initializeRecaptcha() {
  if (!auth) {
    console.error("❌ Firebase chưa sẵn sàng!");
    return;
  }

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: function (response) {
          console.log("✅ reCAPTCHA verified!");
        },
      }
    );

    window.recaptchaVerifier.render().then((widgetId) => {
      console.log("✅ reCAPTCHA Widget ID:", widgetId);
    });
  }
}

// 🔹 Hàm gửi OTP
function sendOTP(phoneNumber) {
  if (!phoneNumber) {
    alert("❌ Vui lòng nhập số điện thoại!");
    return;
  }

  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      console.log(confirmationResult);
      window.confirmationResult = confirmationResult;
      sessionStorage.setItem(
        "verificationId",
        confirmationResult.verificationId
      );
      alert("✅ OTP đã gửi! Kiểm tra điện thoại.");
    })
    .catch((error) => {
      console.error("❌ Lỗi gửi OTP:", error);
      alert("❌ Lỗi gửi OTP: " + error.message);
    });
}



// 🔹 Đợi Firebase sẵn sàng rồi khởi tạo reCAPTCHA
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    console.log("🕐 Đợi Firebase khởi tạo...");
    initializeRecaptcha();
  }, 1000); // Đợi 2 giây để Firebase chắc chắn đã khởi tạo
});

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("send-otp-button")) {
      console.log("🚀 OTP Button Clicked!");

      const phoneNumber = sessionStorage.getItem("phone_number");
      const dataToSend = sessionStorage.getItem("dataToSend");

      console.log("📞 Số điện thoại từ sessionStorage:", phoneNumber);
      console.log("📦 Dữ liệu cần gửi:", dataToSend);

      sendOTP(phoneNumber);
    }
  });
});


