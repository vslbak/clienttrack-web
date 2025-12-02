import {useEffect, useState, useMemo} from 'react';
import {Link} from 'react-router-dom';
import {Card} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Button} from '../components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {crmApi} from '../api';
import type {Client} from '../types';
import {Building, Mail, Phone, Plus, Eye, Calendar, Filter, Pencil, Trash2} from 'lucide-react';
import {LoaderSpinner} from '../components/common';
import {Textarea} from "@/components/ui/textarea.tsx";
import {formatClientLastActivity} from '../lib/date';
import {useToast} from '../hooks/use-toast';
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '../components/ui/alert-dialog';

export function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [industryFilter, setIndustryFilter] = useState<string>('all');
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        industry: '',
        notes: ''
    });
    const {toast} = useToast();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await crmApi.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await crmApi.createClient(formData);
            await fetchClients();
            setDialogOpen(false);
            setFormData({name: '', company: '', email: '', phone: '', industry: '', notes: ''});
            toast({
                title: 'Client created',
                description: 'The client has been successfully created.',
                duration: 10000
            });
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    const handleEditClick = (client: Client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name,
            company: client.company || '',
            email: client.email,
            phone: client.phone || '',
            industry: client.industry || '',
            notes: client.notes || ''
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        try {
            await crmApi.updateClient(selectedClient.id, formData);
            await fetchClients();
            setEditDialogOpen(false);
            setSelectedClient(null);
            setFormData({name: '', company: '', email: '', phone: '', industry: '', notes: ''});
            toast({
                title: 'Client updated',
                description: 'The client has been successfully updated.',
                duration: 10000
            });
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handleDeleteClick = (client: Client) => {
        setSelectedClient(client);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedClient) return;
        try {
            await crmApi.deleteClient(selectedClient.id);
            await fetchClients();
            setDeleteDialogOpen(false);
            setSelectedClient(null);
            toast({
                title: 'Client deleted',
                description: 'The client has been successfully deleted.',
                duration: 10000
            });
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const industries = useMemo(() => {
        const industrySet = new Set<string>();
        clients.forEach(client => {
            if (client.industry) {
                industrySet.add(client.industry);
            }
        });
        return Array.from(industrySet).sort();
    }, [clients]);

    const filteredClients = useMemo(() => {
        if (industryFilter === 'all') return clients;
        return clients.filter(client => client.industry === industryFilter);
    }, [clients, industryFilter]);

    if (loading) {
        return <LoaderSpinner message="Loading clients..."/>;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your client relationships</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Industries</SelectItem>
                            {industries.map(industry => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4"/>
                            Add Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Add New Client</DialogTitle>
                                <DialogDescription>
                                    Create a new client record. All fields except name and email are optional.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input
                                        id="industry"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Client</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                                    No clients found. Click "Add Client" to create your first client.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-semibold">
                                                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div className="font-medium">{client.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.company ? (
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground"/>
                                                <span className="text-sm text-foreground/80">{client.company}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start">
                                            {client.industry ? (
                                                <Badge variant="secondary">{client.industry}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-muted-foreground"/>
                                                {client.email}
                                            </div>
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-3 w-3"/>
                                                    {client.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-3 w-3"/>
                                            {formatClientLastActivity(client)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditClick(client)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteClick(client)}
                                                className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                            <Link to={`/clients/${client.id}`}>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
            </Card>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleEditSubmit}>
                        <DialogHeader>
                            <DialogTitle>Edit Client</DialogTitle>
                            <DialogDescription>
                                Update client information. All fields except name and email are optional.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-company">Company</Label>
                                <Input
                                    id="edit-company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-industry">Industry</Label>
                                <Input
                                    id="edit-industry"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea
                                    id="edit-notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedClient?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
