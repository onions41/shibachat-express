export default {
  Query: {
    example1: async (_parent, _args, _context) => {
      return {
        name: 'Homer',
        height: 180
      }
    }
  }
}
