// Mudule imports
import path from 'path'
import { verify } from 'jsonwebtoken'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { defaultFieldResolver } from 'graphql'

// Get all the files in ./typeDefs and merge them together
const typesArray = loadFilesSync(
  path.join(__dirname, './typeDefs'),
  { extensions: ['graphql'] }
)

// Get all the files in ./resolvers and merge them together
const resolversArray = loadFilesSync(
  path.join(__dirname, './resolvers'),
  { extensions: ['js'] }
)

// Creates the executable schema using typeDefs and resolvers
let schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typesArray),
  resolvers: mergeResolvers(resolversArray)
})

// Defining custom directive logic for @requiresAuth
function requiresAuthDirectiveTransformer(schema, directiveName = 'requiresAuth') {
  return mapSchema(schema, {
    // Reminder: Square brackets are used for computed object property names. (Ie, computed key names)
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const requiresAuthDirective = getDirective(
        schema, fieldConfig, directiveName
      )
      if (requiresAuthDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig
        fieldConfig.resolve = async function(parent, args, context, info) {
          // The custom code to extend the resolver for the annotated field. Surrounding code is boilerplate
          const accessToken = context.req.headers['access-token']
          if (!accessToken) {
            throw new Error('***@requiresAuth directive - Did not find an access token in req the header')
          }
          let payload
          try {
            payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
          } catch {
            throw new Error('***@requiresAuth directive - Your access token is not valid')
          }
          // Access token is valid - Authorized - so pass the userId into context
          context.userId = payload.userId

          return await resolve(parent, args, context, info)
          // end of custom code
        }

        return fieldConfig
      }
    }
  })
}

// Adds the directive
schema = requiresAuthDirectiveTransformer(schema)

export default schema
