"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Clock, CheckCircle2, Play, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const recentGenerations = [
    { id: 1, prompt: "A dog running on grass", date: "2 hours ago", status: "completed", thumbnail: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=300" },
    { id: 2, prompt: "Red car driving on highway", date: "Yesterday", status: "completed", thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=300" },
    { id: 3, prompt: "Person dancing in the rain", date: "2 days ago", status: "failed", thumbnail: "https://images.unsplash.com/photo-1534065604812-706f9d372e36?auto=format&fit=crop&q=80&w=300" },
  ]

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Creator</h1>
            <p className="text-muted-foreground">Here's an overview of your segmentation projects.</p>
          </div>
          <Link href="/segment">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="mr-2 h-4 w-4" /> New Segmentation
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos Processed</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">+14% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 hours</div>
              <p className="text-xs text-muted-foreground">Using AI vs manual masking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Quota</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Unlimited</div>
              <p className="text-xs text-muted-foreground">Pro Plan active</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Generations</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {recentGenerations.map((gen) => (
              <Link key={gen.id} href="/result">
                <Card className="overflow-hidden group cursor-pointer transition-all hover:shadow-md border-border/40">
                  <div className="relative aspect-video overflow-hidden">
                  <img src={gen.thumbnail} alt={gen.prompt} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-10 w-10 text-white fill-white" />
                  </div>
                  {gen.status === 'failed' && (
                    <div className="absolute top-2 right-2 bg-destructive text-white text-xs px-2 py-1 rounded-md font-medium">Failed</div>
                  )}
                  {gen.status === 'completed' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">Completed</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm line-clamp-1 mb-1">"{gen.prompt}"</p>
                  <p className="text-xs text-muted-foreground">{gen.date}</p>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
