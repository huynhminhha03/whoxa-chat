import {
  u as E,
  a as j,
  r,
  s as S,
  b as m,
  c as A,
  d as C,
  j as t,
  e,
  f as F,
  g as P,
} from "./index-bdcf4d85.js";
import { F as D, a as L, b as q, c as M } from "./index-a3061cd8.js";
const O = () => {
  const o = E(),
    x = j();
  r.useEffect(() => {
    o(S("Login"));
  }, [o]),
    m((a) => a.themeConfig.theme === "dark" || a.themeConfig.isDarkMode),
    m((a) => a.themeConfig.rtlClass);
  const w = m((a) => a.themeConfig);
  let { data: n } = A();
  r.useState(w.locale);
  const [l, N] = r.useState("demo@whoxa.com"),
    [d, k] = r.useState("Admin@123"),
    [c, v] = r.useState(!1),
    [g, i] = r.useState(null),
    { postData: y, loading: p } = C(),
    _ = async (a) => {
      var u, h, f, b;
      if ((a.preventDefault(), l === "")) {
        i("Email is required!");
        return;
      }
      if (d === "") {
        i("Password is required!");
        return;
      }
      try {
        const s = await y("admin-login", { admin_email: l, admin_password: d });
        if ((console.log(s), !s || s.success === !1)) {
          i(s.message || "Login failed");
          return;
        } else
          F.set("adminToken", s.token, { expires: 30 }),
            o(
              P({
                name: s.isAdmin.admin_name,
                profilePic: s.isAdmin.profile_pic,
                isAdmin: !0,
                adminEmail: l,
              })
            ),
            console.log(s.isAdmin.profile_pic),
            x("/");
      } catch (s) {
        console.error(
          ((h = (u = s.response) == null ? void 0 : u.data) == null
            ? void 0
            : h.message) || "An error occurred"
        ),
          i(
            ((b = (f = s.response) == null ? void 0 : f.data) == null
              ? void 0
              : b.message) || "An error occurred"
          );
      }
    };
  return t("div", {
    children: [
      e("div", {
        className: "absolute inset-0",
        children: e("img", {
          src: "/assets/images/auth/bg-gradient.png",
          alt: "background",
          className: "h-full w-full object-cover",
        }),
      }),
      t("div", {
        className:
          "relative flex min-h-screen items-center justify-center bg-[url(/Final.png)] bg-cover bg-top bg-no-repeat px-6 py-10  sm:px-16",
        children: [
          e("img", {
            src: "/assets/images/auth/coming-soon-object1.png",
            alt: "object",
            className:
              "absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2",
          }),
          e("img", {
            src: "/assets/images/auth/coming-soon-object3.png",
            alt: "object",
            className: "absolute right-0 top-0 h-[300px]",
          }),
          e("div", {
            className:
              "relative w-full max-w-[870px] rounded-md p-2 bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,#fff9f9_100%)] bg-[length:200%_200%] animate-gradientRotation dark:bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,#fff9f9_100%)]",
            children: e("div", {
              className:
                "relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-white/60 px-6 lg:min-h-[758px] py-20",
              children: t("div", {
                className: "mx-auto w-full max-w-[440px]",
                children: [
                  t("div", {
                    className: "mb-10 flex-col text-center justify-around",
                    children: [
                      e("img", {
                        src: n == null ? void 0 : n.settings[0].website_logo,
                        className: "w-32 mx-auto mb-20",
                        alt: "Logo",
                      }),
                      e("h1", {
                        className:
                          "text-3xl font-extrabold uppercase !leading-snug text-black md:text-4xl",
                        children: "Sign in",
                      }),
                      e("p", {
                        className:
                          "text-base font-bold leading-normal text-white-dark",
                        children: "Enter your email and password to login",
                      }),
                    ],
                  }),
                  t("form", {
                    className: "space-y-5 dark:text-black",
                    onSubmit: _,
                    children: [
                      t("div", {
                        children: [
                          e("label", {
                            htmlFor: "admin_email",
                            children: "Email",
                          }),
                          t("div", {
                            className: "relative text-white-dark",
                            children: [
                              e("input", {
                                id: "admin_email",
                                type: "email",
                                placeholder: "Enter Email",
                                className:
                                  "form-input dark:bg-white dark:text-dark dark:border-yellow-200 focus:border-[1px] focus:border-yellow-300 ps-10 placeholder:text-white-dark",
                                value: l,
                                onChange: (a) => N(a.target.value),
                              }),
                              e("span", {
                                className:
                                  "absolute start-4 top-1/2 -translate-y-1/2",
                                children: e(D, { className: "text-xl" }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      t("div", {
                        children: [
                          e("label", {
                            htmlFor: "admin_password",
                            children: "Password",
                          }),
                          t("div", {
                            className: "relative text-white-dark",
                            children: [
                              e("input", {
                                id: "admin_password",
                                type: c ? "text" : "password",
                                placeholder: "Enter Password",
                                className:
                                  "form-input dark:bg-white dark:text-dark dark:border-yellow-200 focus:border-[1px] focus:border-yellow-300 ps-10 placeholder:text-white-dark",
                                value: d,
                                onChange: (a) => k(a.target.value),
                              }),
                              e("span", {
                                className:
                                  "absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer",
                                onClick: () => v(!c),
                                children: c
                                  ? e(L, { className: "text-xl" })
                                  : e(q, { className: "text-xl" }),
                              }),
                              e("span", {
                                className:
                                  "absolute start-4 top-1/2 -translate-y-1/2",
                                children: e(M, { className: "text-xl" }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e("button", {
                        type: "submit",
                        className:
                          "btn bg-gradient-to-tr hover:bg-gradient-to-tl from-yellow-400 to-white !mt-9 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]",
                        disabled: p,
                        children: p ? "Signing in..." : "Sign in",
                      }),
                      g && e("p", { className: "text-red-500", children: g }),
                    ],
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
    ],
  });
};
export { O as default };
