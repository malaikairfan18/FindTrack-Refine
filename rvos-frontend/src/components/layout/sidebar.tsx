import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Video, History, User, LogOut, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "New Segmentation", href: "/segment", icon: Video },
    { name: "History", href: "/history", icon: History },
    { name: "Profile & Settings", href: "/profile", icon: User },
  ]

  return (
    <aside className="w-64 border-r border-border/40 bg-background/50 backdrop-blur-md flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">FindTrack.ai</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-border/40">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-primary/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm mb-2">
            <Zap className="h-4 w-4 text-purple-500" /> Pro Plan
          </div>
          <p className="text-xs text-muted-foreground mb-3">You have unlimited segments.</p>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-full" />
          </div>
        </div>
        <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  )
}
