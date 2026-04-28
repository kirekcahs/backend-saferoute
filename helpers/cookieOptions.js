const cookieOptions = {
  httpOnly: true,
  secure: true, // false in dev, true in prod
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
export default cookieOptions;
