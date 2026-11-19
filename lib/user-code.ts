import type { prisma } from "@/lib/prisma"

type Db = { user: Pick<typeof prisma.user, "findFirst"> }

// Format kode per role. Ubah "digits" kalau mau jumlah digit yang sama.
const KODE_CONFIG: Record<string, { prefix: string; digits: number }> = {
  admin: { prefix: "adm", digits: 5 }, // adm00001
  staff: { prefix: "stf", digits: 4 }, // stf0001
}

export async function generateUserKode(db: Db, role: string) {
  const { prefix, digits } = KODE_CONFIG[role] ?? { prefix: "usr", digits: 5 }

  const last = await db.user.findFirst({
    where: { kode: { startsWith: prefix } },
    orderBy: { kode: "desc" },
    select: { kode: true },
  })

  const lastNumber = last?.kode ? parseInt(last.kode.slice(prefix.length), 10) : 0
  return `${prefix}${String(lastNumber + 1).padStart(digits, "0")}`
}
