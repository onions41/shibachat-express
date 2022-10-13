export default function attachRefreshToken(res, token) {
  res.cookie(
    'refresh-token',
    token,
    // httpOnly, so it cannot be accessed by JavaScript
    { httpOnly: true }
  )
}
