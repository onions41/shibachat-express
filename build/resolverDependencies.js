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

var _graphqlRedisSubscriptions = require("graphql-redis-subscriptions");

// options object example
// {
//   port: 6379, // Redis port
//   host: "127.0.0.1", // Redis host
//   username: "default", // needs Redis >= 6
//   password: "my-top-secret",
//   db: 0, // Defaults to 0
// retryStrategy: (times) => {
//   // reconnect after
//   return Math.min(times * 50, 2000)
// }
// }
const pubsub = new _graphqlRedisSubscriptions.RedisPubSub({
  connection: process.env.REDIS_URL
});
exports.pubsub = pubsub;