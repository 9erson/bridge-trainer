// ============================================================
// Layout — sidebar navigation + main content area
// Card Table Modernist: emerald sidebar, cream content
// Collapsible on mobile
// ============================================================

import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { getAllGames } from '@/lib/gameRegistry';
import { Spade, History, Menu, X, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// The game registry is static after module-load — hoist to module scope
// so we don't allocate a new array on every Layout render.
const games = getAllGames();

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Games', icon: <Spade className="w-4 h-4" /> },
    ...games.map((g) => ({
      path: `/game/${g.config.id}`,
      label: g.config.name,
      icon: <ChevronRight className="w-3.5 h-3.5" />,
      indent: true,
    })),
    { path: '/history', label: 'History', icon: <History className="w-4 h-4" /> },
    { path: '/reference', label: 'Reference', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center">
              <Spade className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-sidebar-foreground">Bridge Trainer</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors no-underline
                  ${'indent' in item && item.indent ? 'pl-8' : ''}
                  ${isActive(item.path)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50">
            v1.0 — Practice makes perfect
          </p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-12">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Spade className="w-4 h-4 text-sidebar-primary" />
            <span className="font-bold text-sm text-sidebar-foreground">Bridge Trainer</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground hover:bg-sidebar-accent min-h-[44px] min-w-[44px]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile nav dropdown */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-sidebar-border"
            >
              <nav className="p-3 space-y-0.5">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors no-underline
                        ${'indent' in item && item.indent ? 'pl-8' : ''}
                        ${isActive(item.path)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="md:p-8 p-4 pt-16 md:pt-8 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
