import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {Proposal} from "@/types.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcProposalTotal(p: Proposal): number {
    const items = p.pricingItems ?? [];

    return items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
    }, 0);
}

