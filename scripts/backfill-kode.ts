import { prisma } from "@/lib/prisma"
import { generateUserKode } from "@/lib/user-code"

async function main() {
  const users = await prisma.user.findMany({
    where: { kode: null },
    orderBy: { id: "asc" },
  })

  for (const u of users) {
    const kode = await generateUserKode(prisma, u.role)
    await prisma.user.update({ where: { id: u.id }, data: { kode } })
    console.log(u.email, "->", kode)
  }

  console.log("Selesai.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())