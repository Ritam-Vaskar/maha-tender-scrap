"use client"

import { Card } from "@/components/ui-kit"

const COLORS = ["#4f8ff7", "#23b5a6", "#f2a93b", "#e05d6f", "#8b7cf6"]

function ChartCard({ title, description, children, empty }) {
  return <Card className="p-5"><h2 className="font-display text-lg font-bold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p>{empty ? <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">Not exposed in the current public source snapshot.</p> : <div className="mt-5 h-64">{children}</div>}</Card>
}

function HorizontalBars({ rows, color }) {
  const maximum = Math.max(...rows.map((row) => row.count), 1)
  return <div className="space-y-4 pt-2">{rows.map((row) => <div key={row.name}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-muted-foreground">{row.name}</span><strong>{row.count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${Math.max((row.count / maximum) * 100, 4)}%`, backgroundColor: color }} /></div></div>)}</div>
}

function Donut({ rows }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1
  let cursor = 0
  const segments = rows.map((row, index) => { const start = cursor; cursor += (row.count / total) * 100; return `${COLORS[index % COLORS.length]} ${start}% ${cursor}%` }).join(", ")
  return <div className="flex h-full items-center justify-center gap-8"><div className="relative h-44 w-44 rounded-full" style={{ background: `conic-gradient(${segments})` }}><div className="absolute inset-8 flex items-center justify-center rounded-full bg-card text-center"><div><strong className="block text-2xl">{total}</strong><span className="text-[11px] text-muted-foreground">tenders</span></div></div></div><div className="space-y-2 text-xs">{rows.map((row, index) => <div key={row.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{row.name}: <strong>{row.count}</strong></div>)}</div></div>
}

export function AnalyticsCharts({ closingDistribution = [], byDistrict = [], byOrganisation = [], byStatus = [] }) {
  const deadlineData = closingDistribution.slice(0, 8)
  const districtData = byDistrict.slice(0, 8)
  const organisationData = byOrganisation.slice(0, 8)
  const statusData = byStatus.length ? byStatus : closingDistribution
  return <section className="mt-6 grid gap-5 xl:grid-cols-2"><ChartCard title="Deadline pressure" description="How many tenders fall into each closing window." empty={!deadlineData.length}><HorizontalBars rows={deadlineData} color="#4f8ff7" /></ChartCard><ChartCard title="Tender status" description="Current public-source status mix." empty={!statusData.length}><Donut rows={statusData} /></ChartCard><ChartCard title="Tenders by district" description="Top districts by indexed tender count." empty={!districtData.length}><HorizontalBars rows={districtData} color="#23b5a6" /></ChartCard><ChartCard title="Leading organisations" description="Organisations with the most indexed opportunities." empty={!organisationData.length}><HorizontalBars rows={organisationData} color="#f2a93b" /></ChartCard></section>
}
