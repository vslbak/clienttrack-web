import { format } from 'date-fns';
import type { Client } from '../types';

export function formatClientLastActivity(
  client: Client,
  pattern = 'dd MMM yyyy'
): string {
  const timestamp = client.updatedAt || client.createdAt;
  if (!timestamp) return '—';

  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) return '—';

  return format(parsed, pattern);
}

