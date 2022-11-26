// Module imports
import http from "http"
import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { PrismaClient } from "@prisma/client"

// Apollo
import { ApolloServer } from "apollo-server-express"
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from "apollo-server-core"

// Internal imports
import refreshTokens from "./auth/refreshTokens"
import schema from "./executableSchema"

// process.env
dotenv.config()

// Get user model
const prisma = new PrismaClient()

/**
 * Adds middlewares and starts the server
 */
async function main() {
  const app = express()

  // Apply CORS
  // Configuration refrence https://github.com/expressjs/cors#configuration-options
  app.use(
    cors({
      origin: process.env.REACT_CLIENT_ORIGIN,
      // To allow cookie headers
      credentials: true
    })
  )

  // Parse cookies
  app.use(cookieParser())

  // Endpoint for getting new tokens
  const refreshTokensBound = refreshTokens.bind({}, prisma)
  app.post("/refresh-token", refreshTokensBound)

  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, prisma }),
    csrfPrevention: true,
    cache: "bounded",
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
  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT }, resolve)
  )
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
  )
}

main()
