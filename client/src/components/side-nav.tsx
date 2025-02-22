import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Feather, BarChart2 } from "lucide-react";

export function SideNav() {
  const [location] = useLocation();

  return (
    <nav className="h-screen w-16 border-r bg-sidebar flex flex-col items-center py-4 fixed left-0">
      <div className="flex flex-col gap-4">
        <Link href="/editor">
          <a className={cn(
            "p-3 rounded-lg hover:bg-sidebar-accent transition-colors",
            location === "/editor" && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}>
            <Feather className="w-6 h-6" />
          </a>
        </Link>
        <Link href="/statistics">
          <a className={cn(
            "p-3 rounded-lg hover:bg-sidebar-accent transition-colors",
            location === "/statistics" && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}>
            <BarChart2 className="w-6 h-6" />
          </a>
        </Link>
      </div>
    </nav>
  );
}
