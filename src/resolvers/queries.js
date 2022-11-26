export default {
  Query: {
    // Fetches a single user
    user: async (_parent, _args, { prisma, meId }) => {
      const user = await prisma.user.findUnique({
        where: { id: meId },
        select: { id: true, nickname: true }
      })
      if (!user) {
        throw new Error("***user Query could not find a user with that id")
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
  }
}
