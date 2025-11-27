import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  gradient?: string;
}

export function MetricCard({ title, value, icon: Icon, description, trend, gradient = 'from-primary to-primary/80' }: MetricCardProps) {
  return (
    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 animate-in overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? 'text-secondary bg-secondary/10'
                : 'text-destructive bg-destructive/10'
            }`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
