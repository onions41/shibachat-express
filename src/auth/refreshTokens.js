/**
 *  Express middleware that sends back a new access token and a new refresh token
 *  if the request had a valid refresh token in it
 */

import { verify } from 'jsonwebtoken'
import { createAccessToken, createRefreshToken } from './createTokens'
import attachRefreshToken from './attachRefreshToken'

// Can by async, you'd need to make it async to fetch from database
export default async function refreshTokens(prisma, req, res) {
  console.log('****/refresh-token middleware was hit*******')
  const refreshToken = req.cookies['refresh-token']

  // If the request cookie didn't contain a refresh token
  if (!refreshToken) {
    return res.send({ ok: false, accessToken: '' })
  }

  // If the request cookie contained an invalid refresh token
  let payload
  try {
    payload = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  } catch (err) {
    console.log(err)
    return res.send({ ok: false, accessToken: '' })
  }

  // token is valid and we can send back an access token
  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId
    }
  })

  if (!user) {
    return res.send({ ok: false, accessToken: '' })
  }

  // tokenVesion might be incremented to revoke all existing tokens via a mutation
  // if (user.tokenVersion !== payload.tokenVersion) {
  //   return res.send({ ok: false, accessToken: '' })
  // }

  attachRefreshToken(res, createRefreshToken(user))

  return res.send({ ok: true, accessToken: createAccessToken(user) })
}
