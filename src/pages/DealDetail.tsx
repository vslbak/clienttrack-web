import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { crmApi } from '@/api';
import type { Deal, Activity, Proposal, DealStage, ActivityType } from '../types';
import { ArrowLeft, Calendar, DollarSign, Percent, Mail, PhoneCall, Video, FileText, Clock, Plus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { LoaderSpinner } from '@/components/common';
import {calcProposalTotal} from "@/lib/utils.ts";

const stageColors: Record<DealStage, string> = {
  LEAD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  DISCOVERY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  PROPOSAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CALL: PhoneCall,
  EMAIL: Mail,
  MEETING: Video,
  NOTE: FileText,
};

export function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({
    type: 'NOTE' as ActivityType,
    title: '',
    description: '',
  });
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [dealData, activitiesData, proposalsData] = await Promise.all([
        crmApi.getDeal(id),
        crmApi.getActivities(),
        crmApi.getProposals(),
      ]);
      setDeal(dealData);
      setActivities(
        activitiesData
          .filter(a => a.deal.id === id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      setProposals(proposalsData.filter(p => p.deal.id === id));
    } catch (error) {
      console.error('Error fetching deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage: DealStage) => {
    if (!id || !deal) return;
    try {
      await crmApi.updateDeal(id, { stage: newStage });
      setDeal({ ...deal, stage: newStage });
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const [tempValue, setTempValue] = useState<string>('');
  const [tempProbability, setTempProbability] = useState<string>('');

  const handleValueFocus = () => {
    if (!deal) return;
    setTempValue(deal.value.toString());
  };

  const handleValueBlur = async () => {
    if (!id || !deal || !tempValue) return;
    const newValue = parseFloat(tempValue);
    if (isNaN(newValue) || newValue < 0) {
      setTempValue('');
      return;
    }
    if (newValue === deal.value) {
      setTempValue('');
      return;
    }

    try {
      await crmApi.updateDeal(id, { value: newValue });
      setDeal({ ...deal, value: newValue });
      setTempValue('');
    } catch (error) {
      console.error('Error updating deal value:', error);
      setTempValue('');
    }
  };

  const handleProbabilityFocus = () => {
    if (!deal) return;
    setTempProbability(deal.probability.toString());
  };

  const handleProbabilityBlur = async () => {
    if (!id || !deal || !tempProbability) return;
    const newProbability = parseFloat(tempProbability);
    if (isNaN(newProbability) || newProbability < 0 || newProbability > 100) {
      setTempProbability('');
      return;
    }
    if (newProbability === deal.probability) {
      setTempProbability('');
      return;
    }

    try {
      await crmApi.updateDeal(id, { probability: newProbability });
      setDeal({ ...deal, probability: newProbability });
      setTempProbability('');
    } catch (error) {
      console.error('Error updating deal probability:', error);
      setTempProbability('');
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (!id || !deal) return;
    try {
      const dateString = date ? format(date, 'yyyy-MM-dd') : null;
      await crmApi.updateDeal(id, { expectedCloseDate: dateString });
      setDeal({ ...deal, expectedCloseDate: dateString });
      setDatePopoverOpen(false);
    } catch (error) {
      console.error('Error updating deal date:', error);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newActivity.title) return;

    try {
      const newAct = await crmApi.createActivity({
        ...newActivity,
        dealId: id
      });
      setActivities([newAct, ...activities]);
      setNewActivity({ type: 'NOTE', title: '', description: '' });
    } catch (error) {
      console.error('Error creating activity:', error);
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

  if (loading) {
    return <LoaderSpinner message="Loading deal details..." />;
  }

  if (!deal) {
    return <div className="text-center py-8">Deal not found</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight break-words">{deal.title}</h1>
          {deal.client && (
            <Link to={`/clients/${deal.client.id}`} className="text-sm sm:text-base text-muted-foreground hover:underline truncate block">
              {deal.client.name} {deal.client.company && `• ${deal.client.company}`}
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">€</span>
              <Input
                type="text"
                inputMode="decimal"
                value={tempValue || deal.value}
                onChange={(e) => setTempValue(e.target.value.replace(/[^0-9.]/g, ''))}
                onFocus={handleValueFocus}
                onBlur={handleValueBlur}
                className="text-xl font-semibold h-12 pl-9 pr-3 border-2 hover:border-primary focus:border-primary transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                value={tempProbability || deal.probability}
                onChange={(e) => setTempProbability(e.target.value.replace(/[^0-9]/g, ''))}
                onFocus={handleProbabilityFocus}
                onBlur={handleProbabilityBlur}
                className="text-xl font-semibold h-12 pr-9 border-2 hover:border-primary focus:border-primary transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={deal.stage} onValueChange={(value) => handleStageChange(value as DealStage)}>
              <SelectTrigger className="h-12 border-2 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="DISCOVERY">Discovery</SelectItem>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={`${stageColors[deal.stage]} w-full justify-center py-1`}>{deal.stage}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expected Close
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-medium text-sm border-2 hover:border-primary transition-colors"
                >
                  {deal.expectedCloseDate
                    ? format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')
                    : 'Set date...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {deal.client ? (
              <Link to={`/clients/${deal.client.id}`}>
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                      {deal.client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{deal.client.name}</p>
                      {deal.client.company && (
                        <p className="text-sm text-muted-foreground">{deal.client.company}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {deal.client.email}
                    </p>
                    {deal.client.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <PhoneCall className="h-3 w-3" />
                        {deal.client.phone}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No client associated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>{proposals.length} proposal(s) for this deal</CardDescription>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No proposals yet</p>
            ) : (
              <div className="space-y-2">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{proposal.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{proposal.status}</Badge>
                          <span className="text-sm font-semibold">
                              {calcProposalTotal(proposal)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Activity</CardTitle>
          <CardDescription>Log a new interaction for this deal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newActivity.type}
                  onValueChange={(value) => setNewActivity({ ...newActivity, type: value as ActivityType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Brief description"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Activity
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>{activities.length} activities recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activities yet. Add your first activity above.
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                            {activity.completed ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completed</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          <h4 className={`font-medium ${
                            activity.completed ? 'line-through text-muted-foreground' : ''
                          }`}>{activity.title}</h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                          )}
                        </div>
                        {!activity.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteActivity(activity.id)}
                            className="gap-2 text-xs"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Complete
                          </Button>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
