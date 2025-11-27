import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export function Layout() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full hover:scale-105 transition-all duration-200 gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">Dark Mode</span>
              </>
            )}
          </Button>
        </div>
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
