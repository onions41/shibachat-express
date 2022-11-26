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

async function main() {
  console.log("Start seeding ...")
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u
    })
    console.log(`Created user with id: ${user.id}`)
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
