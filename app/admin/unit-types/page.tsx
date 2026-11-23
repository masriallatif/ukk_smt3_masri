"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type FacilityOption = {
  kodeFacility: string
  namaFacility: string
}

type TypeUnit = {
  idUnitType: number
  namaTypeUnit: string
  branchId: number
  facilities: {
    kodeFacility: string
    facility: FacilityOption
  }[]
}

async function responseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.error ?? fallback
}

export default function UnitTypesPage() {
  const router = useRouter()
  const [typeUnits, setTypeUnits] = useState<TypeUnit[]>([])
  const [facilities, setFacilities] = useState<FacilityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [branchId, setBranchId] = useState("")
  const [selectedFacilityCodes, setSelectedFacilityCodes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [typeResponse, facilityResponse] = await Promise.all([
        fetch("/api/unit-types", { cache: "no-store" }),
        fetch("/api/facilities", { cache: "no-store" }),
      ])
      if (typeResponse.status === 401 || facilityResponse.status === 401) {
        router.push("/")
        return
      }

      const [typeData, facilityData] = await Promise.all([
        typeResponse.json().catch(() => null),
        facilityResponse.json().catch(() => null),
      ])
      if (!typeResponse.ok || !facilityResponse.ok) {
        setError(
          !typeResponse.ok
            ? typeData?.error ?? "Gagal memuat data tipe unit."
            : facilityData?.error ?? "Gagal memuat pilihan fasilitas."
        )
        return
      }

      setTypeUnits(typeData.typeUnits)
      setFacilities(
        facilityData.facilities.map(
          (facility: { kodeFacility: string; namaFacility: string }) => ({
            kodeFacility: facility.kodeFacility,
            namaFacility: facility.namaFacility,
          })
        )
      )
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const timeout = setTimeout(() => void loadData(), 0)
    return () => clearTimeout(timeout)
  }, [loadData])

  function resetForm() {
    setFormOpen(false)
    setEditingId(null)
    setName("")
    setBranchId("")
    setSelectedFacilityCodes([])
  }

  function editType(typeUnit: TypeUnit) {
    setFormOpen(true)
    setEditingId(typeUnit.idUnitType)
    setName(typeUnit.namaTypeUnit)
    setBranchId(String(typeUnit.branchId))
    setSelectedFacilityCodes(typeUnit.facilities.map(({ kodeFacility }) => kodeFacility))
  }

  function toggleFacility(code: string) {
    setSelectedFacilityCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    )
  }

  async function saveTypeUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      const response = await fetch(
        editingId === null ? "/api/unit-types" : `/api/unit-types/${editingId}`,
        {
          method: editingId === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaTypeUnit: name,
            branchId: Number(branchId),
            facilityCodes: selectedFacilityCodes,
          }),
        }
      )
      if (response.status === 401) {
        router.push("/")
        return
      }
      if (!response.ok) {
        setError(await responseError(response, "Gagal menyimpan tipe unit."))
        return
      }
      resetForm()
      await loadData()
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteTypeUnit(typeUnit: TypeUnit) {
    if (!window.confirm(`Hapus tipe unit "${typeUnit.namaTypeUnit}"?`)) return

    setError("")
    setDeletingId(typeUnit.idUnitType)
    try {
      const response = await fetch(`/api/unit-types/${typeUnit.idUnitType}`, { method: "DELETE" })
      if (response.status === 401) {
        router.push("/")
        return
      }
      if (!response.ok) {
        setError(await responseError(response, "Gagal menghapus tipe unit."))
        return
      }
      if (editingId === typeUnit.idUnitType) resetForm()
      await loadData()
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tipe Unit</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola tipe unit dan pilih fasilitas yang tersedia untuk masing-masing tipe.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={() => {
            resetForm()
            setFormOpen(true)
          }}>
            Tambah Tipe Unit
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {formOpen && (
        <section className="space-y-4 rounded-lg border bg-background p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">
              {editingId === null ? "Tambah Tipe Unit" : `Edit Tipe Unit #${editingId}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              ID tipe unit dibuat otomatis oleh database.
            </p>
          </div>
          <form onSubmit={saveTypeUnit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="type-name" className="text-sm font-medium">Nama tipe unit</label>
            <Input
              id="type-name"
              maxLength={191}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Studio"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="branch-id" className="text-sm font-medium">Branch ID</label>
            <Input
              id="branch-id"
              type="number"
              min={1}
              step={1}
              required
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              placeholder="Contoh: 1"
            />
          </div>
          <fieldset className="space-y-2 md:col-span-2">
            <legend className="text-sm font-medium">Fasilitas unit</legend>
            {facilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada fasilitas. Tambahkan melalui menu Fasilitas.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map((facility) => (
                  <label
                    key={facility.kodeFacility}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFacilityCodes.includes(facility.kodeFacility)}
                      onChange={() => toggleFacility(facility.kodeFacility)}
                      className="size-4 accent-primary"
                    />
                    <span>{facility.kodeFacility} — {facility.namaFacility}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingId === null ? "Tambah Tipe Unit" : "Simpan Perubahan"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </section>
      )}

      {!formOpen && (
        <section className="space-y-4 rounded-lg border bg-background p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Daftar Tipe Unit</h2>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Tipe Unit</TableHead>
                  <TableHead>Branch ID</TableHead>
                  <TableHead>Fasilitas</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center">Memuat data...</TableCell></TableRow>
                ) : typeUnits.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center">Belum ada tipe unit.</TableCell></TableRow>
                ) : typeUnits.map((typeUnit) => (
                  <TableRow key={typeUnit.idUnitType}>
                    <TableCell>{typeUnit.idUnitType}</TableCell>
                    <TableCell className="font-medium">{typeUnit.namaTypeUnit}</TableCell>
                    <TableCell>{typeUnit.branchId}</TableCell>
                    <TableCell>
                      {typeUnit.facilities.length > 0
                        ? typeUnit.facilities.map(({ facility }) => facility.namaFacility).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => editType(typeUnit)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === typeUnit.idUnitType}
                        onClick={() => void deleteTypeUnit(typeUnit)}
                      >
                        {deletingId === typeUnit.idUnitType ? "Menghapus..." : "Hapus"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  )
}
