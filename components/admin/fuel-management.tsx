"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createFuelProvider,
  updateFuelProvider,
  deleteFuelProvider,
  createFuelPrice,
  updateFuelPrice,
  deleteFuelPrice,
} from "@/actions/fuel"
import type { FuelProviderWithPrices } from "@/lib/types"
import { Plus, Pencil, Trash2, Loader2, Droplets } from "lucide-react"
import { toast } from "sonner"

interface FuelManagementProps {
  initialProviders: FuelProviderWithPrices[]
}

const FUEL_TYPES = ["RON 90", "RON 92", "RON 95", "RON 98", "Diesel"]

export function FuelManagement({ initialProviders }: FuelManagementProps) {
  const [providers, setProviders] = useState(initialProviders)
  const [loading, setLoading] = useState(false)

  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<FuelProviderWithPrices | null>(null)
  const [providerName, setProviderName] = useState("")

  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<{ id: number; fuelName: string; fuelType: string; price: number; providerId: number } | null>(null)
  const [priceFuelName, setPriceFuelName] = useState("")
  const [priceFuelType, setPriceFuelType] = useState("")
  const [priceAmount, setPriceAmount] = useState("")
  const [priceProvider, setPriceProvider] = useState("")

  const resetProviderForm = () => {
    setEditingProvider(null)
    setProviderName("")
  }

  const resetPriceForm = () => {
    setEditingPrice(null)
    setPriceFuelName("")
    setPriceFuelType("")
    setPriceAmount("")
    setPriceProvider("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(date))
  }

  const handleSaveProvider = async () => {
    if (!providerName) {
      toast.error("Mohon isi nama provider")
      return
    }

    setLoading(true)
    try {
      if (editingProvider) {
        const result = await updateFuelProvider(editingProvider.id, providerName)
        if (result.success) {
          setProviders((prev) =>
            prev.map((p) =>
              p.id === editingProvider.id ? { ...p, name: providerName } : p
            )
          )
          toast.success("Provider berhasil diupdate")
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createFuelProvider(providerName)
        if (result.success && result.data) {
          setProviders((prev) => [...prev, { ...result.data, fuelPrices: [] }])
          toast.success("Provider berhasil ditambahkan")
        } else {
          toast.error(result.error)
        }
      }
      setProviderDialogOpen(false)
      resetProviderForm()
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProvider = async (id: number) => {
    if (!confirm("Yakin ingin menghapus provider ini? Semua harga BBM dari provider ini juga akan dihapus.")) return

    setLoading(true)
    try {
      const result = await deleteFuelProvider(id)
      if (result.success) {
        setProviders((prev) => prev.filter((p) => p.id !== id))
        toast.success("Provider berhasil dihapus")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrice = async () => {
    if (!priceFuelName || !priceFuelType || !priceAmount || !priceProvider) {
      toast.error("Mohon lengkapi semua field")
      return
    }

    setLoading(true)
    try {
      if (editingPrice) {
        const result = await updateFuelPrice(editingPrice.id, priceFuelName, priceFuelType, parseInt(priceAmount))
        if (result.success) {
          setProviders((prev) =>
            prev.map((p) => ({
              ...p,
              fuelPrices: p.fuelPrices.map((fp) =>
                fp.id === editingPrice.id
                  ? { ...fp, fuelName: priceFuelName, fuelType: priceFuelType, price: parseInt(priceAmount) }
                  : fp
              ),
            }))
          )
          toast.success("Harga BBM berhasil diupdate")
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createFuelPrice(parseInt(priceProvider), priceFuelName, priceFuelType, parseInt(priceAmount))
        if (result.success && result.data) {
          setProviders((prev) =>
            prev.map((p) =>
              p.id === parseInt(priceProvider)
                ? { ...p, fuelPrices: [...p.fuelPrices, { ...result.data, updatedAt: new Date() }] }
                : p
            )
          )
          toast.success("Harga BBM berhasil ditambahkan")
        } else {
          toast.error(result.error)
        }
      }
      setPriceDialogOpen(false)
      resetPriceForm()
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrice = async (id: number) => {
    if (!confirm("Yakin ingin menghapus harga BBM ini?")) return

    setLoading(true)
    try {
      const result = await deleteFuelPrice(id)
      if (result.success) {
        setProviders((prev) =>
          prev.map((p) => ({
            ...p,
            fuelPrices: p.fuelPrices.filter((fp) => fp.id !== id),
          }))
        )
        toast.success("Harga BBM berhasil dihapus")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Provider BBM</CardTitle>
            <CardDescription>Kelola provider bahan bakar</CardDescription>
          </div>
          <Dialog open={providerDialogOpen} onOpenChange={(open) => {
            setProviderDialogOpen(open)
            if (!open) resetProviderForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProvider ? "Edit Provider" : "Tambah Provider"}</DialogTitle>
                <DialogDescription>
                  {editingProvider ? "Update informasi provider" : "Tambahkan provider bahan bakar baru"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="providerName">Nama Provider</Label>
                  <Input
                    id="providerName"
                    placeholder="Contoh: Pertamina"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProviderDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSaveProvider} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProvider ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jumlah Produk</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      {provider.name}
                    </div>
                  </TableCell>
                  <TableCell>{provider.fuelPrices.length} produk</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProvider(provider)
                          setProviderName(provider.name)
                          setProviderDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {providers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Belum ada provider
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Harga BBM</CardTitle>
            <CardDescription>Kelola harga bahan bakar per provider</CardDescription>
          </div>
          <Dialog open={priceDialogOpen} onOpenChange={(open) => {
            setPriceDialogOpen(open)
            if (!open) resetPriceForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Harga BBM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPrice ? "Edit Harga BBM" : "Tambah Harga BBM"}</DialogTitle>
                <DialogDescription>
                  {editingPrice ? "Update informasi harga BBM" : "Tambahkan harga BBM baru"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="priceProvider">Provider</Label>
                  <Select value={priceProvider} onValueChange={setPriceProvider} disabled={!!editingPrice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceFuelName">Nama BBM</Label>
                  <Input
                    id="priceFuelName"
                    placeholder="Contoh: Pertamax, V-Power"
                    value={priceFuelName}
                    onChange={(e) => setPriceFuelName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceFuelType">Tipe/RON</Label>
                  <Select value={priceFuelType} onValueChange={setPriceFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceAmount">Harga per Liter (Rp)</Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    placeholder="Contoh: 12950"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSavePrice} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPrice ? "Update" : "Tambah"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Nama BBM</TableHead>
                <TableHead>Tipe/RON</TableHead>
                <TableHead>Harga/Liter</TableHead>
                <TableHead>Terakhir Update</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.flatMap((provider) =>
                provider.fuelPrices.map((fuel) => (
                  <TableRow key={fuel.id}>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell className="font-medium">{fuel.fuelName}</TableCell>
                    <TableCell>{fuel.fuelType}</TableCell>
                    <TableCell>{formatCurrency(fuel.price)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(fuel.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPrice({ ...fuel, providerId: provider.id })
                            setPriceFuelName(fuel.fuelName)
                            setPriceFuelType(fuel.fuelType)
                            setPriceAmount(fuel.price.toString())
                            setPriceProvider(provider.id.toString())
                            setPriceDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePrice(fuel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {providers.every((p) => p.fuelPrices.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Belum ada harga BBM
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
