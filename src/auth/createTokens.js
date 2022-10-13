import { sign } from 'jsonwebtoken'

// user is a user object with at least the user.id field
export function createAccessToken(user) {
  return sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  )
}

// user is a user object with at least the user.id field
export function createRefreshToken(user) {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )
}
