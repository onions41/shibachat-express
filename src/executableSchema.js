// Module imports
import path from "path"
import { loadFilesSync } from "@graphql-tools/load-files"
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils"
import { defaultFieldResolver } from "graphql"

// Internal imports
import verifyAccessToken from "./auth/verifyAccessToken"

// Get all the files in ./typeDefs and merge them together
const typesArray = loadFilesSync(path.join(__dirname, "./typeDefs"), {
  extensions: ["graphql"]
})

// Get all the files in ./resolvers and merge them together
const resolversArray = loadFilesSync(path.join(__dirname, "./resolvers"), {
  extensions: ["js"]
})

// Creates the executable schema using typeDefs and resolvers
let schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typesArray),
  resolvers: mergeResolvers(resolversArray)
})

// Defining custom directive logic for @requiresAuth
function requiresAuthDirectiveTransformer(
  schema,
  directiveName = "requiresAuth"
) {
  return mapSchema(schema, {
    // Reminder: Square brackets are used for computed object property names. (Ie, computed key names)
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const requiresAuthDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )
      if (requiresAuthDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig
        fieldConfig.resolve = async function(parent, args, context, info) {
          // The custom code to extend the resolver for the annotated field. Surrounding code is boilerplate
          const accessToken = context?.req?.headers?.["access-token"]
          // returns meId or throws if null or not valid
          context.meId = verifyAccessToken(accessToken)
          return await resolve(parent, args, context, info)
          // end of custom code
        }

        return fieldConfig
      }
    }
  })
}

// Defining custom directive logic for @mustBeMe
function mustBeMeDirectiveTransformer(schema, directiveName = "mustBeMe") {
  return mapSchema(schema, {
    // Reminder: Square brackets are used for computed object property names. (Ie, computed key names)
    // MapperKind.OBJECT_FIELD correspondes to directives on FIELD_DEFINITIONs (eg @RequiresAuth)
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const mustBeMeDirective = getDirective(schema, fieldConfig, directiveName)
      if (mustBeMeDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig
        fieldConfig.resolve = async function(parent, args, context, info) {
          // The custom code to extend the resolver for the annotated field. Surrounding code is boilerplate
          if (context.meId !== parent.id) {
            throw new Error(
              "***@mustBeMe directive - You don't have access to this information"
            )
          }

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
schema = mustBeMeDirectiveTransformer(schema)

export default schema
