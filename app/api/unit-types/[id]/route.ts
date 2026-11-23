import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

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

async function getTypeUnitId(context: RouteContext) {
  const { id } = await context.params
  const typeUnitId = Number(id)
  return Number.isSafeInteger(typeUnitId) && typeUnitId > 0 ? typeUnitId : null
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const typeUnitId = await getTypeUnitId(context)
  if (!typeUnitId) return NextResponse.json({ error: "ID tipe unit tidak valid." }, { status: 400 })

  const body = await readBody(request)
  if (!body) return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })

  const parsed = parseTypeUnitBody(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const typeUnit = await prisma.$transaction(async (transaction) => {
      await transaction.typeUnit.update({
        where: { idUnitType: typeUnitId },
        data: {
          namaTypeUnit: parsed.value.namaTypeUnit,
          branchId: parsed.value.branchId,
        },
      })
      await transaction.typeUnitFacility.deleteMany({ where: { idUnitType: typeUnitId } })
      if (parsed.value.facilityCodes.length > 0) {
        await transaction.typeUnitFacility.createMany({
          data: parsed.value.facilityCodes.map((kodeFacility) => ({
            idUnitType: typeUnitId,
            kodeFacility,
          })),
        })
      }
      return transaction.typeUnit.findUnique({
        where: { idUnitType: typeUnitId },
        include: typeUnitInclude,
      })
    })

    return NextResponse.json({ typeUnit })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Tipe unit tidak ditemukan." }, { status: 404 })
    }
    if (isPrismaError(error, "P2003")) {
      return NextResponse.json({ error: "Salah satu fasilitas tidak ditemukan." }, { status: 400 })
    }
    console.error("Failed to update unit type:", error)
    return NextResponse.json({ error: "Gagal memperbarui tipe unit." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const typeUnitId = await getTypeUnitId(context)
  if (!typeUnitId) return NextResponse.json({ error: "ID tipe unit tidak valid." }, { status: 400 })

  try {
    await prisma.typeUnit.delete({ where: { idUnitType: typeUnitId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Tipe unit tidak ditemukan." }, { status: 404 })
    }
    console.error("Failed to delete unit type:", error)
    return NextResponse.json({ error: "Gagal menghapus tipe unit." }, { status: 500 })
  }
}
