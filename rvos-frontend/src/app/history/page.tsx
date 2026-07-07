"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, Trash2, Calendar, Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const INITIAL_HISTORY = [
  { id: 1, prompt: "A dog running on grass", date: "June 29, 2026", time: "13:45", status: "completed", thumbnail: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=300" },
  { id: 2, prompt: "Red car driving on highway", date: "June 28, 2026", time: "09:20", status: "completed", thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=300" },
  { id: 3, prompt: "Person dancing in the rain", date: "June 27, 2026", time: "18:05", status: "failed", thumbnail: "https://images.unsplash.com/photo-1534065604812-706f9d372e36?auto=format&fit=crop&q=80&w=300" },
  { id: 4, prompt: "Bird flying across the sky", date: "June 25, 2026", time: "11:10", status: "completed", thumbnail: "https://images.unsplash.com/photo-1444464666168-49b626f86278?auto=format&fit=crop&q=80&w=300" },
]

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState(INITIAL_HISTORY)

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setHistoryData(prev => prev.filter(item => item.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">History</h1>
          <p className="text-muted-foreground">View and manage all your past segmentations.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by prompt..." />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert('Date picker modal would open here.')}>
              <Calendar className="mr-2 h-4 w-4" /> Date
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert('Filter options would open here.')}>
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {historyData.map((item) => (
            <Card key={item.id} className="overflow-hidden border-border/40 hover:shadow-md transition-shadow relative">
              <Link href="/result" className="absolute inset-0 z-10" />
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-32 shrink-0 bg-muted">
                  <img src={item.thumbnail} alt={item.prompt} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
                <CardContent className="flex-1 p-6 flex flex-col justify-center relative z-20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {item.status === 'completed' ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-destructive"></span>
                        )}
                        <h3 className="font-semibold text-lg line-clamp-1">"{item.prompt}"</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.date} at {item.time}</p>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto z-30">
                      <Button variant="secondary" size="sm" disabled={item.status === 'failed'} className="flex-1 md:flex-none" onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Downloading video directly to your device...') }}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={(e) => handleDelete(e, item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => alert('No more history available.')}>Load More</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
