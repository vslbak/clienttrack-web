import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, Mail, Calendar, Clock } from 'lucide-react';
import type { Activity } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NextActionsListProps {
  activities: Activity[];
}

const activityIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: Clock,
};

export function NextActionsList({ activities }: NextActionsListProps) {
  const upcomingActivities = activities
    .filter(a => !a.completed && a.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  return (
    <Card className="hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 animate-in overflow-hidden border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          Next Actions
        </CardTitle>
        <CardDescription>Upcoming tasks and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming activities</p>
          ) : (
            upcomingActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Clock;
              const dueDate = new Date(activity.due_date!);
              const isToday = dueDate.toDateString() === new Date().toDateString();
              const isTomorrow = dueDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

              let dueDateLabel = formatDistanceToNow(dueDate, { addSuffix: true });
              if (isToday) dueDateLabel = 'Today';
              else if (isTomorrow) dueDateLabel = 'Tomorrow';

              return (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 p-3 rounded-xl border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                      {activity.title}
                    </p>
                    {activity.client && (
                      <p className="text-xs text-muted-foreground">
                        {activity.client.name}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={isToday ? 'destructive' : 'secondary'}
                    className="shrink-0 shadow-sm"
                  >
                    {dueDateLabel}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
