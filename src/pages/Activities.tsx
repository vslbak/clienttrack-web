import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { crmApi } from '@/api';
import type { Activity, ActivityType } from '../types';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { PhoneCall, Mail, Video, FileText, Clock, User, Briefcase, CheckCircle } from 'lucide-react';
import { LoaderSpinner } from '@/components/common';
import * as React from "react";

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CALL: PhoneCall,
  EMAIL: Mail,
  MEETING: Video,
  NOTE: FileText,
};

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await crmApi.getActivities();
      setActivities(data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await crmApi.completeActivity(activityId);
      setActivities(activities.map(a =>
        a.id === activityId ? { ...a, completed: true } : a
      ));
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const filteredActivities = typeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === typeFilter);

  if (loading) {
    return <LoaderSpinner message="Loading activities..." />;
  }

  const completedCount = activities.filter(a => a.completed).length;
  const pendingCount = activities.filter(a => !a.completed).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your tasks and interactions</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <CardTitle>Activity Timeline</CardTitle>
          <div className="w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CALL">Calls</SelectItem>
                <SelectItem value="EMAIL">Emails</SelectItem>
                <SelectItem value="MEETING">Meetings</SelectItem>
                <SelectItem value="NOTE">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {typeFilter === 'all'
              ? 'No activities found'
              : `No ${typeFilter} activities found`
            }
          </p>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      activity.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        activity.completed ? 'text-green-600 dark:text-green-400' : 'text-primary'
                      }`} />
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="border-2 rounded-lg bg-card">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize font-medium">
                              {activity.type}
                            </Badge>
                            {activity.completed ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>

                        <h4 className={`font-semibold text-base ${
                          activity.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {activity.title}
                        </h4>

                        {activity.description && (
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {activity.deal?.client && (
                              <Link
                                to={`/clients/${activity.deal.client.id}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                              >
                                <User className="h-3.5 w-3.5" />
                                {activity.deal.client.name}
                              </Link>
                            )}
                            {activity.deal && (
                              <Link
                                to={`/deals/${activity.deal.id}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                              >
                                <Briefcase className="h-3.5 w-3.5" />
                                {activity.deal.title}
                              </Link>
                            )}
                          </div>
                          {!activity.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteActivity(activity.id)}
                              className="gap-2 text-xs h-8"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
