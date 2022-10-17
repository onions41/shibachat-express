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
    },

    protected: (_parent, _args, { req, res }) => {
      console.log('*Protected Query*: ', 'Hi there******************')
      console.log('*access-token*: ', req.headers['access-token'])
      console.log('*refresh-token*: ', req.cookies['refresh-token'])
      return true
    },

    unprotected: (_parent, _args, { req, res }) => {
      console.log('**Unprotected Query**: ', 'Hi there**************************')
      console.log('**access-token**: ', req.headers['access-token'])
      console.log('**req.cookies.refresh-token**: ', req.cookies['refresh-token'])
      return true
    }
  }
}
