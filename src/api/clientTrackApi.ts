import type {CRMApi} from './apiBase';
import type {
    Client,
    Deal,
    Activity,
    Proposal,
    ClientData,
    DealData,
    ActivityData, ProposalData, ProposalStatus
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`System Error: ${response.status} - ${error}`);
    }
    return response.json();
}

export const ClientTrackApi: CRMApi = {
    async getClients(): Promise<Client[]> {
        const response = await fetch(`${BASE_URL}/clients`);
        return handleResponse<Client[]>(response);
    },

    async getClient(id: string): Promise<Client> {
        const response = await fetch(`${BASE_URL}/clients/${id}`);
        return handleResponse<Client>(response);
    },

    async createClient(client: ClientData): Promise<Client> {
        const response = await fetch(`${BASE_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(client),
        });
        return handleResponse<Client>(response);
    },

    async updateClient(id: string, client: ClientData): Promise<Client> {
        const response = await fetch(`${BASE_URL}/clients/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(client),
        });
        return handleResponse<Client>(response);
    },

    async deleteClient(id: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/clients/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }
    },

    async getDeals(): Promise<Deal[]> {
        const response = await fetch(`${BASE_URL}/deals`);
        return handleResponse<Deal[]>(response);
    },

    async getDeal(id: string): Promise<Deal> {
        const response = await fetch(`${BASE_URL}/deals/${id}`);
        return handleResponse<Deal>(response);
    },

    async createDeal(deal: DealData): Promise<Deal> {
        const response = await fetch(`${BASE_URL}/deals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deal),
        });
        return handleResponse<Deal>(response);
    },

    async updateDeal(id: string, deal: Partial<DealData>): Promise<Deal> {
        const response = await fetch(`${BASE_URL}/deals/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deal),
        });
        return handleResponse<Deal>(response);
    },

    async getActivities(): Promise<Activity[]> {
        const response = await fetch(`${BASE_URL}/activities`);
        return handleResponse<Activity[]>(response);
    },

    async getActivity(id: string): Promise<Activity> {
        const response = await fetch(`${BASE_URL}/activities/${id}`);
        return handleResponse<Activity>(response);
    },

    async createActivity(activity: ActivityData): Promise<Activity> {
        const response = await fetch(`${BASE_URL}/activities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activity),
        });
        return handleResponse<Activity>(response);
    },

    async completeActivity(id: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/activities/${id}/complete`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }
    },

    async getProposals(): Promise<Proposal[]> {
        const response = await fetch(`${BASE_URL}/proposals`);
        return handleResponse<Proposal[]>(response);
    },

    async getProposal(id: string): Promise<Proposal> {
        const response = await fetch(`${BASE_URL}/proposals/${id}`);
        return handleResponse<Proposal>(response);
    },

    async createProposal(proposal: ProposalData): Promise<Proposal> {
        const response = await fetch(`${BASE_URL}/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proposal),
        });
        return handleResponse<Proposal>(response);
    },

    async updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
        const response = await fetch(`${BASE_URL}/proposals/${id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(status),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }
    },

    async downloadProposalPdf(id: string) {
        const res = await fetch(`${BASE_URL}/proposals/${id}/pdf`, {
            method: "GET",
        });

        if (!res.ok) throw new Error("Failed to download PDF");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `proposal-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

};
