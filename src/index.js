// Module imports
import http from "http"
import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { PrismaClient } from "@prisma/client"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"

// Apollo
import { ApolloServer } from "apollo-server-express"
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault
} from "apollo-server-core"

// Internal imports
import refreshTokens from "./auth/refreshTokens"
import schema from "./executableSchema"
import verifyAccessToken from "./auth/verifyAccessToken"

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

  // Required as dependency when creating and starting Apollo ws and http servers
  const httpServer = http.createServer(app)

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql"
  })

  // Hand in the executable schema and have the WebSocketServer start listening.
  // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/server.ServerOptions.md#properties
  const serverCleanup = useServer(
    {
      schema,
      // Grabs the access token from connection params so it can be used in the subscription resolver
      // subscription resolver runs BEFORE its field directive, so that's no good for authentication for subscriptions
      context: (ctx) => {
        console.log("Websocket Context Runs")
        ctx.meId = verifyAccessToken(ctx?.connectionParams?.["access-token"])
        return ctx
      },
      onDisconnect: () => {
        console.log("Websocket Disconnected!")
      }
    },
    wsServer
  )

  // instantiates the Apollo Http GraphQL Server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => {
      return { req, res, prisma }
    },
    csrfPrevention: true,
    cache: "bounded",
    // Allows schema to be downloaded.
    // TODO: Might want to turn this off in production
    introspection: true,
    plugins: [
      // Proper shutdown for the HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      },
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
