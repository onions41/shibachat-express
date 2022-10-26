// Module imports
import bcrypt from 'bcrypt'

// Internal imports
import { createAccessToken, createRefreshToken } from '../auth/createTokens'
import attachRefreshToken from '../auth/attachRefreshToken'
import authInput from '../inputValidation/authInput'

export default {
  Query: {},
  Mutation: {
    login: async (_parent, args, { res, prisma }) => {
      // Input validation with Yup.
      const { nickname, password } = await authInput.validate(args)

      // Finds user with the nickname
      const user = await prisma.user.findUnique({
        where: {
          nickname
        },
        select: {
          id: true,
          nickname: true,
          password: true
        }
      })
      // Must throw error manually as findUnique does not
      if (!user) {
        throw new Error('Could not find a Shiba with that nickname')
      }

      // Compares the entered password with the saved password
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Incorrect password')
      }

      // Login successful so return an access token
      // And attach a refresh token to the cookie
      const payload = { id: user.id, nickname: user.nickname }
      attachRefreshToken(res, createRefreshToken(payload))
      return createAccessToken(payload)
    },

    register: async (_parent, args, { res, prisma }) => {
      // Input validation with Yup.
      const { nickname, password } = await authInput.validate(args)

      // This will always work because password is validated.
      const hashedPassword = await bcrypt.hash(password, 10)

      // Unique validation on nickname happens here.
      // Other database errors will be thrown here too. Ex, connectivity errors.
      // The returned user will become the payload of both tokens.
      const payload = await prisma.user.create({
        data: {
          nickname,
          password: hashedPassword
        },
        select: {
          id: true,
          nickname: true
        }
      })

      // Registration was successful if no error was thrown by this point.
      // TODO: Raw errors are going straight to the front end right now.
      // I should log the errors and store them too later.
      attachRefreshToken(res, createRefreshToken(payload))
      return createAccessToken(payload)
    },

    logout: async (_parent, _args, { res }) => {
      // Just needs to send back '' as a refresh token in the cookie
      // Frontend can delete its access token by itself.
      attachRefreshToken(res, '')
      return true
    }

    // revokeTokens: async () => {

  } // End of mutations
}
