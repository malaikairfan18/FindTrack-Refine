"use client"

import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { motion } from "framer-motion"
import { ArrowRight, Video, Target, Zap, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent dark:from-blue-500/20 dark:via-purple-500/10" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                FindTrack-R³ Engine Now Live
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
                Next-Gen <span className="text-gradient">Video Object Segmentation</span> Powered by AI
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Decoupled Identification and Propagation. Simply type what you want to segment, and let our advanced AI models track it perfectly across frames.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-8">
                    Start Segmenting for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8">
                    See How it Works
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose FindTrack.ai?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our revolutionary decoupled architecture offers unprecedented accuracy in referring video object segmentation.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-2xl">
                <div className="h-12 w-12 bg-blue-500/20 text-blue-500 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Flawless Identification</h3>
                <p className="text-muted-foreground">Uses EVF-SAM and Alpha-CLIP to find the exact reference frame dynamically, avoiding false positives.</p>
              </div>
              
              <div className="glass-panel p-8 rounded-2xl">
                <div className="h-12 w-12 bg-purple-500/20 text-purple-500 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast Tracking</h3>
                <p className="text-muted-foreground">Powered by Cutie, the mask is propagated backward and forward across frames instantly.</p>
              </div>
              
              <div className="glass-panel p-8 rounded-2xl">
                <div className="h-12 w-12 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center mb-6">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">High-Res Output</h3>
                <p className="text-muted-foreground">Export your segmented masks overlaid on your original video in full HD quality without watermarks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">Start for free, upgrade when you need more power.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="border border-border rounded-3xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
                <p className="text-muted-foreground mb-6">Perfect for trying out the platform.</p>
                <div className="mb-6"><span className="text-4xl font-bold">$0</span><span className="text-muted-foreground"> / forever</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> 5 Video segments per day</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Max video length: 15 seconds</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3" /> Standard queue priority</li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
              
              <div className="border border-primary bg-primary/5 rounded-3xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-2xl font-bold mb-2">Pro Subscription</h3>
                <p className="text-muted-foreground mb-6">For professionals and creators.</p>
                <div className="mb-6"><span className="text-4xl font-bold">$29</span><span className="text-muted-foreground"> / month</span></div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Unlimited video segments</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Max video length: 5 minutes</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Priority GPU processing</li>
                  <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> API Access</li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/signup">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
