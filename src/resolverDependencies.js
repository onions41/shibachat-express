import { withFilter } from "graphql-subscriptions"
import { RedisPubSub } from "graphql-redis-subscriptions"

// Basic example from docs
const options = {
  host: process.env.REDIS_DOMAIN_NAME,
  port: process.env.REDIS_PORT_NUMBER,
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000)
  }
}

// options object example
// {
//   port: 6379, // Redis port
//   host: "127.0.0.1", // Redis host
//   username: "default", // needs Redis >= 6
//   password: "my-top-secret",
//   db: 0, // Defaults to 0
// }

const pubsub = new RedisPubSub({
  connection: options
})

export { pubsub, withFilter }
