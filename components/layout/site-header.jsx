"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Landmark, Bell, UserRound } from "lucide-react"
import { cn } from "@/lib/cn"
import { Button } from "@/components/ui-kit"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV = [
  { href: "/", label: "Explore" },
  { href: "/tenders", label: "Tenders" },
  { href: "/organisations", label: "Organisations" },
  { href: "/analytics", label: "Analytics" },
  { href: "/saved", label: "Saved" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function isActive(href) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  function onSearch(e) {
    e.preventDefault()
    if (e.nativeEvent?.isComposing) return
    const q = query.trim()
    router.push(q ? `/tenders?q=${encodeURIComponent(q)}` : "/tenders")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="h-[18px] w-[18px]" />
          </span>
          <span>
            Mah<span className="text-primary">Tender</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 items-center lg:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tenders, IDs, organisations…"
              aria-label="Search tenders"
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button
            as={Link}
            href="/tenders"
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="lg:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" title="Notifications">
            <Bell className="h-[18px] w-[18px]" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Profile" title="Profile">
            <UserRound className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  )
}
