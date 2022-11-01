export default function attachRefreshToken(res, token) {
  res.cookie('refresh-token', token, {
    httpOnly: true,
    path: '/refresh-token',
    // A little less than 1 week
    maxAge: 600000000
    // TODO: set secure and sameSite options after https is set up
  })
}
