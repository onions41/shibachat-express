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
      return await prisma.friendRequest.create({
        data: {
          meId,
          friendId
        }
      }) // Returning the created friendRequest obj.
      // Did not use select or include options as I wall all
      // scalar fields to be selected and non of the type fields tolibraries
      // be loaded eagerly. (the type fields are taken care of by the
      // type resolvers.)
    }
  }
}
