import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { crmApi } from '@/api';
import type { Deal, DealStage, Client } from '../types';
import { Plus, Eye, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { LoaderSpinner } from '@/components/common';

const stageColors: Record<DealStage, string> = {
  LEAD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  DISCOVERY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  PROPOSAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    value: '',
    stage: 'LEAD' as DealStage,
    probability: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealsData, clientsData] = await Promise.all([
        crmApi.getDeals(),
        crmApi.getClients(),
      ]);
      setDeals(dealsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      return;
    }

    try {
      await crmApi.createDeal({
        clientId: formData.client_id,
        title: formData.title,
        value: parseFloat(formData.value),
        stage: formData.stage,
        probability: formData.probability,
      });
      await fetchData();
      setDialogOpen(false);
      setFormData({ client_id: '', title: '', value: '', stage: 'LEAD', probability: 50 });
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const filteredDeals = stageFilter === 'all'
    ? deals
    : deals.filter(d => d.stage === stageFilter);

  if (loading) {
    return <LoaderSpinner message="Loading deals..." />;
  }

  const totalPipelineValue = deals
    .filter(d => d.stage === 'LEAD' || d.stage === 'DISCOVERY' || d.stage === 'PROPOSAL')
    .reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Track your sales pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Add a new deal to your pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                    required
                  >
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.company ? `(${client.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Enterprise License Agreement"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value (EUR) *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="50000"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stage">Stage *</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => setFormData({ ...formData, stage: value as DealStage })}
                  >
                    <SelectTrigger id="stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="DISCOVERY">Discovery</SelectItem>
                      <SelectItem value="PROPOSAL">Proposal</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability">Probability: {formData.probability}%</Label>
                  <input
                    id="probability"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Deal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pipeline</p>
              <p className="text-2xl font-bold">€{totalPipelineValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Deals</p>
              <p className="text-2xl font-bold">{deals.filter(d => d.stage !== 'CLOSED' && d.stage !== 'LOST').length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <Label htmlFor="stage-filter" className="text-sm text-muted-foreground">Filter by Stage</Label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger id="stage-filter" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="DISCOVERY">Discovery</SelectItem>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                  {stageFilter === 'all'
                    ? 'No deals found. Click "New Deal" to create your first deal.'
                    : `No deals in ${stageFilter} stage.`
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredDeals.map((deal) => (
                <TableRow key={deal.id} className="group text-left">
                  <TableCell className="align-middle">
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {deal.probability}% probability
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    {deal.client ? (
                      <Link
                        to={`/clients/${deal.client.id}`}
                        className="text-sm hover:underline"
                      >
                        <div className="font-medium">{deal.client.name}</div>
                        {deal.client.company && (
                          <div className="text-xs text-muted-foreground">{deal.client.company}</div>
                        )}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge className={stageColors[deal.stage]}>
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold middle">
                    €{deal.value.toLocaleString()}
                  </TableCell>
                  <TableCell className="middle">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {deal.updatedAt ? format(new Date(deal.updatedAt), 'MMM d, yyyy') : '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right middle">
                    <Link to={`/deals/${deal.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
