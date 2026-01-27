import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Car, Droplets, FileText, Calculator } from "lucide-react"

async function getStats() {
  const [vehicleCategories, vehicleTypes, fuelProviders, fuelPrices, estimateHistory] = await Promise.all([
    prisma.vehicleCategory.count(),
    prisma.vehicleType.count(),
    prisma.fuelProvider.count(),
    prisma.fuelPrice.count(),
    prisma.estimateHistory.count(),
  ])

  return {
    vehicleCategories,
    vehicleTypes,
    fuelProviders,
    fuelPrices,
    estimateHistory,
  }
}

async function getRecentEstimates() {
  return prisma.estimateHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

export default async function AdminDashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  const [stats, recentEstimates] = await Promise.all([
    getStats(),
    getRecentEstimates(),
  ])

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
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title="Dashboard"
          description={`Selamat datang, ${session.email}`}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Kategori Kendaraan</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vehicleCategories}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.vehicleTypes} tipe kendaraan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Provider BBM</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fuelProviders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.fuelPrices} jenis BBM
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Estimasi</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.estimateHistory}</div>
                <p className="text-xs text-muted-foreground">
                  kalkulasi yang dibuat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Aktif</div>
                <p className="text-xs text-muted-foreground">
                  Sistem berjalan normal
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estimasi Terbaru</CardTitle>
              <CardDescription>5 estimasi terakhir yang dibuat pengguna</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEstimates.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada estimasi yang dibuat
                </p>
              ) : (
                <div className="space-y-4">
                  {recentEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {estimate.startName} → {estimate.endName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {estimate.distanceKm} km • {estimate.litersUsed} L • {formatDate(estimate.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(estimate.totalCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
