"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;

var _jsonwebtoken = require("jsonwebtoken");

// user is a user object with at least the user.id field
function createAccessToken(user) {
  return (0, _jsonwebtoken.sign)({
    userId: user.id
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d"
  });
} // user is a user object with at least the user.id field
// TODO: need to get user's password hass in their so
// the refreshtoken would be invalidated on password change


function createRefreshToken(user) {
  return (0, _jsonwebtoken.sign)({
    userId: user.id,
    tokenVersion: user.tokenVersion
  }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "6d"
  });
}