import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Phone, Mail, Calendar, FileText } from 'lucide-react';
import type { Activity } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityTimelineProps {
  activities: Activity[];
}

const activityIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
};

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  const recentActivities = activities
    .filter(a => a.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const gradients = [
    'from-primary to-blue-500',
    'from-secondary to-emerald-500',
    'from-chart-3 to-orange-500',
    'from-chart-4 to-violet-500',
    'from-chart-5 to-pink-500',
  ];

  return (
    <Card className="hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-in overflow-hidden border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest interactions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activities</p>
          ) : (
            recentActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || FileText;
              const timeAgo = formatDistanceToNow(new Date(activity.updatedAt), { addSuffix: true });
              const gradient = gradients[index % gradients.length];

              return (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    {index < recentActivities.length - 1 && (
                      <div className="absolute left-1/2 top-10 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-border to-transparent" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 pt-1 group-hover:translate-x-1 transition-transform duration-200">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {activity.title}
                    </p>
                    {activity.client && (
                      <p className="text-sm text-muted-foreground">
                        {activity.client.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
