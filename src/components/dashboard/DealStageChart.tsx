import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DealsByStage } from '../../types';

interface DealStageChartProps {
  data: DealsByStage[];
}

export function DealStageChart({ data }: DealStageChartProps) {
  const chartData = data.map(item => ({
    stage: item.stage.charAt(0).toUpperCase() + item.stage.slice(1),
    count: item.count,
    value: item.value,
  }));

  return (
    <Card className="hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-in overflow-hidden border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Pipeline by Stage
        </CardTitle>
        <CardDescription>Distribution of deals across pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis
              dataKey="stage"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'value') return [`€${value.toLocaleString()}`, 'Value'];
                return [value, 'Count'];
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#colorCount)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
