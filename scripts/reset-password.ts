import { prisma } from "@/lib/prisma"
import { hashUserPassword } from "@/lib/user-security"

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.log("Pakai: npx tsx --env-file=.env scripts/reset-password.ts <email> <password-baru>")
    process.exit(1)
  }

  const hash = await hashUserPassword(newPassword)
  const user = await prisma.user.update({
    where: { email: email.trim().toLowerCase() },
    data: { password: hash },
    select: { id: true, email: true },
  })

  console.log("Password berhasil direset untuk:", user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())