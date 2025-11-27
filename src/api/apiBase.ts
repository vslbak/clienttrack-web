import type {
    Client,
    Deal,
    Activity,
    Proposal,
    ClientData,
    DealData,
    ActivityData, ProposalData, ProposalStatus
} from '../types';

export interface CRMApi {

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client>;
  createClient(client: ClientData): Promise<Client>;
  updateClient(id: string, client: ClientData): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal>;
  createDeal(deal: DealData): Promise<Deal>;
  updateDeal(id: string, deal: Partial<DealData>): Promise<Deal>;

  getActivities(): Promise<Activity[]>;
  getActivity(id: string): Promise<Activity>;
  createActivity(activity: ActivityData): Promise<Activity>;
  completeActivity(id: string): Promise<void>;

  getProposals(): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal>;
  createProposal(proposal: ProposalData): Promise<Proposal>;
  updateProposalStatus(id: string, status: ProposalStatus): Promise<void>;
  downloadProposalPdf(id: string): Promise<void>;

}
