export default {
  Query: {
    example1: async (_parent, _args, _context) => {
      return {
        name: 'Homer',
        height: 180
      }
    },

    findUser: (_parent, { nickname }, { User }) => {
      const result = User.findUser(nickname)
      if (result) {
        return result
      }
      return null
    }
  }
}
