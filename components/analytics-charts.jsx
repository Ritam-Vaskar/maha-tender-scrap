"use client"

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui-kit"

const COLORS = ["#4f8ff7", "#23b5a6", "#f2a93b", "#e05d6f", "#8b7cf6"]

function ChartCard({ title, description, children, empty }) {
  return <Card className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-lg font-bold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div></div>{empty ? <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">Not exposed in the current public source snapshot.</p> : <div className="mt-5 h-64">{children}</div>}</Card>
}

function tooltipStyle() {
  return { contentStyle: { borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }, itemStyle: { color: "hsl(var(--foreground))" } }
}

export function AnalyticsCharts({ closingDistribution = [], byDistrict = [], byOrganisation = [], byStatus = [] }) {
  const deadlineData = closingDistribution.slice(0, 8)
  const districtData = byDistrict.slice(0, 8)
  const organisationData = byOrganisation.slice(0, 8)
  const statusData = byStatus.length ? byStatus : closingDistribution
  return <section className="mt-6 grid gap-5 xl:grid-cols-2"><ChartCard title="Deadline pressure" description="How many tenders fall into each closing window." empty={!deadlineData.length}><ResponsiveContainer width="100%" height="100%"><BarChart data={deadlineData} layout="vertical" margin={{ left: 8, right: 12 }}><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip {...tooltipStyle()} /><Bar dataKey="count" fill="#4f8ff7" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Tender status" description="Current public-source status mix." empty={!statusData.length}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={3}>{statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip {...tooltipStyle()} /></PieChart></ResponsiveContainer></ChartCard><ChartCard title="Tenders by district" description="Top districts by indexed tender count." empty={!districtData.length}><ResponsiveContainer width="100%" height="100%"><BarChart data={districtData} margin={{ left: 0, right: 12 }}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip {...tooltipStyle()} /><Bar dataKey="count" fill="#23b5a6" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Leading organisations" description="Organisations with the most indexed opportunities." empty={!organisationData.length}><ResponsiveContainer width="100%" height="100%"><BarChart data={organisationData} layout="vertical" margin={{ left: 8, right: 12 }}><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} /><Tooltip {...tooltipStyle()} /><Bar dataKey="count" fill="#f2a93b" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></ChartCard></section>
}