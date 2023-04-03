"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _createTokens = require("../auth/createTokens");

var _attachRefreshToken = _interopRequireDefault(require("../auth/attachRefreshToken"));

var _authInput = _interopRequireDefault(require("../inputValidation/authInput"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Module imports
// Internal imports
var _default = {
  Query: {},
  Mutation: {
    login: async (_parent, args, {
      res,
      prisma
    }) => {
      // Input validation with Yup.
      const {
        nickname,
        password
      } = await _authInput.default.validate(args); // Finds user with the nickname

      const user = await prisma.user.findUnique({
        where: {
          nickname
        },
        select: {
          id: true,
          nickname: true,
          password: true
        }
      }); // Must throw error manually as findUnique does not

      if (!user) {
        throw new Error("Could not find a Shiba with that nickname");
      } // Compares the entered password with the saved password


      const valid = await _bcrypt.default.compare(password, user.password);

      if (!valid) {
        throw new Error("Incorrect password");
      } // Login successful so return an access token
      // And attach a refresh token to the cookie


      const payload = {
        id: user.id,
        nickname: user.nickname
      };
      (0, _attachRefreshToken.default)(res, (0, _createTokens.createRefreshToken)(payload));
      return (0, _createTokens.createAccessToken)(payload);
    },
    register: async (_parent, args, {
      res,
      prisma
    }) => {
      console.log("register resolver runs, args: ", args); // *************
      // Input validation with Yup.

      const {
        nickname,
        password
      } = await _authInput.default.validate(args); // This will always work because password is validated.

      const hashedPassword = await _bcrypt.default.hash(password, 10); // Unique validation on nickname happens here.
      // Other database errors will be thrown here too. Ex, connectivity errors.
      // The returned user will become the payload of both tokens.

      const payload = await prisma.user.create({
        data: {
          nickname,
          password: hashedPassword
        },
        select: {
          id: true,
          nickname: true
        }
      }); // Registration was successful if no error was thrown by this point.
      // TODO: Raw errors are going straight to the front end right now.
      // I should log the errors and store them too later.

      (0, _attachRefreshToken.default)(res, (0, _createTokens.createRefreshToken)(payload));
      return (0, _createTokens.createAccessToken)(payload);
    },
    logout: async (_parent, _args, {
      res
    }) => {
      // Just needs to send back '' as a refresh token in the cookie
      // Frontend can delete its access token by itself.
      (0, _attachRefreshToken.default)(res, "");
      return true;
    } // revokeTokens: async () => {

  } // End of mutations

};
exports.default = _default;