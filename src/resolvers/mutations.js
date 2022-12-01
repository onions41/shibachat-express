export default {
  Mutation: {
    sendFRequest: async (_parent, { friendId }, { prisma, meId }) => {
      if (friendId === meId) {
        throw new Error(
          "***sendFriendRequest resolver: You cannot add yourself as a friend"
        )
      }

      const friend = await prisma.user.findUnique({
        where: {
          id: friendId
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
          meId,
          friendId
        }
      }) // Returning the created friendRequest obj.
      // Did not use select or include options as I wall all
      // scalar fields to be selected and non of the type fields tolibraries
      // be loaded eagerly. (the type fields are taken care of by the
      // type resolvers.)
    },

    cancelFRequest: async (_parent, { friendId }, { meId, prisma }) => {
      // Throws error if the friend request is not found
      return await prisma.friendRequest.delete({
        where: {
          meId_friendId: {
            meId,
            friendId
          }
        }
      })
    },

    acceptFRequest: async (_parent, { friendId }, { meId, prisma }) => {
      // Updates the status of the friend request being accepted
      // Throws RecordNotFound exception if not found
      const acceptedFRequest = await prisma.friendRequest.update({
        where: {
          meId_friendId: {
            // Front end inputs the id of the user that sent me the friend request as friendId
            meId: friendId,
            friendId: meId
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
            meId_friendId: {
              // Flipped from above
              meId,
              friendId
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
            meId,
            friendId,
            status: "ACCEPTED"
          }
        })

        mirroredFRequest = null
      }

      // Creates the entries in the friend join table. Both directions.
      try {
        await prisma.friend.create({
          data: {
            meId,
            friendId
          }
        })
      } catch {
        // Douplicate. Do nothing.
      }
      try {
        await prisma.friend.create({
          data: {
            meId: friendId,
            friendId: meId
          }
        })
      } catch {
        // Douplicate. Do nothing.
      }

      // If this throws, that would mean that the prospective friend user was deleted.
      const friend = await prisma.user.findUniqueOrThrow({
        where: {
          id: friendId
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
