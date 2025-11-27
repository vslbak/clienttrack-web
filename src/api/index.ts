import type { CRMApi } from './apiBase';
import {ClientTrackApi} from "@/api/clientTrackApi.ts";

export const crmApi: CRMApi = ClientTrackApi;

export * from './apiBase';
