export default {
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
