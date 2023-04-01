"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = verifyAccessToken;

var _jsonwebtoken = require("jsonwebtoken");

/**
 * Verifies the access token and return the meId if successful
 * throws errors if fails
 */
function verifyAccessToken(accessToken) {
  if (!accessToken) {
    throw new Error("No Access Token Found!");
  }

  let payload;

  try {
    payload = (0, _jsonwebtoken.verify)(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new Error("Invalid Access Token!");
  }

  return payload.userId; // meId
}