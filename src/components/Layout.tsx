import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Factory, Layers, Menu, Package, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Products', icon: Package },
  { to: '/raw-materials', label: 'Raw Materials', icon: Layers },
  { to: '/production', label: 'Production', icon: Factory },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-8 sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className=" flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AutoFlex
            </h1>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.5,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden max-md:mb-2"
            >
              <div className="container py-2 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main className="flex-1 p-8 w-full bg-neutral-100">
        <div className="py-6 md:py-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
