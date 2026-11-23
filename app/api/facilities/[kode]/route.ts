import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ kode: string }> }
type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string } | null

function isPrismaError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code
}

async function getFacilityCode(context: RouteContext) {
  const { kode } = await context.params
  return /^[A-Z0-9_-]{1,191}$/i.test(kode) ? kode.toUpperCase() : null
}

async function getFacilityBody(request: Request): Promise<ParseResult<{ namaFacility: string }>> {
  try {
    const body = await request.json() as Record<string, unknown>
    const namaFacility = typeof body.namaFacility === "string" ? body.namaFacility.trim() : ""
    if (!namaFacility || namaFacility.length > 191) {
      return { ok: false, error: "Nama fasilitas wajib diisi dengan benar." }
    }
    return { ok: true, value: { namaFacility } }
  } catch {
    return null
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const kodeFacility = await getFacilityCode(context)
  if (!kodeFacility) {
    return NextResponse.json({ error: "Kode fasilitas tidak valid." }, { status: 400 })
  }
  const parsed = await getFacilityBody(request)
  if (!parsed) return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const facility = await prisma.facility.update({
      where: { kodeFacility },
      data: parsed.value,
    })
    return NextResponse.json({ facility })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan." }, { status: 404 })
    }
    console.error("Failed to update facility:", error)
    return NextResponse.json({ error: "Gagal memperbarui fasilitas." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const kodeFacility = await getFacilityCode(context)
  if (!kodeFacility) {
    return NextResponse.json({ error: "Kode fasilitas tidak valid." }, { status: 400 })
  }

  try {
    await prisma.facility.delete({ where: { kodeFacility } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json({ error: "Fasilitas tidak ditemukan." }, { status: 404 })
    }
    console.error("Failed to delete facility:", error)
    return NextResponse.json({ error: "Gagal menghapus fasilitas." }, { status: 500 })
  }
}
