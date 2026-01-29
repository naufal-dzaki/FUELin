"use client"

import { useState, useEffect } from "react"
import Select from "@/components/ui/client-select"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"

import {
  getProvinces,
  getRegencies,
  getDistricts,
  getVillages,
} from "@/actions/location"

import type { Province, Regency, District, Village } from "@/lib/types"

interface LocationSelectorProps {
  label: string
  onLocationChange: (locationString: string) => void
}

interface Option {
  value: string
  label: string
}

export function LocationSelector({
  label,
  onLocationChange,
}: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<Option[]>([])
  const [regencies, setRegencies] = useState<Option[]>([])
  const [districts, setDistricts] = useState<Option[]>([])
  const [villages, setVillages] = useState<Option[]>([])

  const [province, setProvince] = useState<Option | null>(null)
  const [regency, setRegency] = useState<Option | null>(null)
  const [district, setDistrict] = useState<Option | null>(null)
  const [village, setVillage] = useState<Option | null>(null)

  const [loading, setLoading] = useState({
    provinces: true,
    regencies: false,
    districts: false,
    villages: false,
  })

  useEffect(() => {
    async function load() {
      setLoading((p) => ({ ...p, provinces: true }))
      const data: Province[] = await getProvinces()
      setProvinces(data.map((p) => ({ value: p.code, label: p.name })))
      setLoading((p) => ({ ...p, provinces: false }))
    }
    load()
  }, [])

  useEffect(() => {
    if (!province) return

    async function load() {
      setLoading((p) => ({ ...p, regencies: true }))
      const data: Regency[] = await getRegencies(province!.value)
      setRegencies(data.map((r) => ({ value: r.code, label: r.name })))
      setLoading((p) => ({ ...p, regencies: false }))
    }

    load()

    setRegency(null)
    setDistrict(null)
    setVillage(null)
    setDistricts([])
    setVillages([])
  }, [province])

  useEffect(() => {
    if (!regency) return

    async function load() {
      setLoading((p) => ({ ...p, districts: true }))
      const data: District[] = await getDistricts(regency!.value)
      setDistricts(data.map((d) => ({ value: d.code, label: d.name })))
      setLoading((p) => ({ ...p, districts: false }))
    }

    load()

    setDistrict(null)
    setVillage(null)
    setVillages([])
  }, [regency])

  useEffect(() => {
    if (!district) return

    async function load() {
      setLoading((p) => ({ ...p, villages: true }))
      const data: Village[] = await getVillages(district!.value)
      setVillages(data.map((v) => ({ value: v.code, label: v.name })))
      setLoading((p) => ({ ...p, villages: false }))
    }

    load()

    setVillage(null)
  }, [district])

  useEffect(() => {
    const parts = [
      village ? village?.label : district?.label,
      regency?.label,
      province?.label,
    ].filter(Boolean)

    onLocationChange(parts.join(", "))
  }, [province, regency, district, village, onLocationChange])

  const selectClassNames = {
    control: () =>
      "min-h-[40px] rounded-md border border-input bg-background px-1 text-sm shadow-sm",
    menu: () => "rounded-md border bg-popover shadow-md",
    option: ({ isFocused }: any) =>
      `cursor-pointer px-3 py-2 text-sm ${
        isFocused ? "bg-accent" : ""
      }`,
    placeholder: () => "text-muted-foreground",
    singleValue: () => "text-foreground",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">{label}</Label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Provinsi *
          </Label>
          <Select
            placeholder="Cari provinsi..."
            options={provinces}
            value={province}
            onChange={setProvince}
            isLoading={loading.provinces}
            classNames={selectClassNames}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Kota / Kabupaten *
          </Label>
          <Select
            placeholder="Cari kota / kabupaten..."
            options={regencies}
            value={regency}
            onChange={setRegency}
            isDisabled={!province}
            isLoading={loading.regencies}
            classNames={selectClassNames}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Kecamatan (opsional)
          </Label>
          <Select
            placeholder="Cari kecamatan..."
            options={districts}
            value={district}
            onChange={setDistrict}
            isDisabled={!regency}
            isLoading={loading.districts}
            classNames={selectClassNames}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Kelurahan / Desa (opsional)
          </Label>
          <Select
            placeholder="Cari kelurahan / desa..."
            options={villages}
            value={village}
            onChange={setVillage}
            isDisabled={!district}
            isLoading={loading.villages}
            classNames={selectClassNames}
          />
        </div>
      </div>
    </div>
  )
}
