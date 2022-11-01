import { sign } from 'jsonwebtoken'

// user is a user object with at least the user.id field
export function createAccessToken(user) {
  return sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  )
}

// user is a user object with at least the user.id field
// TODO: need to get user's password hass in their so
// the refreshtoken would be invalidated on password change
export function createRefreshToken(user) {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '6d' }
  )
}
