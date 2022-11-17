export default {
  Query: {
    // Fetches a single user
    user: async (_parent, _args, { prisma, meId }) => {
      const user = await prisma.user.findUnique({
        where: { id: meId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error('***user Query could not find a user with that id')
      }
      return user
    },

    // Fetches multiple users
    // Right now it just fetches all users
    users: async (_parent, _args, { prisma }) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          nickname: true
        }
      })
      return users
    }
  },

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

  Mutation: {
    sendFRequest: async (_parent, { friendId }, { prisma, meId }) => {
      if (friendId === meId) {
        throw new Error('***sendFriendRequest resolver: You cannot add yourself as a friend')
      }

      const friend = await prisma.user.findUnique({
        where: {
          id: friendId
        },
        select: {
          id: true,
          nickname: true
        }
      })
      // Must throw error manually as findUnique does not
      if (!friend) {
        throw new Error('Could not find a Shiba with that nickname')
      }

      // Throws error if cannot be created
      await prisma.friendRequest.create({
        data: {
          requesterId: meId,
          requesteeId: friendId
        }
      })

      return friend
    }
  }
}
