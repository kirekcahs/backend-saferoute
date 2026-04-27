const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // false in dev, true in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
}
export default cookieOptions