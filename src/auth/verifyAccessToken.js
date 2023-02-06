/**
 * Verifies the access token and return the meId if successful
 * throws errors if fails
 */

import { verify } from "jsonwebtoken"

export default function verifyAccessToken(accessToken) {
  if (!accessToken) {
    throw new Error(
      "No Access Token Found!"
    )
  }
  let payload
  try {
    payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
  } catch {
    throw new Error(
      "Invalid Access Token!"
    )
  }
  return payload.userId // meId
}
