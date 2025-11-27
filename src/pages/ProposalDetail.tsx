import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { crmApi } from '@/api';
import type { Proposal, ProposalStatus } from '../types';
import { ArrowLeft, FileText, Calendar, DollarSign, Building2, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { LoaderSpinner } from '@/components/common';

const statusSelectStyles: Record<string, string> = {
    PREPARED: 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    SENT: 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700',
    ACCEPTED: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700',
    REJECTED: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700',
};


export function ProposalDetail() {
    const { id } = useParams<{ id: string }>();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProposal();
    }, [id]);

    const fetchProposal = async () => {
        if (!id) return;
        try {
            const data = await crmApi.getProposal(id);
            setProposal(data);
        } catch (error) {
            console.error('Error fetching proposal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: ProposalStatus) => {
        if (!id || !proposal) return;
        try {
            await crmApi.updateProposalStatus(id, newStatus);
            setProposal({ ...proposal, status: newStatus });
        } catch (error) {
            console.error('Error updating proposal status:', error);
        }
    };

    if (loading) {
        return <LoaderSpinner message="Loading proposal..." />;
    }

    if (!proposal) {
        return <div className="text-center py-8">Proposal not found</div>;
    }

    const totalValue = proposal.pricingItems?.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    ) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/proposals">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
                            <p className="text-muted-foreground">{proposal.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{proposal.pricingItems?.length || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-semibold">
                            {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select
                            value={proposal.status}
                            onValueChange={(value) => handleStatusChange(value as ProposalStatus)}
                        >
                            <SelectTrigger className={`h-8 text-xs rounded-md ${statusSelectStyles[proposal.status]}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PREPARED">Prepared</SelectItem>
                                <SelectItem value="SENT">Sent</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {proposal.deal?.client && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Client Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link to={`/clients/${proposal.deal.client.id}`}>
                                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold">
                                            {proposal.deal.client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{proposal.deal.client.name}</p>
                                            {proposal.deal.client.company && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Building2 className="h-3 w-3" />
                                                    {proposal.deal.client.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p>{proposal.deal.client.email}</p>
                                        {proposal.deal.client.phone && <p>{proposal.deal.client.phone}</p>}
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {proposal.deal && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Related Deal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link to={`/deals/${proposal.deal.id}`}>
                                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                    <p className="font-semibold text-lg mb-2">{proposal.deal.title}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Value</p>
                                            <p className="font-semibold">€{proposal.deal.value.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Stage</p>
                                            <Badge variant="outline">{proposal.deal.stage}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Probability</p>
                                            <p className="font-semibold">{proposal.deal.probability}%</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing Items</CardTitle>
                    <CardDescription>
                        {proposal.pricingItems?.length || 0} item(s) in this proposal
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!proposal.pricingItems || proposal.pricingItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No pricing items in this proposal
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proposal.pricingItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.description}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">€{item.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            €{(item.quantity * item.price).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="border-t-2 font-bold">
                                    <TableCell colSpan={3} className="text-right">Total</TableCell>
                                    <TableCell className="text-right text-lg">
                                        €{totalValue.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
