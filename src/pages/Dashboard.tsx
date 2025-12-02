import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, CheckSquare } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { DealStageChart } from '../components/dashboard/DealStageChart';
import { NextActionsList } from '../components/dashboard/NextActionsList';
import { RecentActivityTimeline } from '../components/dashboard/RecentActivityTimeline';
import { LoaderSpinner } from '../components/common';
import { crmApi } from '../api';
import type { Activity, Deal, DealStage } from '../types';

export function Dashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsData, activitiesData] = await Promise.all([
          crmApi.getDeals(),
          crmApi.getActivities(),
        ]);
        setDeals(dealsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeDeals = deals.filter(d => d.stage !== 'CLOSED' && d.stage !== 'LOST');
  const pipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const wonDealsThisMonth = deals.filter(d => {
    if (d.stage !== 'CLOSED') return false;
    const updatedDate = new Date(d.updatedAt);
    return updatedDate.getMonth() === currentMonth && updatedDate.getFullYear() === currentYear;
  }).length;

  const upcomingActivities = activities.filter(a => !a.completed).length;

  const dealsByStage = ([
    'LEAD', 'DISCOVERY', 'PROPOSAL', 'CLOSED', 'LOST'
  ] as DealStage[]).map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
    };
  });

  if (loading) {
    return <LoaderSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Here's your sales overview</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Pipeline Value"
          value={`€${pipelineValue.toLocaleString()}`}
          icon={DollarSign}
          description="Total active deal value"
          gradient="from-primary via-primary to-blue-500"
        />
        <MetricCard
          title="Active Deals"
          value={activeDeals.length}
          icon={TrendingUp}
          description="Currently in pipeline"
          gradient="from-secondary via-secondary to-emerald-500"
        />
        <MetricCard
          title="Won This Month"
          value={wonDealsThisMonth}
          icon={Users}
          description="Closed deals"
          gradient="from-chart-3 via-amber-500 to-orange-500"
        />
        <MetricCard
          title="Upcoming Tasks"
          value={upcomingActivities}
          icon={CheckSquare}
          description="Scheduled activities"
          gradient="from-chart-4 via-purple-500 to-violet-600"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <DealStageChart data={dealsByStage} />
        <NextActionsList activities={activities} />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <RecentActivityTimeline activities={activities} />
      </div>
    </div>
  );
}
