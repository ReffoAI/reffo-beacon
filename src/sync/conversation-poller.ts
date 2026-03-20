/**
 * ConversationPoller — Polls the Reffo webapp for new conversation messages
 * addressed to this beacon (buyer-role conversations). No API key required —
 * uses the public /api/network/conversations endpoint.
 */

import { ConversationQueries } from '../db/conversation-queries';
import type { ChatMessageType } from '@pelagora/pim-protocol';

const DEFAULT_WEBAPP_URL = 'https://reffo.ai';
const POLL_INTERVAL = 5 * 1000; // 5 seconds for near-realtime chat

interface ConversationMessageResponse {
  conversationId: string;
  messageId: string;
  refId: string;
  refName: string;
  senderBeaconId: string;
  buyerBeaconId: string;
  sellerBeaconId: string;
  messageType: string;
  content: string | null;
  amount: number | null;
  currency: string;
  createdAt: string;
}

export class ConversationPoller {
  private baseUrl: string;
  private beaconId: string;
  private conversations: ConversationQueries;
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastPollTime: string | null = null;

  constructor(beaconId: string, baseUrl?: string) {
    this.beaconId = beaconId;
    this.baseUrl = (baseUrl || DEFAULT_WEBAPP_URL).replace(/\/$/, '');
    this.conversations = new ConversationQueries();
  }

  start(): void {
    if (this.timer) return;

    // Initial poll
    this.pollAll().catch(() => {});

    console.log(`[ConversationPoller] Starting with ${POLL_INTERVAL / 1000}s interval`);
    const self = this;
    this.timer = setInterval(function pollTick() {
      console.log('[ConversationPoller] Polling...');
      self.pollAll().catch((err) => {
        console.error('[ConversationPoller] Interval error:', err instanceof Error ? err.message : err);
      });
    }, POLL_INTERVAL);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async pollAll(): Promise<{ received: number }> {
    let received = 0;

    try {
      const params = new URLSearchParams({ beaconId: this.beaconId });
      if (this.lastPollTime) {
        params.set('since', this.lastPollTime);
      }

      const res = await fetch(
        `${this.baseUrl}/api/network/conversations?${params.toString()}`
      );
      if (!res.ok) return { received };

      const data = await res.json() as { messages?: ConversationMessageResponse[] };
      const messages = data.messages || [];

      console.log(`[ConversationPoller] Got ${messages.length} message(s) from webapp`);
      for (const msg of messages) {
        try {
          // Skip messages we sent ourselves
          if (msg.senderBeaconId === this.beaconId) {
            console.log(`[ConversationPoller] Skipping self-sent message ${msg.messageId}`);
            continue;
          }

          // Determine our role: if we're the buyer, our counterpart is the seller
          const isBuyer = msg.buyerBeaconId === this.beaconId;
          const counterpartId = isBuyer ? msg.sellerBeaconId : msg.buyerBeaconId;
          const role = isBuyer ? 'buyer' : 'seller';

          // Ensure the conversation exists locally
          const conversation = this.conversations.getOrCreate(
            msg.refId,
            msg.refName,
            counterpartId,
            role,
          );

          // Check if we already have this message
          const existingMessages = this.conversations.getMessages(conversation.id);
          const alreadyExists = existingMessages.some(m => m.id === msg.messageId);
          if (alreadyExists) {
            console.log(`[ConversationPoller] Skipping existing message ${msg.messageId}`);
            continue;
          }

          // Add the message to the local conversation
          this.conversations.addMessage({
            id: msg.messageId,
            conversationId: conversation.id,
            senderBeaconId: msg.senderBeaconId,
            messageType: msg.messageType as ChatMessageType,
            content: msg.content || undefined,
            amount: msg.amount || undefined,
            currency: msg.currency || 'USD',
          });

          received++;
          console.log(
            `[ConversationPoller] Added message ${msg.messageId} to conversation ${conversation.id}`
          );
        } catch (innerErr) {
          console.error('[ConversationPoller] Message processing error:', innerErr instanceof Error ? innerErr.message : innerErr);
        }
      }

      // Update last poll timestamp
      this.lastPollTime = new Date().toISOString();
    } catch (err) {
      console.error('[ConversationPoller] Poll error:', err instanceof Error ? err.message : err);
    }

    if (received > 0) {
      console.log(`[ConversationPoller] Received ${received} new message(s)`);
    }

    return { received };
  }
}
