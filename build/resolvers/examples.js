"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = require("jsonwebtoken");

var _default = {
  Query: {
    example1: async (_parent, _args, _context) => {
      return {
        name: "Homer",
        height: 180
      };
    },
    findUser: (_parent, {
      nickname
    }, {
      User
    }) => {
      const result = User.findUser(nickname);

      if (result) {
        return result;
      }

      return null;
    },
    protected: (_parent, _args, {
      req,
      res
    }) => {
      console.log("*Protected Query*: ", "Hi there******************");
      let ATPayload;

      try {
        ATPayload = (0, _jsonwebtoken.verify)(req.headers["access-token"], process.env.ACCESS_TOKEN_SECRET);
      } catch (error) {
        ATPayload = "INVALID ACCESS TOKEN";
      }

      let RTPayload;

      try {
        RTPayload = (0, _jsonwebtoken.verify)(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
      } catch (error) {
        RTPayload = "INVALID REFRESH TOKEN";
      }

      console.log("*access-token*: ", req.headers["access-token"]);
      console.log("*access-token payload*: ", ATPayload);
      console.log("*refresh-token*: ", req.cookies["refresh-token"]);
      console.log("*refresh-token payload*: ", RTPayload);
      return true;
    },
    unprotected: (_parent, _args, {
      req,
      res
    }) => {
      console.log("**Unprotected Query**: ", "Hi there**************************");
      let ATPayload;

      try {
        ATPayload = (0, _jsonwebtoken.verify)(req.headers["access-token"], process.env.ACCESS_TOKEN_SECRET);
      } catch (error) {
        ATPayload = "INVALID ACCESS TOKEN";
      }

      let RTPayload;

      try {
        RTPayload = (0, _jsonwebtoken.verify)(req.cookies["refresh-token"], process.env.REFRESH_TOKEN_SECRET);
      } catch (error) {
        RTPayload = "INVALID REFRESH TOKEN";
      }

      console.log("*access-token*: ", req.headers["access-token"]);
      console.log("*access-toke payload*: ", ATPayload);
      console.log("*refresh-token*: ", req.cookies["refresh-token"]);
      console.log("*refresh-token payload*: ", RTPayload);
      return true;
    }
  }
};
exports.default = _default;