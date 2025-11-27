import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Users, DollarSign, CheckSquare, FileText, Sparkles } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Deals', href: '/deals', icon: DollarSign },
  { name: 'Activities', href: '/activities', icon: CheckSquare },
  { name: 'Proposals', href: '/proposals', icon: FileText },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ClientTrack
          </h1>
          <p className="text-xs text-muted-foreground">Sales CRM</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
