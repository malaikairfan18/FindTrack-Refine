"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Wand2, RefreshCw, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function SegmentPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle")
  const [progress, setProgress] = useState(0)

  const handleProcess = async () => {
    if (!file || !prompt) return
    
    setStatus("uploading")
    setProgress(30)
    
    const formData = new FormData()
    formData.append("video", file)
    formData.append("prompt", prompt)
    // Send tracking_type if needed, default is "text"
    
    try {
      setStatus("processing")
      setProgress(60)
      
      const response = await fetch('/api/segment', {
          method: 'POST',
          body: formData,
          headers: {
              'ngrok-skip-browser-warning': 'true'
          }
      })
      
      if (!response.ok) {
        throw new Error('Processing failed on server')
      }
      
      const blob = await response.blob()
      const resultUrl = URL.createObjectURL(blob)
      
      // Store result in local storage for the result page
      localStorage.setItem('segmented_video_url', resultUrl)
      localStorage.setItem('original_prompt', prompt)
      
      setProgress(100)
      setStatus("done")
      setTimeout(() => {
        router.push("/result")
      }, 1000)
      
    } catch (error) {
      console.error(error)
      alert("Error processing video. Please check the backend console.")
      setStatus("idle")
      setProgress(0)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">New Segmentation</h1>
          <p className="text-muted-foreground">Upload a video and describe what you want to segment.</p>
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-6">
                <Card className="border-dashed border-2 border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Drag & Drop your video</h3>
                    <p className="text-muted-foreground mb-6">Supports MP4, MOV up to 500MB</p>
                    <div className="relative">
                      <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="video/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <Button variant="secondary">Browse Files</Button>
                    </div>
                    {file && <p className="mt-4 text-sm font-medium text-primary">Selected: {file.name}</p>}
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Text Prompt</label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g. A dog running on grass" 
                      className="pr-12 text-lg py-6"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      maxLength={100}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {prompt.length}/100
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-2 overflow-x-auto pb-2">
                    <span className="shrink-0 font-medium pt-1">Examples:</span>
                    <button className="shrink-0 bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition" onClick={() => setPrompt("Red car driving on highway")}>Red car driving on highway</button>
                    <button className="shrink-0 bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition" onClick={() => setPrompt("Person dancing in the rain")}>Person dancing in the rain</button>
                    <button className="shrink-0 bg-muted px-3 py-1 rounded-full hover:bg-muted/80 transition" onClick={() => setPrompt("Bird flying across the sky")}>Bird flying across the sky</button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-8"
                    disabled={!file || !prompt}
                    onClick={handleProcess}
                  >
                    <Wand2 className="mr-2 h-4 w-4" /> Generate Segmentation
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {(status === "uploading" || status === "processing" || status === "done") && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex items-center justify-center py-24"
            >
              <div className="text-center max-w-sm w-full space-y-6">
                <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
                  {status === "done" ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="h-8 w-8" />
                    </motion.div>
                  ) : (
                    <>
                      <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                      <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-primary transition-all duration-300 ease-out"
                          strokeWidth="8"
                          strokeDasharray={283}
                          strokeDashoffset={283 - (283 * progress) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="45"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </>
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {status === "uploading" && "Uploading Video..."}
                    {status === "processing" && "AI Processing..."}
                    {status === "done" && "Complete!"}
                  </h3>
                  <p className="text-muted-foreground">
                    {status === "uploading" && `${progress}% uploaded`}
                    {status === "processing" && `Extracting features & applying R³ loop (${progress}%)`}
                    {status === "done" && "Redirecting to results..."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
