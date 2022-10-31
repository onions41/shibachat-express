export default {
  Query: {
    user: async (_parent, _args, { prisma, meId }) => {
      const user = await prisma.user.findUnique({
        where: { id: meId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error('***user Query could not find a user with that id')
      }
      return user
    }
  },

  User: {
    sentFriendRequests: async ({ id }, _args, { prisma }) => {
      // This SQL would work just as well.
      // SELECT users.id, users.nickname
      // FROM friend_requests JOIN users
      // ON friend_requests.requestee_id = users.id
      // WHERE friend_requests.requester_id = %i
      // %i = id

      // Does not throw errors if it doesn't find anything. Just returns [].
      const results = await prisma.friendRequest.findMany({
        where: { requesterId: id },
        select: {
          requestee: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      // Mapping to get at the nested User objects
      return results.map((e) => e.requestee)
    },

    receivedFriendRequests: async ({ id }, _args, { prisma }) => {
      // Does not throw errors if it doesn't find anything. Just returns [].
      const results = await prisma.friendRequest.findMany({
        where: { requesteeId: id },
        select: {
          requester: {
            select: {
              id: true,
              nickname: true
            }
          }
        }
      })

      // Mapping to get at the nested User objects
      return results.map((e) => e.requester)
    }
  },

  Mutation: {
    sendFriendRequest: async (_parent, { friendId }, { prisma, meId }) => {
      if (friendId === meId) {
        throw new Error('***sendFriendRequest resolver: You cannot add yourself as a friend')
      }

      // Throws error if cannot be created
      await prisma.friendRequest.create({
        data: {
          requesterId: meId,
          requesteeId: friendId
        }
      })

      return true
    }
  }
}
