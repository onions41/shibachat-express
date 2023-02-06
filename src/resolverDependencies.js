import { PubSub, withFilter } from "graphql-subscriptions"

const pubsub = new PubSub()

export { pubsub, withFilter }
