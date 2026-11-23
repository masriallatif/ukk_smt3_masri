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

type Facility = {
  kodeFacility: string
  namaFacility: string
  _count: { typeUnits: number }
}

async function responseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.error ?? fallback
}

export default function FacilitiesPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const loadFacilities = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/facilities", { cache: "no-store" })
      if (response.status === 401) {
        router.push("/")
        return
      }

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error ?? "Gagal memuat data fasilitas.")
        return
      }
      setFacilities(data.facilities)
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const timeout = setTimeout(() => void loadFacilities(), 0)
    return () => clearTimeout(timeout)
  }, [loadFacilities])

  function resetForm() {
    setFormOpen(false)
    setEditingCode(null)
    setCode("")
    setName("")
  }

  function editFacility(facility: Facility) {
    setFormOpen(true)
    setEditingCode(facility.kodeFacility)
    setCode(facility.kodeFacility)
    setName(facility.namaFacility)
  }

  async function saveFacility(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      const response = await fetch(
        editingCode === null
          ? "/api/facilities"
          : `/api/facilities/${encodeURIComponent(editingCode)}`,
        {
          method: editingCode === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kodeFacility: code, namaFacility: name }),
        }
      )
      if (response.status === 401) {
        router.push("/")
        return
      }
      if (!response.ok) {
        setError(await responseError(response, "Gagal menyimpan fasilitas."))
        return
      }
      resetForm()
      await loadFacilities()
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteFacility(facility: Facility) {
    const confirmation = facility._count.typeUnits > 0
      ? `Fasilitas ini digunakan oleh ${facility._count.typeUnits} tipe unit. Hapus juga relasinya?`
      : `Hapus fasilitas "${facility.namaFacility}"?`
    if (!window.confirm(confirmation)) return

    setError("")
    setDeletingCode(facility.kodeFacility)
    try {
      const response = await fetch(
        `/api/facilities/${encodeURIComponent(facility.kodeFacility)}`,
        { method: "DELETE" }
      )
      if (response.status === 401) {
        router.push("/")
        return
      }
      if (!response.ok) {
        setError(await responseError(response, "Gagal menghapus fasilitas."))
        return
      }
      if (editingCode === facility.kodeFacility) resetForm()
      await loadFacilities()
    } catch {
      setError("Tidak bisa terhubung ke server.")
    } finally {
      setDeletingCode(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fasilitas</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola daftar fasilitas yang dapat dipilih pada setiap tipe unit.
          </p>
        </div>
        {!formOpen && (
          <Button onClick={() => {
            resetForm()
            setFormOpen(true)
          }}>
            Tambah Fasilitas
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
              {editingCode === null ? "Tambah Fasilitas" : `Edit Fasilitas ${editingCode}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              Kode fasilitas diisi manual, misalnya FCT001.
            </p>
          </div>
          <form onSubmit={saveFacility} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="facility-code" className="text-sm font-medium">Kode fasilitas</label>
            <Input
              id="facility-code"
              maxLength={191}
              required
              readOnly={editingCode !== null}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Contoh: FCT001"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="facility-name" className="text-sm font-medium">Nama fasilitas</label>
            <Input
              id="facility-name"
              maxLength={191}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: 30 m2 (30 meter persegi)"
            />
          </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingCode === null ? "Tambah Fasilitas" : "Simpan Perubahan"}
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
          <h2 className="text-lg font-semibold">Daftar Fasilitas</h2>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Fasilitas</TableHead>
                  <TableHead>Digunakan Pada</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center">Memuat data...</TableCell></TableRow>
                ) : facilities.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center">Belum ada fasilitas.</TableCell></TableRow>
                ) : facilities.map((facility) => (
                  <TableRow key={facility.kodeFacility}>
                    <TableCell className="font-medium">{facility.kodeFacility}</TableCell>
                    <TableCell>{facility.namaFacility}</TableCell>
                    <TableCell>{facility._count.typeUnits} tipe unit</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => editFacility(facility)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingCode === facility.kodeFacility}
                        onClick={() => void deleteFacility(facility)}
                      >
                        {deletingCode === facility.kodeFacility ? "Menghapus..." : "Hapus"}
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
