"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EstimateResult } from "@/lib/types"
import { MapPin, Clock, Gauge, Droplets, Wallet, Car, Fuel } from "lucide-react"

interface EstimateResultDisplayProps {
  result: EstimateResult
}

export function EstimateResultDisplay({ result }: EstimateResultDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) return `${mins} menit`
    if (mins === 0) return `${hours} jam`
    return `${hours} jam ${mins} menit`
  }

  return (
    <div className="animate-fade-in space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            Estimasi Biaya Bahan Bakar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {formatCurrency(result.totalCost)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Untuk perjalanan {result.distanceKm} km menggunakan {result.litersUsed} liter BBM
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <MapPin className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Rute Perjalanan</p>
                <p className="text-sm font-medium">{result.startLocation}</p>
                <p className="text-xs text-muted-foreground">ke</p>
                <p className="text-sm font-medium">{result.endLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Gauge className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Jarak Tempuh</p>
                <p className="text-2xl font-bold">{result.distanceKm} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Clock className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Estimasi Waktu</p>
                <p className="text-2xl font-bold">{formatDuration(result.durationMin)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Car className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Kendaraan</p>
                <p className="text-sm font-bold">{result.vehicleName}</p>
                <p className="text-xs text-muted-foreground">{result.kmPerLiter} km/liter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Fuel className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Bahan Bakar</p>
                <p className="text-sm font-bold">
                  {result.fuelProvider} - {result.fuelName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.fuelType} @ {formatCurrency(result.fuelPrice)}/L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Droplets className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Konsumsi BBM</p>
                <p className="text-2xl font-bold">{result.litersUsed} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
