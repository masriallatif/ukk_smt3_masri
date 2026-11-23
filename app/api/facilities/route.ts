import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type FacilityPayload = { kodeFacility: string; namaFacility: string }
type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string } | null

function isPrismaError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code
}

async function readFacilityBody(request: Request): Promise<ParseResult<FacilityPayload>> {
  try {
    const body = await request.json() as Record<string, unknown>
    const kodeFacility = typeof body.kodeFacility === "string"
      ? body.kodeFacility.trim().toUpperCase()
      : ""
    const namaFacility = typeof body.namaFacility === "string" ? body.namaFacility.trim() : ""

    if (!/^[A-Z0-9_-]{1,191}$/.test(kodeFacility) || !namaFacility || namaFacility.length > 191) {
      return { ok: false, error: "Kode dan nama fasilitas wajib diisi dengan benar." }
    }
    return { ok: true, value: { kodeFacility, namaFacility } }
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  try {
    const facilities = await prisma.facility.findMany({
      include: { _count: { select: { typeUnits: true } } },
      orderBy: { kodeFacility: "asc" },
    })
    return NextResponse.json({
      facilities: facilities.map(({ _count, ...facility }) => ({
        ...facility,
        _count: { typeUnits: Number(_count.typeUnits) },
      })),
    })
  } catch (error) {
    console.error("Failed to fetch facilities:", error)
    return NextResponse.json({ error: "Gagal memuat data fasilitas." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const parsed = await readFacilityBody(request)
  if (!parsed) return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  try {
    const facility = await prisma.facility.create({ data: parsed.value })
    return NextResponse.json({ facility }, { status: 201 })
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return NextResponse.json({ error: "Kode fasilitas sudah digunakan." }, { status: 409 })
    }
    console.error("Failed to create facility:", error)
    return NextResponse.json({ error: "Gagal membuat fasilitas." }, { status: 500 })
  }
}
