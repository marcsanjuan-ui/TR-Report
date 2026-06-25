'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

const NO_SIDEBAR_PATHS = ['/login']

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_PATHS.includes(pathname)

  if (!showSidebar) return <>{children}</>

  return (
    <div className="layout-with-sidebar">
      <div className="layout-sidebar">
        <Sidebar />
      </div>
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}
