import Link from "next/link"
import { Sparkles, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <Link href="/" className="font-bold text-xl tracking-tight">
            FindTrack<span className="text-primary">.ai</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-border/40 p-4 flex flex-col gap-4">
          <Link href="/#features" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Features</Link>
          <Link href="/#how-it-works" className="text-sm font-medium" onClick={() => setIsOpen(false)}>How it Works</Link>
          <Link href="/#pricing" className="text-sm font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
          <hr className="border-border" />
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button variant="outline" className="w-full">Sign In</Button>
          </Link>
          <Link href="/signup" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
