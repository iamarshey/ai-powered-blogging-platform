'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Search, PenSquare, LayoutDashboard, LogOut, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>AI Pulse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link href="/" className={pathname === '/' ? 'text-foreground font-semibold' : 'hover:text-foreground'}>
              Home
            </Link>
            <Link href="/explore" className={pathname === '/explore' ? 'text-foreground font-semibold' : 'hover:text-foreground'}>
              Explore
            </Link>
            <Link href="/about" className={pathname === '/about' ? 'text-foreground font-semibold' : 'hover:text-foreground'}>
              About
            </Link>
          </nav>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center w-64 md:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blogs or ask AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border bg-muted/50 py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border hover:bg-muted text-muted-foreground"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                <Link
                  href="/dashboard/editor"
                  className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>Write Post</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 text-purple-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg px-2.5 py-1.5 hover:bg-amber-500/10"
                  title="Admin Dashboard"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-3 py-1.5 text-xs font-medium hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
