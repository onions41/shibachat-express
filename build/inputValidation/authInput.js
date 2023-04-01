"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _yup = require("yup");

var _default = (0, _yup.object)({
  nickname: (0, _yup.string)().required().trim().min(2).max(50),
  password: (0, _yup.string)().required().min(5).max(100)
});

exports.default = _default;