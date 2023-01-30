export default {
  Query: {
    // Fetches a single user
    user: async (_parent, args, { prisma, meId }) => {
      // If id was provided in the args, search for that user.
      // Otherwise search for the current user (me).
      const id = args.id ? args.id : meId
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: { id: true, nickname: true }
      })
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
    },

    messages: async (_parent, { friendId }, { prisma, meId }) => {
      // findMany returns empty array when nothing is found
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: meId,
              receiverId: friendId
            },
            {
              senderId: friendId,
              receiverId: meId
            }
          ]
        }
      })

      return messages
    }
  }
}
