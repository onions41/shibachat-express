"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _resolverDependencies = require("../resolverDependencies");

var _default = {
  Mutation: {
    sendFRequest: async (_parent, {
      receiverId
    }, {
      prisma,
      meId
    }) => {
      if (receiverId === meId) {
        throw new Error("***sendFriendRequest resolver: You cannot add yourself as a friend");
      } // Checks to see if already friends


      const friend = await prisma.friend.findUnique({
        where: {
          userId_friendId: {
            userId: meId,
            friendId: receiverId
          }
        }
      }); // Throw error if already friends

      if (friend) {
        throw new Error("You are already friends with this Inu");
      }

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId
        },
        select: {
          id: true,
          nickname: true
        }
      }); // Must throw error manually as findUnique does not

      if (!receiver) {
        throw new Error("Could not find a Shiba with that nickname");
      } // Throws error if cannot be created


      return await prisma.friendRequest.create({
        data: {
          senderId: meId,
          receiverId
        }
      }); // Returning the created friendRequest obj.
      // Did not use select or include options as I wall all
      // scalar fields to be selected and non of the type fields tolibraries
      // be loaded eagerly. (the type fields are taken care of by the
      // type resolvers.)
    },
    cancelFRequest: async (_parent, {
      receiverId
    }, {
      meId,
      prisma
    }) => {
      // Throws error if the friend request is not found
      return await prisma.friendRequest.delete({
        where: {
          senderId_receiverId: {
            senderId: meId,
            receiverId
          }
        }
      });
    },
    acceptFRequest: async (_parent, {
      senderId
    }, {
      meId,
      prisma
    }) => {
      // Checks to see if the friend request being accepted exists
      try {
        // Throws a generic NotFoundError
        await prisma.friendRequest.findUniqueOrThrow({
          where: {
            senderId_receiverId: {
              senderId,
              receiverId: meId
            }
          }
        });
      } catch (error) {
        throw new Error("The friend request you are trying to accept does not exist.");
      } // Checks to see if the user that sent the friend request exists


      let friend;

      try {
        // Throws a generic NotFoundError
        friend = await prisma.user.findUniqueOrThrow({
          where: {
            id: senderId
          }
        });
      } catch (error) {
        throw new Error("The user that sent you this friend request does not exist");
      } // Deletes the friendRequest that was sent to me


      const acceptedFRequest = await prisma.friendRequest.delete({
        where: {
          senderId_receiverId: {
            senderId,
            receiverId: meId
          }
        }
      }); // Deletes the friendRequest I sent to them (if exists)

      let mirroredFRequest;

      try {
        const mirroredFRequest = await prisma.friendRequest.delete({
          where: {
            senderId_receiverId: {
              senderId: meId,
              receiverId: senderId
            }
          }
        });
      } catch {// shallow the error.
      } // Creates the entries in the friend join table. Both directions.


      await prisma.friend.createMany({
        data: [{
          userId: senderId,
          friendId: meId
        }, {
          userId: meId,
          friendId: senderId
        }],
        skipDuplicates: true
      });
      return {
        acceptedFRequest,
        mirroredFRequest,
        // Reminder: Nullable
        friend
      };
    },
    blockFRequest: async (_parent, {
      senderId
    }, {
      prisma,
      meId
    }) => {
      // Updates the friend request's status to "BLOCKED"
      const fRequest = await prisma.friendRequest.update({
        where: {
          senderId_receiverId: {
            senderId,
            receiverId: meId
          }
        },
        data: {
          status: "BLOCKED"
        }
      });
      return fRequest;
    },
    unblockFRequest: async (_parent, {
      senderId
    }, {
      prisma,
      meId
    }) => {
      // Updates the friend request's status to "PENDING"
      const fRequest = await prisma.friendRequest.update({
        where: {
          senderId_receiverId: {
            senderId,
            receiverId: meId
          }
        },
        data: {
          status: "PENDING"
        }
      });
      return fRequest;
    },
    unfriend: async (_parent, {
      friendId
    }, {
      prisma,
      meId
    }) => {
      // TODO: Cascade delete all friendships and friendrequests when a user is deleted.
      // Delete the friendship records
      const forwardFriendship = prisma.friend.delete({
        where: {
          userId_friendId: {
            userId: meId,
            friendId
          }
        }
      });
      const reverseFriendship = prisma.friend.delete({
        where: {
          userId_friendId: {
            userId: friendId,
            friendId: meId
          }
        }
      }); // Transaction used to keep changes atomic

      await prisma.$transaction([forwardFriendship, reverseFriendship]);
      const friend = await prisma.user.findUnique({
        where: {
          id: friendId
        },
        select: {
          id: true,
          nickname: true
        }
      }); // If the friend user was not found due to being deleted,
      // still need to return at least the id

      return !friend ? {
        id: friendId
      } : friend;
    },
    // End of unfriend
    sendMessage: async (_parent, {
      receiverId,
      textContent
    }, {
      prisma,
      meId
    }) => {
      // Throws error if cannot be created, returns the created message.
      const message = await prisma.message.create({
        data: {
          senderId: meId,
          receiverId,
          textContent
        }
      });

      _resolverDependencies.pubsub.publish("NEW_MESSAGE", {
        newMessage: message
      });

      return message;
    }
  }
};
exports.default = _default;