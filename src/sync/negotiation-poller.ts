/**
 * NegotiationPoller — Polls the Reffo webapp for status updates on
 * outgoing (buyer-role) negotiations. No API key required — uses the
 * public /api/network/offers/:id endpoint.
 */

import { NegotiationQueries } from '../db';
import type { NegotiationStatus } from '@pelagora/pim-protocol';

const DEFAULT_WEBAPP_URL = 'https://reffo.ai';
const POLL_INTERVAL = 60 * 1000; // 1 minute

interface OfferStatusResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  counterAmount?: number;
  responseMessage?: string;
  updatedAt: string;
}

export class NegotiationPoller {
  private baseUrl: string;
  private negotiations: NegotiationQueries;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || DEFAULT_WEBAPP_URL).replace(/\/$/, '');
    this.negotiations = new NegotiationQueries();
  }

  start(): void {
    if (this.timer) return;

    // Initial poll
    this.pollAll().catch(() => {});

    this.timer = setInterval(() => {
      this.pollAll().catch(() => {});
    }, POLL_INTERVAL);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pollAll(): Promise<{ updated: number }> {
    // Get all outgoing (buyer-role) negotiations that are still pending
    const outgoing = this.negotiations.listOutgoing();
    let updated = 0;

    for (const neg of outgoing) {
      try {
        const res = await fetch(`${this.baseUrl}/api/network/offers/${neg.id}`);
        if (!res.ok) continue;

        const data = await res.json() as OfferStatusResponse;

        // Only update if the remote status has changed
        if (data.status !== neg.status) {
          const validStatuses: NegotiationStatus[] = ['pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'sold'];
          if (validStatuses.includes(data.status as NegotiationStatus)) {
            this.negotiations.updateStatus(
              neg.id,
              data.status as NegotiationStatus,
              data.counterAmount,
              data.responseMessage,
            );
            updated++;
            console.log(`[NegotiationPoller] Updated ${neg.id}: ${neg.status} → ${data.status}`);
          }
        }
      } catch {
        // Network error — skip this one
      }
    }

    return { updated };
  }
}
