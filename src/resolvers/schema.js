export default {
  User: {
    receivedFRequests: async (_parent, _args, { prisma, meId }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      const result = await prisma.friendRequest.findMany({
        where: { receiverId: meId }
      })

      console.log("***User.receivedFRequests: ", result)

      return result
    },

    sentFRequests: async (_parent, _args, { prisma, meId }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      return await prisma.friendRequest.findMany({
        where: { senderId: meId }
      })
    },

    async friends(_parent, _args, { prisma, meId }) {
      // Does not throw errors if it doesn't find anything. Just returns [].
      const results = await prisma.friend.findMany({
        where: { userId: meId },
        select: {
          friend: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })
      /**
       * results look like:
       *  [
       *    { friend: { id: 1, nickname: "Homer" } },
       *    { friend: { id: 2, nickname: "Marge" } }
       *  ]
       * but I want to return:
       *  [
       *    { id: 1, nickname: "Homer" },
       *    { id: 2, nickname: "Marge" }
       *  ]
       */
      return results.map((result) => result.friend)
    },

    receivedFReqFromMe: async ({ id }, _args, { prisma, meId }) => {
      // result will be null if the fReq is not found
      const result = await prisma.friendRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: meId,
            receiverId: id
          }
        }
      })

      if (result) {
        return true
      }
      return false
    },

    isFriendsWithMe: async ({ id }, _args, { prisma, meId }) => {
      // Looks for row in friends table where user_id is the current user's id
      // and friend_id is the id of the user being fetched.
      const result = await prisma.friend.findUnique({
        where: {
          userId: meId,
          friendId: id
        }
      })

      if (result) {
        return true
      }
      return false
    }
  },

  FriendRequest: {
    sender: async ({ senderId }, _args, { prisma }) => {
      // TODO: Consider replacing with findUniqueOrThrow
      const user = await prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error("***user Query could not find a user with that id")
      }
      return user
    },

    receiver: async ({ receiverId }, _args, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error("***user Query could not find a user with that id")
      }
      return user
    }
  }
}
