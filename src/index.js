// Module imports
import path from 'path'
import http from 'http'
import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Apollo
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'

// GraphQL
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'

// Internal imports
import User from './mockUser'
import refreshTokens from './auth/refreshTokens'

// process.env
dotenv.config()

// Get all the files in ./typeDefs and merge them together
const typesArray = loadFilesSync(
  path.join(__dirname, './typeDefs'), { extensions: ['graphql'] }
)
const typeDefs = mergeTypeDefs(typesArray)

// Get all the files in ./resolvers and merge them together
const resolversArray = loadFilesSync(
  path.join(__dirname, './resolvers'), { extensions: ['js'] }
)
const resolvers = mergeResolvers(resolversArray)

// Adds middlewares and starts server
async function startApolloServer(typeDefs, resolvers) {
  const app = express()

  // Apply CORS
  // Configuration refrence https://github.com/expressjs/cors#configuration-options
  app.use(cors({
    origin: process.env.REACT_CLIENT_ORIGIN,
    // To allow cookie headers
    credentials: true
  }))

  // Parse cookies
  app.use(cookieParser())

  // Endpoint for getting new tokens
  app.post('/refresh-token', refreshTokens)

  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res, User }),
    csrfPrevention: true,
    cache: 'bounded',
    // Allows schema to be downloaded.
    // TODO: Might want to turn this off in production
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Enables Apollo Explorer on landing page
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ]
  })

  await server.start()
  // Turned off CORS here because it has to be enabled before all middlewares.
  server.applyMiddleware({ app, cors: false })
  await new Promise(
    (resolve) => httpServer.listen({ port: process.env.PORT }, resolve)
  )
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
  )
}

startApolloServer(typeDefs, resolvers)
