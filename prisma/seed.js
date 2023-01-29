import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

const userData = [
  {
    nickname: "Homer",
    password: bcrypt.hashSync("123456", 10)
  },
  {
    nickname: "Marge",
    password: bcrypt.hashSync("123456", 10)
  },
  {
    nickname: "Bart",
    password: bcrypt.hashSync("123456", 10)
  },
  {
    nickname: "Lisa",
    password: bcrypt.hashSync("123456", 10)
  },
  {
    nickname: "Maggie",
    password: bcrypt.hashSync("123456", 10)
  }
]

const friendRequestData = [
  { senderId: 1, receiverId: 2, status: "ACCEPTED" },
  { senderId: 1, receiverId: 3, status: "ACCEPTED" },
  { senderId: 1, receiverId: 4, status: "ACCEPTED" },
  { senderId: 1, receiverId: 5, status: "ACCEPTED" },

  { senderId: 2, receiverId: 1, status: "ACCEPTED" },
  { senderId: 2, receiverId: 3, status: "ACCEPTED" },
  { senderId: 2, receiverId: 4, status: "ACCEPTED" },
  { senderId: 2, receiverId: 5, status: "ACCEPTED" },

  { senderId: 3, receiverId: 1, status: "ACCEPTED" },
  { senderId: 3, receiverId: 2, status: "ACCEPTED" },
  { senderId: 3, receiverId: 4, status: "ACCEPTED" },
  { senderId: 3, receiverId: 5, status: "ACCEPTED" },

  { senderId: 4, receiverId: 1, status: "ACCEPTED" },
  { senderId: 4, receiverId: 2, status: "ACCEPTED" },
  { senderId: 4, receiverId: 3, status: "ACCEPTED" },
  { senderId: 4, receiverId: 5, status: "ACCEPTED" },

  { senderId: 5, receiverId: 1, status: "ACCEPTED" },
  { senderId: 5, receiverId: 2, status: "ACCEPTED" },
  { senderId: 5, receiverId: 3, status: "ACCEPTED" },
  { senderId: 5, receiverId: 4, status: "ACCEPTED" }
]

const friendData = [
  { userId: 1, friendId: 2 },
  { userId: 1, friendId: 3 },
  { userId: 1, friendId: 4 },
  { userId: 1, friendId: 5 },

  { userId: 2, friendId: 1 },
  { userId: 2, friendId: 3 },
  { userId: 2, friendId: 4 },
  { userId: 2, friendId: 5 },

  { userId: 3, friendId: 1 },
  { userId: 3, friendId: 2 },
  { userId: 3, friendId: 4 },
  { userId: 3, friendId: 5 },

  { userId: 4, friendId: 1 },
  { userId: 4, friendId: 2 },
  { userId: 4, friendId: 3 },
  { userId: 4, friendId: 5 },

  { userId: 5, friendId: 1 },
  { userId: 5, friendId: 2 },
  { userId: 5, friendId: 3 },
  { userId: 5, friendId: 4 }
]

async function main() {
  console.log("Start seeding ...")

  // User
  await prisma.user.createMany({
    data: userData,
    skipDuplicates: true
  })

  // FriendRequest

  await prisma.friendRequest.createMany({
    data: friendRequestData,
    skipDuplicates: true
  })

  // Friend
  await prisma.friend.createMany({
    data: friendData,
    skipDuplicates: true
  })

  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
