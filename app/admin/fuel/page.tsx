import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { FuelManagement } from "@/components/admin/fuel-management"
import { getFuelProviders } from "@/actions/fuel"

export default async function FuelAdminPage() {
  const session = await getSession()

  if (!session) {
    redirect("/admin/login")
  }

  const providers = await getFuelProviders()

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title="Manajemen Harga BBM"
          description="Kelola provider dan harga bahan bakar"
        />
        <main className="flex-1 overflow-auto p-6">
          <FuelManagement initialProviders={providers} />
        </main>
      </div>
    </div>
  )
}
