import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { crmApi } from '@/api';
import type { Proposal, ProposalStatus } from '../types';
import { format } from 'date-fns';
import { Plus, FileText, Calendar, TrendingUp } from 'lucide-react';
import { LoaderSpinner } from '@/components/common';
import {calcProposalTotal} from "@/lib/utils.ts";

const statusSelectStyles: Record<string, string> = {
    PREPARED: 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    SENT: 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700',
    ACCEPTED: 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700',
    REJECTED: 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700',
};

export function Proposals() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const data = await crmApi.getProposals();

            // Sort newest first
            data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setProposals(data);
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (proposalId: string, newStatus: ProposalStatus) => {
        try {
            await crmApi.updateProposalStatus(proposalId, newStatus);
            setProposals(proposals.map(p =>
                p.id === proposalId ? { ...p, status: newStatus } : p
            ));
        } catch (error) {
            console.error('Error updating proposal status:', error);
        }
    };

    if (loading) {
        return <LoaderSpinner message="Loading proposals..." />;
    }

    // KPI values (safe)
    const totalValue = proposals.reduce((sum, p) => sum + calcProposalTotal(p), 0);
    const sentCount = proposals.filter(p => p.status === 'SENT').length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Proposals</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your sales proposals</p>
                </div>
                <Link to="/proposals/new" className="w-full sm:w-auto">
                    <Button className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        New Proposal
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Proposals</p>
                            <p className="text-2xl font-bold">{proposals.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="text-2xl font-bold">
                                €{totalValue.toLocaleString()}
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Sent Proposals</p>
                            <p className="text-2xl font-bold">{sentCount}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Deal</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {proposals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                                    No proposals found. Click "New Proposal" to create your first proposal.
                                </TableCell>
                            </TableRow>
                        ) : (
                            proposals.map((proposal) => {
                                const value = calcProposalTotal(proposal);

                                return (
                                    <TableRow key={proposal.id} className="group">
                                        <TableCell className="text-left">
                                            <Link to={`/proposals/${proposal.id}`} className="block hover:underline">
                                                <div>
                                                    <div className="font-medium">{proposal.title}</div>
                                                    {proposal.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                            {proposal.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </TableCell>

                                        <TableCell className="text-left">
                                            {proposal.deal?.client ? (
                                                <Link
                                                    to={`/clients/${proposal.deal.client.id}`}
                                                    className="hover:underline"
                                                >
                                                    <div className="font-medium">{proposal.deal.client.name}</div>
                                                    {proposal.deal.client.company && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {proposal.deal.client.company}
                                                        </div>
                                                    )}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-left">
                                            {proposal.deal ? (
                                                <Link
                                                    to={`/deals/${proposal.deal.id}`}
                                                    className="text-sm hover:underline"
                                                >
                                                    {proposal.deal.title}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="font-semibold">
                                            €{value.toLocaleString()}
                                        </TableCell>

                                        <TableCell className="text-left">
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={proposal.status}
                                                    onValueChange={(value) => handleStatusChange(proposal.id, value as ProposalStatus)}
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

                                            </div>
                                        </TableCell>

                                        <TableCell className="text-left">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            <Link to={`/proposals/${proposal.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>

                                            <Button variant="outline" asChild>
                                                <a href={`${import.meta.env.VITE_API_BASE_URL}/proposals/${proposal.id}/pdf`} target="_blank">
                                                    Download PDF
                                                </a>
                                            </Button>

                                        </TableCell>

                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                </div>
            </Card>
        </div>
    );
}
