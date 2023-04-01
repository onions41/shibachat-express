"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = refreshTokens;

var _jsonwebtoken = require("jsonwebtoken");

var _createTokens = require("./createTokens");

var _attachRefreshToken = _interopRequireDefault(require("./attachRefreshToken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  Express middleware that sends back a new access token and a new refresh token
 *  if the request had a valid refresh token in it
 */
// Can by async, you'd need to make it async to fetch from database
async function refreshTokens(prisma, req, res) {
  console.log("****/refresh-token middleware was hit*******");
  const refreshToken = req.cookies["refresh-token"]; // If the request cookie didn't contain a refresh token

  if (!refreshToken) {
    return res.send({
      ok: false,
      accessToken: ""
    });
  } // If the request cookie contained an invalid refresh token


  let payload;

  try {
    payload = (0, _jsonwebtoken.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return res.send({
      ok: false,
      accessToken: ""
    });
  } // token is valid and we can send back an access token


  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId
    }
  });

  if (!user) {
    return res.send({
      ok: false,
      accessToken: ""
    });
  } // tokenVesion might be incremented to revoke all existing tokens via a mutation
  // if (user.tokenVersion !== payload.tokenVersion) {
  //   return res.send({ ok: false, accessToken: '' })
  // }


  (0, _attachRefreshToken.default)(res, (0, _createTokens.createRefreshToken)(user));
  return res.send({
    ok: true,
    accessToken: (0, _createTokens.createAccessToken)(user)
  });
}