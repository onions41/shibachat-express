"use strict";

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _client = require("@prisma/client");

var _ws = require("ws");

var _ws2 = require("graphql-ws/lib/use/ws");

var _apolloServerExpress = require("apollo-server-express");

var _apolloServerCore = require("apollo-server-core");

var _refreshTokens = _interopRequireDefault(require("./auth/refreshTokens"));

var _executableSchema = _interopRequireDefault(require("./executableSchema"));

var _verifyAccessToken = _interopRequireDefault(require("./auth/verifyAccessToken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Module imports
// Apollo
// Internal imports
// Get user model
const prisma = new _client.PrismaClient();
/**
 * Adds middlewares and starts the server
 */

async function main() {
  const app = (0, _express.default)(); // Apply CORS for dev environment. CORS is configured by Nginx in production.

  if (process.env.NODE_ENV === "development") {
    // Configuration refrence https://github.com/expressjs/cors#configuration-options
    app.use((0, _cors.default)({
      origin: process.env.REACT_CLIENT_ORIGIN,
      // To allow cookie headers
      credentials: true
    }));
  } // Parse cookies


  app.use((0, _cookieParser.default)()); // Endpoint for getting new tokens

  const refreshTokensBound = _refreshTokens.default.bind({}, prisma);

  app.post("/refresh-token", refreshTokensBound); // Required as dependency when creating and starting Apollo ws and http servers

  const httpServer = _http.default.createServer(app); // Creating the WebSocket server


  const wsServer = new _ws.WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql"
  }); // Hand in the executable schema and have the WebSocketServer start listening.
  // https://github.com/enisdenjo/graphql-ws/blob/master/docs/interfaces/server.ServerOptions.md#properties

  const serverCleanup = (0, _ws2.useServer)({
    schema: _executableSchema.default,
    // Grabs the access token from connection params so it can be used in the subscription resolver
    // subscription resolver runs BEFORE its field directive, so that's no good for authentication for subscriptions
    context: ctx => {
      console.log("Websocket Context Runs");
      ctx.meId = (0, _verifyAccessToken.default)(ctx?.connectionParams?.["access-token"]);
      return ctx;
    },
    onDisconnect: () => {
      console.log("Websocket Disconnected!");
    }
  }, wsServer); // instantiates the Apollo Http GraphQL Server

  const server = new _apolloServerExpress.ApolloServer({
    schema: _executableSchema.default,
    context: ({
      req,
      res
    }) => {
      return {
        req,
        res,
        prisma
      };
    },
    csrfPrevention: true,
    cache: "bounded",
    // Allows schema to be downloaded.
    // TODO: Might want to turn this off in production
    introspection: true,
    plugins: [// Proper shutdown for the HTTP server
    (0, _apolloServerCore.ApolloServerPluginDrainHttpServer)({
      httpServer
    }), // Proper shutdown for the WebSocket server
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }

        };
      }

    }, // Enables Apollo Explorer on landing page
    (0, _apolloServerCore.ApolloServerPluginLandingPageLocalDefault)({
      embed: true
    })]
  });
  await server.start(); // Turned off CORS here because it has to be enabled before all middlewares.

  server.applyMiddleware({
    app,
    cors: false
  });
  await new Promise(resolve => httpServer.listen({
    port: process.env.PORT
  }, resolve));
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
}

main();