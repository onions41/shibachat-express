export default {
  User: {
    // sentFRequests: async ({ id }, _args, { prisma }) => {
    //   // This SQL would work just as well.
    //   // SELECT users.id, users.nickname
    //   // FROM friend_requests JOIN users
    //   // ON friend_requests.requestee_id = users.id
    //   // WHERE friend_requests.requester_id = %i
    //   // %i = id

    //   // Does not throw errors if it doesn't find anything. Just returns [].
    //   const results = await prisma.friendRequest.findMany({
    //     where: { requesterId: id },
    //     select: {
    //       requestee: {
    //         select: {
    //           id: true,
    //           nickname: true
    //         }
    //       }
    //     }
    //   })

    //   // Mapping to get at the nested User objects
    //   return results.map((e) => e.requestee)
    // },

    receivedFRequests: async ({ id }, _args, { prisma }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      const result = await prisma.friendRequest.findMany({
        where: { friendId: id }
      })

      console.log("***User.receivedFRequests: ", result)

      return result
    },

    sentFRequests: async ({ id }, _args, { prisma }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      return await prisma.friendRequest.findMany({
        where: { meId: id }
      })
    },

    receivedFReqFromMe: async ({ id }, _args, { prisma, meId }) => {
      // result will be null if the fReq is not found
      const result = await prisma.friendRequest.findUnique({
        where: {
          meId_friendId: {
            meId,
            friendId: id
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
    // TODO: The 2 resolvers requester and requestee is idential.
    // move this out to a commons folder
    me: async ({ meId }, _args, { prisma }) => {
      // TODO: Consider replacing with findUniqueOrThrow
      const user = await prisma.user.findUnique({
        where: { id: meId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error("***user Query could not find a user with that id")
      }
      return user
    },

    friend: async ({ friendId }, _args, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { id: friendId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error("***user Query could not find a user with that id")
      }
      return user
    }
  }
}
