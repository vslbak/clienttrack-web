import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Textarea} from '../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../components/ui/table';
import {crmApi} from '../api';
import type {Client, Deal, Activity, ActivityType} from '../types';
import {
    ArrowLeft,
    Building,
    Mail,
    Phone,
    DollarSign,
    Calendar,
    MessageSquare,
    PhoneCall,
    Video,
    FileText,
    Clock
} from 'lucide-react';
import {format} from 'date-fns';
import {LoaderSpinner} from '../components/common';
import {formatClientLastActivity} from '../lib/date';

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
    CALL: PhoneCall,
    EMAIL: Mail,
    MEETING: Video,
    NOTE: FileText,
};

const stageColors: Record<string, string> = {
    LEAD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    DISCOVERY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    PROPOSAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export function ClientDetail() {
    const {id} = useParams<{ id: string }>();
    const [client, setClient] = useState<Client | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [newActivity, setNewActivity] = useState({
        type: 'NOTE' as ActivityType,
        title: '',
        description: '',
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            const [clientData, dealsData, activitiesData] = await Promise.all([
                crmApi.getClient(id),
                crmApi.getDeals(),
                crmApi.getActivities(),
            ]);
            setClient(clientData);
            setDeals(dealsData.filter(d => d.client_id === id));
            setActivities(activitiesData.filter(a => a.client_id === id).sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !newActivity.title) return;

        try {
            await crmApi.createActivity({
                ...newActivity,
                client_id: id,
                completed: false,
            });
            setNewActivity({type: 'NOTE', title: '', description: ''});
            await fetchData();
        } catch (error) {
            console.error('Error creating activity:', error);
        }
    };

    if (loading) {
        return <LoaderSpinner message="Loading client details..."/>;
    }

    if (!client) {
        return <div className="text-center py-8">Client not found</div>;
    }

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const activeDeals = deals.filter(d => d.status === 'ACTIVE');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/clients">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-5 w-5 flex-shrink-0"/>
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-muted-foreground">{client.company || 'No company'}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                            {client.company ? client.company.split(' ').map(n => n[0]).join('').toUpperCase() : client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{client.name}</CardTitle>
                            <CardDescription>{client.company || 'No company'}</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Last Activity</p>
                            <p className="text-sm font-medium">{formatClientLastActivity(client, 'MMM d, yyyy')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 divide-x divide-border">
                        <div className="flex flex-col items-center justify-center py-4 px-6 gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground"/>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                            <p className="text-sm font-medium text-center break-all">{client.email}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4 px-6 gap-2">
                            <Phone className="h-5 w-5 text-muted-foreground"/>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                            <p className="text-sm font-medium">{client.phone || '-'}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center py-4 px-6 gap-2">
                            <Building className="h-5 w-5 text-muted-foreground"/>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Industry</p>
                            {client.industry ? (
                                <Badge variant="secondary">{client.industry}</Badge>
                            ) : (
                                <p className="text-sm font-medium">-</p>
                            )}
                        </div>
                    </div>
                    {client.notes && (
                        <div className="border-t pt-4 mt-4">
                            <div className="px-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Deals</CardTitle>
                        <CardDescription>{deals.length} total deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Value</span>
                                <span className="text-2xl font-bold">€{totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Active Deals</span>
                                <span className="text-lg font-semibold">{activeDeals.length}</span>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Stage</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            No deals found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    deals.map((deal) => (
                                        <TableRow key={deal.id}>
                                            <TableCell>
                                                <Link to={`/deals/${deal.id}`} className="font-medium hover:underline">
                                                    {deal.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={stageColors[deal.stage]}>{deal.stage}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                €{deal.value.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add Activity</CardTitle>
                        <CardDescription>Log a new interaction with this client</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddActivity} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={newActivity.type}
                                    onValueChange={(value) => setNewActivity({
                                        ...newActivity,
                                        type: value as ActivityType
                                    })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="note">Note</SelectItem>
                                        <SelectItem value="call">Call</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={newActivity.title}
                                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                                    placeholder="Brief description"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                                    placeholder="Additional details..."
                                    rows={3}
                                />
                            </div>
                            <Button type="submit" className="w-full">Add Activity</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

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
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Icon className="h-4 w-4 text-primary"/>
                                            </div>
                                            {index < activities.length - 1 && (
                                                <div className="w-px flex-1 bg-border mt-2"/>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.type}
                                                        </Badge>
                                                        {activity.completed && (
                                                            <Badge variant="secondary"
                                                                   className="text-xs">Completed</Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium">{activity.title}</h4>
                                                    {activity.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                                    )}
                                                    {activity.deal && (
                                                        <Link to={`/deals/${activity.deal.id}`}
                                                              className="text-xs text-primary hover:underline mt-2 inline-block">
                                                            Related to: {activity.deal.title}
                                                        </Link>
                                                    )}
                                                </div>
                                                <div
                                                    className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                                    <Clock className="h-3 w-3"/>
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
