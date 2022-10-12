// Node
import path from 'path'
import http from 'http'
import express from 'express'
import * as dotenv from 'dotenv'

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

// process.env
dotenv.config()

// Get all the files in ./typeDefs and merge them together
const typesArray = loadFilesSync(path.join(__dirname, './typeDefs'), { extensions: ['js'] })
const typeDefs = mergeTypeDefs(typesArray)

// Get all the files in ./resolvers and merge them together
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'), { extensions: ['js'] })
const resolvers = mergeResolvers(resolversArray)

async function startApolloServer(typeDefs, resolvers) {
  // Todo, need to define typeDefs and resovlers. Cors too

  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    // Allows schema to be downloaded. TODO: Might want to turn this off in production
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Enables Apollo Explorer on landing page
      ApolloServerPluginLandingPageLocalDefault({ embed: true })
    ]
  })

  await server.start()
  server.applyMiddleware({ app })
  await new Promise((resolve) => httpServer.listen({ port: process.env.PORT }, resolve))
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
}

startApolloServer(typeDefs, resolvers)
