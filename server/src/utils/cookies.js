export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("rocket_access_token", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/"
  });

  res.cookie("rocket_refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("rocket_access_token", { path: "/" });
  res.clearCookie("rocket_refresh_token", { path: "/" });
};