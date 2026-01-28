import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getScrapingLogs, getFuelProviders } from "@/actions/fuel"
import { AlertCircle, CheckCircle2, Clock, Terminal, ExternalLink } from "lucide-react"
import type { ScrapingLog } from "@prisma/client"
import Link from "next/link"

export default async function ScrapingStatusPage() {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  const [logs, providers] = await Promise.all([
    getScrapingLogs(),
    getFuelProviders(),
  ])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const latestUpdates = providers.map((provider) => {
    const latestPrice = provider.fuelPrices.reduce((latest, current) => {
      if (!latest) return current
      return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
    }, provider.fuelPrices[0])

    return {
      provider: provider.name,
      lastUpdated: latestPrice?.updatedAt,
      priceCount: provider.fuelPrices.length,
    }
  })

  const fuelSources = [
    {
      provider: "Pertamina",
      url: "https://mypertamina.id/about/product-price",
      description: "MyPertamina - Harga Produk",
    },
    {
      provider: "Shell",
      url: "https://www.shell.co.id/in_id/pengendara-bermotor/bahan-bakar-shell/how-shell-price-fuel.html",
      description: "Shell Indonesia - Harga BBM",
    },
    {
      provider: "BP",
      url: "https://www.bp.com/id_id/indonesia/home/produk-dan-layanan/spbu/harga.html",
      description: "BP Indonesia - Harga BBM",
    },
  ]

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title="Status Scraping"
          description="Pantau status update harga BBM"
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Scraping Manual</AlertTitle>
              <AlertDescription>
                Scraping harga BBM dijalankan secara lokal menggunakan perintah{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-sm">npm run scrape:fuel</code>.
                Scraping tidak berjalan otomatis di Vercel runtime untuk alasan keamanan.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Update Terakhir per Provider</CardTitle>
                <CardDescription>Status harga BBM dari setiap provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {latestUpdates.map((update) => (
                    <div key={update.provider} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{update.provider}</span>
                        <Badge variant={update.lastUpdated ? "default" : "secondary"}>
                          {update.priceCount} produk
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {update.lastUpdated ? formatDate(update.lastUpdated) : "Belum ada data"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sumber Harga BBM</CardTitle>
                <CardDescription>Website resmi untuk mendapatkan harga BBM terbaru</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fuelSources.map((source) => (
                    <div key={source.provider} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <span className="font-medium">{source.provider}</span>
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                      </div>
                      <Link
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Kunjungi
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Log Scraping</CardTitle>
                <CardDescription>Riwayat eksekusi scraping terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Belum ada log scraping
                  </p>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log: ScrapingLog) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-lg border p-4"
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.provider}</span>

                            <Badge
                              className={
                                log.status === "SUCCESS"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }
                            >
                              {log.status}
                            </Badge>
                          </div>

                          {log.message && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {log.message}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
