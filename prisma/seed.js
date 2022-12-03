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
  { senderId: 2, receiverId: 1, status: "ACCEPTED" },
  { senderId: 1, receiverId: 3, status: "ACCEPTED" },
  { senderId: 3, receiverId: 1, status: "ACCEPTED" },
  { senderId: 1, receiverId: 4, status: "ACCEPTED" },
  { senderId: 4, receiverId: 1, status: "ACCEPTED" },
  { senderId: 2, receiverId: 5, status: "ACCEPTED" },
  { senderId: 5, receiverId: 2, status: "ACCEPTED" },
  { senderId: 3, receiverId: 4, status: "ACCEPTED" },
  { senderId: 4, receiverId: 3, status: "ACCEPTED" }
]

const friendData = [
  { userId: 1, friendId: 2 },
  { userId: 2, friendId: 1 },
  { userId: 1, friendId: 3 },
  { userId: 3, friendId: 1 },
  { userId: 1, friendId: 4 },
  { userId: 4, friendId: 1 },
  { userId: 2, friendId: 5 },
  { userId: 5, friendId: 2 },
  { userId: 3, friendId: 4 },
  { userId: 4, friendId: 3 }
]

async function main() {
  console.log("Start seeding ...")

  // User
  for (const u of userData) {
    await prisma.user.create({
      data: u
    })
  }

  // FriendRequest
  for (const fr of friendRequestData) {
    await prisma.friendRequest.create({
      data: fr
    })
  }

  // Friend
  for (const f of friendData) {
    await prisma.friend.create({
      data: f
    })
  }

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
