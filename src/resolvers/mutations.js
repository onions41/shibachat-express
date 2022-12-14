export default {
  Mutation: {
    sendFRequest: async (_parent, { receiverId }, { prisma, meId }) => {
      if (receiverId === meId) {
        throw new Error(
          "***sendFriendRequest resolver: You cannot add yourself as a friend"
        )
      }

      const friend = await prisma.user.findUnique({
        where: {
          id: receiverId
        },
        select: {
          id: true,
          nickname: true
        }
      })
      // Must throw error manually as findUnique does not
      if (!friend) {
        throw new Error("Could not find a Shiba with that nickname")
      }

      // Throws error if cannot be created
      return await prisma.friendRequest.create({
        data: {
          senderId: meId,
          receiverId
        }
      }) // Returning the created friendRequest obj.
      // Did not use select or include options as I wall all
      // scalar fields to be selected and non of the type fields tolibraries
      // be loaded eagerly. (the type fields are taken care of by the
      // type resolvers.)
    },

    cancelFRequest: async (_parent, { receiverId }, { meId, prisma }) => {
      // Throws error if the friend request is not found
      return await prisma.friendRequest.delete({
        where: {
          senderId_receiverId: {
            senderId: meId,
            receiverId
          }
        }
      })
    },

    acceptFRequest: async (_parent, { senderId }, { meId, prisma }) => {
      // Updates the status of the friend request being accepted
      // Throws RecordNotFound exception if not found
      const acceptedFRequest = await prisma.friendRequest.update({
        where: {
          senderId_receiverId: {
            // Front end inputs the id of the user that sent me the friend request as receiverId
            senderId,
            receiverId: meId
          }
        },
        data: {
          status: "ACCEPTED"
        }
      })

      // Updates the status of the friend request that's opposite the request being accepted if exists
      let mirroredFRequest
      try {
        mirroredFRequest = await prisma.friendRequest.update({
          where: {
            senderId_receiverId: {
              // Flipped from above
              senderId: meId,
              receiverId: senderId
            }
          },
          data: {
            status: "ACCEPTED"
          }
        })
      } catch {
        // There was no mirrored friend request
        await prisma.friendRequest.create({
          data: {
            senderId: meId,
            receiverId: senderId,
            status: "ACCEPTED"
          }
        })

        mirroredFRequest = null
      }

      // Creates the entries in the friend join table. Both directions.
      await prisma.friend.createMany({
        data: [
          { userId: senderId, friendId: meId },
          { userId: meId, friendId: senderId }
        ],
        skipDuplicates: true
      })

      // If this throws, that would mean that the prospective friend user was deleted.
      const friend = await prisma.user.findUniqueOrThrow({
        where: {
          id: senderId
        }
      })

      return {
        acceptedFRequest,
        mirroredFRequest, // Reminder: Nullable
        friend
      }
    }
  }
}
