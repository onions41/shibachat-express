"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pubsub = void 0;
Object.defineProperty(exports, "withFilter", {
  enumerable: true,
  get: function () {
    return _graphqlSubscriptions.withFilter;
  }
});

var _graphqlSubscriptions = require("graphql-subscriptions");

const pubsub = new _graphqlSubscriptions.PubSub();
exports.pubsub = pubsub;