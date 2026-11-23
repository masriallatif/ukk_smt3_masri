import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const typeUnitInclude = {
  facilities: {
    include: { facility: true },
    orderBy: { kodeFacility: "asc" as const },
  },
} as const

type TypeUnitPayload = {
  namaTypeUnit: string
  branchId: number
  facilityCodes: string[]
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

function isPrismaError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code
}

function parseTypeUnitBody(body: Record<string, unknown>): ParseResult<TypeUnitPayload> {
  const namaTypeUnit = typeof body.namaTypeUnit === "string" ? body.namaTypeUnit.trim() : ""
  const branchId = typeof body.branchId === "number" ? body.branchId : Number(body.branchId)
  const facilityCodes = Array.isArray(body.facilityCodes) ? body.facilityCodes : []
  const validFacilityCodes = facilityCodes.every(
    (code) => typeof code === "string" && code.trim().length > 0 && code.trim().length <= 191
  )

  if (!namaTypeUnit || namaTypeUnit.length > 191 || !Number.isSafeInteger(branchId) || branchId < 1) {
    return { ok: false, error: "Nama tipe unit dan branch ID wajib diisi dengan benar." }
  }
  if (!validFacilityCodes) {
    return { ok: false, error: "Daftar fasilitas tidak valid." }
  }

  return {
    ok: true,
    value: {
      namaTypeUnit,
      branchId,
      facilityCodes: [...new Set(facilityCodes.map((code: string) => code.trim()))],
    },
  }
}

async function readBody(request: Request) {
  try {
    return await request.json() as Record<string, unknown>
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  try {
    const typeUnits = await prisma.typeUnit.findMany({
      include: typeUnitInclude,
      orderBy: { idUnitType: "desc" },
    })
    return NextResponse.json({ typeUnits })
  } catch (error) {
    console.error("Failed to fetch unit types:", error)
    return NextResponse.json({ error: "Gagal memuat data tipe unit." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const body = await readBody(request)
  if (!body) return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })

  const parsed = parseTypeUnitBody(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const typeUnit = await prisma.typeUnit.create({
      data: {
        namaTypeUnit: parsed.value.namaTypeUnit,
        branchId: parsed.value.branchId,
        facilities: {
          create: parsed.value.facilityCodes.map((kodeFacility) => ({
            facility: { connect: { kodeFacility } },
          })),
        },
      },
      include: typeUnitInclude,
    })
    return NextResponse.json({ typeUnit }, { status: 201 })
  } catch (error) {
    if (isPrismaError(error, "P2003")) {
      return NextResponse.json({ error: "Salah satu fasilitas tidak ditemukan." }, { status: 400 })
    }
    console.error("Failed to create unit type:", error)
    return NextResponse.json({ error: "Gagal membuat tipe unit." }, { status: 500 })
  }
}
