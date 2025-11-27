export type DealStage = 'LEAD' | 'DISCOVERY' | 'PROPOSAL' | 'CLOSED' | 'LOST';


export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';

export type ProposalStatus = 'PREPARED' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientData {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    industry?: string;
    notes?: string;
}

export interface Deal {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate?: string;
    createdAt: string;
    updatedAt: string;
    client: Client;
}

export interface DealData {
    clientId: string;
    title: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate?: string;
}


export interface ActivityData {
    type: ActivityType;
    title: string;
    description: string;
    dealId: string;
}

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    deal: Deal;
}

export interface ProposalData {
    dealId: string;
    title: string;
    description: string;
    pricingItems: PricingItem[];
}

export interface Proposal {
    id: string;
    deal: Deal;
    title: string;
    description: string;
    pricingItems: PricingItem[];
    status: ProposalStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PricingItem {
    description: string;
    quantity: number;
    price: number;
}

