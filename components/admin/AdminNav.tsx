"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Package, ClipboardList, Settings, Globe2 } from "lucide-react"

const navLinks = [
  { href: "/admin",          label: "Mahsulotlar", icon: <Package      size={20} /> },
  { href: "/admin/orders",   label: "Buyurtmalar", icon: <ClipboardList size={20} /> },
  { href: "/admin/settings", label: "Sozlamalar",  icon: <Settings     size={20} /> },
]

async function serverLogout() {
  // Clear the HttpOnly admin_session cookie on the server
  await fetch('/api/admin-auth', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'logout' }),
  }).catch(() => {})
  // Clear client-side gate
  sessionStorage.removeItem('admin_auth')
}

export default function AdminNav({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()

  async function handleLogout() {
    await serverLogout()
    onLogout()
  }

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden sm:flex items-center justify-between h-14 px-6 bg-[#2C1F28] border-b border-[#3D2A36] sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <span className="text-brand-deeprose text-xl">&#8226;</span>
          <span className="font-bold text-[15px] text-white">Didosh Style Admin</span>
        </div>
        <div className="flex gap-6">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} className="relative flex flex-col items-center">
                <span className={active ? "text-white text-[14px] font-medium" : "text-[#9B7B85] text-[14px] font-medium"}>
                  {link.label}
                </span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full bg-brand-deeprose" />
                )}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="text-[14px] px-3 py-2 rounded text-white hover:bg-[#3D2A36] transition">
            Sayt
          </a>
          <button onClick={handleLogout}
            className="text-[14px] px-3 py-2 rounded text-white hover:bg-[#3D2A36] transition flex items-center gap-1">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full h-14 bg-[#2C1F28] border-t border-[#3D2A36] flex justify-around items-center z-40">
        <Link href="/admin" className="flex flex-col items-center justify-center gap-0.5 flex-1">
          <Package size={20} className={pathname === "/admin" ? "text-brand-deeprose" : "text-[#9B7B85]"} />
          <span className={pathname === "/admin" ? "text-brand-deeprose text-xs" : "text-[#9B7B85] text-xs"}>Mahsulotlar</span>
        </Link>
        <Link href="/admin/orders" className="flex flex-col items-center justify-center gap-0.5 flex-1">
          <ClipboardList size={20} className={pathname === "/admin/orders" ? "text-brand-deeprose" : "text-[#9B7B85]"} />
          <span className={pathname === "/admin/orders" ? "text-brand-deeprose text-xs" : "text-[#9B7B85] text-xs"}>Buyurtmalar</span>
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 flex-1">
          <Globe2 size={20} className="text-[#9B7B85]" />
          <span className="text-[#9B7B85] text-xs">Sayt</span>
        </a>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-0.5 flex-1">
          <LogOut size={20} className="text-[#9B7B85]" />
          <span className="text-[#9B7B85] text-xs">Chiqish</span>
        </button>
      </nav>
    </>
  )
}
