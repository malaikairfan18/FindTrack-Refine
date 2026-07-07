"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, RefreshCw, Share2, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function ResultPage() {
  const [downloaded, setDownloaded] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    // Load from local storage which was set by segment page
    const storedUrl = localStorage.getItem('segmented_video_url')
    const storedPrompt = localStorage.getItem('original_prompt')
    if (storedUrl) setVideoUrl(storedUrl)
    if (storedPrompt) setPrompt(storedPrompt)
  }, [])

  const handleDownload = () => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = 'segmented_result.mp4'
    a.click()
    
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 mb-2">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Processing Complete
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Segmentation Result</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => alert('Link copied to clipboard!')}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleDownload} disabled={downloaded}>
              {downloaded ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              {downloaded ? "Downloaded" : "Download MP4"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border-border/40 shadow-xl bg-black">
              <div className="relative aspect-video flex items-center justify-center group">
                {videoUrl ? (
                  <video 
                    src={videoUrl} 
                    className="w-full h-full object-cover" 
                    controls 
                    autoPlay 
                    loop
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No video loaded
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between items-center px-2">
              <Link href="/segment">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="mr-2 h-4 w-4" /> Generate Another
                </Button>
              </Link>
              <Button variant="outline" onClick={() => alert('Thanks for reporting! Our team will look into this issue.')}>
                Report Issue
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Original Prompt</span>
                    <p className="mt-1 font-medium bg-muted/50 p-3 rounded-lg border border-border/50">"{prompt || 'No prompt provided'}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Resolution</span>
                      <p className="mt-1 font-medium">1920x1080</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Duration</span>
                      <p className="mt-1 font-medium">15s</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Processing Model</span>
                    <p className="mt-1 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span> FindTrack-R³ (GPU 0)
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Generated At</span>
                    <p className="mt-1 font-medium">June 29, 2026 - 13:45 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
