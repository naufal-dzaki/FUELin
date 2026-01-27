import React from "react"
interface AdminHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-card px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
