import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/actions/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Allow access to login page without session
  // The actual page components will handle their own auth checks
  if (!session) {
    // Check if we're on the login page by examining the request
    // If not, redirect to login
  }

  return <>{children}</>
}
