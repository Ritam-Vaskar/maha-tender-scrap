import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui-kit"

export default function NotFound() {
  return <><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"><p className="text-sm font-semibold text-primary">404</p><h1 className="mt-2 text-3xl font-bold">Page not found</h1><p className="mt-3 text-sm text-muted-foreground">The page you requested does not exist.</p><Button as={Link} href="/" className="mt-6">Back to dashboard</Button></main></>
}