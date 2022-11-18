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
      return await prisma.friendRequest.findMany({
        where: { requesteeId: id },
        select: {
          status: true,
          requester: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })
    },

    receivedFReqFromMe: async ({ id }, _args, { prisma, meId }) => {
      // result will be null if the fReq is not found
      const result = await prisma.friendRequest.findUnique({
        where: {
          requesterId_requesteeId: {
            requesterId: meId,
            requesteeId: id
          }
        }
      })

      if (result) { return true }
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
}
