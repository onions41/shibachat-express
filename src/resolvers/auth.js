import { createAccessToken } from '../auth/createTokens'

export default {
  Query: {},
  Mutation: {
    // Login Mutation
    login: async (_parent, { nickname, password }, { User }) => {
      // Finds the user with the nickname
      const user = User.findUser(nickname)
      // If couldn't find user, throw error.
      if (!user) {
        throw new Error('Counld not find user')
      }
      // Compares the entered password with the saved password
      // TODO: Need to bring in bcryptjs here to compare()
      const valid = user.password === password
      if (!valid) {
        throw new Error('Incorrect Password')
      }
      // Login successful so return an access token
      return {
        accessToken: createAccessToken(user)
      }
    }
  }
}
