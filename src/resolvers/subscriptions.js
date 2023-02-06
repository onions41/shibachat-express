import { pubsub, withFilter } from "../resolverDependencies"

export default {
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("NEW_MESSAGE"),
        (payload, { friendId }, { meId }) => {
          return (
            // For messages coming to me from the friend
            (payload.newMessage.receiverId === meId &&
              payload.newMessage.senderId === friendId) ||
            // For messages I am sending to the friend
            (payload.newMessage.senderId === meId &&
              payload.newMessage.receiverId === friendId)
          )
        }
      )
    }
  }
}
