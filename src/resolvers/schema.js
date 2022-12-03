export default {
  User: {
    receivedFRequests: async ({ id }, _args, { prisma }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      const result = await prisma.friendRequest.findMany({
        where: { receiverId: id }
      })

      console.log("***User.receivedFRequests: ", result)

      return result
    },

    sentFRequests: async ({ id }, _args, { prisma }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      return await prisma.friendRequest.findMany({
        where: { senderId: id }
      })
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
    }

    // isFriendsWithMe: async ({ id }, _args, { prisma, meId }) => {
    //   // result will be null if the friend is not found
    //   const result = await prisma.friend.findUnique({
    //     where: {
    //       userId: meId,
    //       friendId: id
    //     }
    //   })

    //   if (result) { return true }
    //   return false
    // }
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
