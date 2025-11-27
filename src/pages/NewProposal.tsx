import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Textarea} from '../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../components/ui/select';
import {crmApi} from '../api';
import type {Client, Deal} from '../types';
import {ArrowLeft, Plus, Trash2, FileText} from 'lucide-react';
import {ProposalPreview} from "@/components/ui/proposal-preview.tsx";

interface PricingLine {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export function NewProposal() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
    const [formData, setFormData] = useState({
        client_id: '',
        deal_id: '',
        title: '',
        description: '',
    });
    const [pricingLines, setPricingLines] = useState<PricingLine[]>([
        {id: '1', description: '', quantity: 1, price: 0},
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [clientsData, dealsData] = await Promise.all([
                crmApi.getClients(),
                crmApi.getDeals(),
            ]);
            setClients(clientsData);
            setDeals(dealsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleClientChange = (clientId: string) => {
        setFormData({...formData, client_id: clientId, deal_id: ''});
        const clientDeals = deals.filter(d => d.client.id === clientId);
        setFilteredDeals(clientDeals);
    };

    const addPricingLine = () => {
        setPricingLines([
            ...pricingLines,
            {id: Date.now().toString(), description: '', quantity: 1, price: 0},
        ]);
    };

    const removePricingLine = (id: string) => {
        if (pricingLines.length > 1) {
            setPricingLines(pricingLines.filter(line => line.id !== id));
        }
    };

    const updatePricingLine = (id: string, field: keyof PricingLine, value: string | number) => {
        setPricingLines(pricingLines.map(line =>
            line.id === id ? {...line, [field]: value} : line
        ));
    };

    const calculateTotal = () => {
        return pricingLines.reduce((sum, line) => sum + (line.quantity * line.price), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const pricingItems = pricingLines.map(line => ({
                description: line.description,
                quantity: line.quantity,
                price: line.price,
            }));

            await crmApi.createProposal({
                dealId: formData.deal_id,
                title: formData.title,
                description: formData.description,
                pricingItems: pricingItems
            });
            navigate('/proposals');
        } catch (error) {
            console.error('Error creating proposal:', error);
        }
    };

    const totalValue = calculateTotal();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/proposals')}>
                    <ArrowLeft className="h-5 w-5"/>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Proposal</h1>
                    <p className="text-muted-foreground">Create a new sales proposal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Proposal Details</CardTitle>
                        <CardDescription>Basic information about the proposal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client *</Label>
                                <Select
                                    value={formData.client_id}
                                    onValueChange={handleClientChange}
                                    required
                                >
                                    <SelectTrigger id="client">
                                        <SelectValue placeholder="Select a client"/>
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

                            <div className="space-y-2">
                                <Label htmlFor="deal">Deal *</Label>
                                <Select
                                    value={formData.deal_id}
                                    onValueChange={(value) => setFormData({...formData, deal_id: value})}
                                    required
                                    disabled={!formData.client_id}
                                >
                                    <SelectTrigger id="deal">
                                        <SelectValue placeholder="Select a deal"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredDeals.map((deal) => (
                                            <SelectItem key={deal.id} value={deal.id}>
                                                {deal.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Proposal Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g., Q1 2024 Service Agreement"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Brief overview of the proposal..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Pricing Lines</CardTitle>
                                <CardDescription>Add items and pricing details</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addPricingLine}
                                    className="gap-2">
                                <Plus className="h-3 w-3"/>
                                Add Line
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pricingLines.map((line, index) => (
                            <div key={line.id} className="flex gap-3 items-start">
                                <div className="flex-1 grid gap-3 md:grid-cols-12">
                                    <div className="md:col-span-6 space-y-2">
                                        <Label htmlFor={`desc-${line.id}`}>Description</Label>
                                        <Input
                                            id={`desc-${line.id}`}
                                            value={line.description}
                                            onChange={(e) => updatePricingLine(line.id, 'description', e.target.value)}
                                            placeholder="Service or product description"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor={`qty-${line.id}`}>Quantity</Label>
                                        <Input
                                            id={`qty-${line.id}`}
                                            type="number"
                                            min="1"
                                            value={line.quantity}
                                            onChange={(e) => updatePricingLine(line.id, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label htmlFor={`price-${line.id}`}>Unit Price (EUR)</Label>
                                        <Input
                                            id={`price-${line.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={line.price}
                                            onChange={(e) => updatePricingLine(line.id, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 space-y-2">
                                        <Label>Total</Label>
                                        <div className="flex h-10 items-center font-semibold">
                                            €{(line.quantity * line.price).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                {pricingLines.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePricingLine(line.id)}
                                        className="mt-8"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                )}
                            </div>
                        ))}

                        <div className="border-t pt-4 flex justify-end">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground mb-1">Total Proposal Value</p>
                                <p className="text-3xl font-bold">€{totalValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>PDF Preview</CardTitle>
                        <CardDescription>Live preview of the proposal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProposalPreview
                            client={
                                formData.deal_id
                                    ? deals.find(c => c.id === formData.deal_id)?.client || null
                                    : null
                            }
                            proposalTitle={formData.title}
                            proposalDescription={formData.description}
                            pricingLines={pricingLines}
                        />
                    </CardContent>
                </Card>


                <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => navigate('/proposals')}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Proposal</Button>
                </div>
            </form>
        </div>
    );
}
