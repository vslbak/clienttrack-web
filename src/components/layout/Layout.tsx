import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/button';
import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export function Layout() {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-shrink-0 flex items-center justify-between gap-3 border-b bg-background px-4 sm:px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full hover:scale-105 transition-all duration-200 gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Dark Mode</span>
              </>
            )}
          </Button>
        </div>
        <div className="flex-1">
          <div className="container mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
