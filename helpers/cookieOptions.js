const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
}

export default cookieOptions