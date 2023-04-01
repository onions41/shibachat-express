"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _resolverDependencies = require("../resolverDependencies");

var _default = {
  Subscription: {
    newMessage: {
      subscribe: (0, _resolverDependencies.withFilter)(() => _resolverDependencies.pubsub.asyncIterator("NEW_MESSAGE"), (payload, {
        friendId
      }, {
        meId
      }) => {
        return (// For messages coming to me from the friend
          payload.newMessage.receiverId === meId && payload.newMessage.senderId === friendId || // For messages I am sending to the friend
          payload.newMessage.senderId === meId && payload.newMessage.receiverId === friendId
        );
      })
    }
  }
};
exports.default = _default;