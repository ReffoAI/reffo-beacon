/**
 * SyncManager: orchestrates syncing beacon items to Reffo.ai
 */

import { ReffoClient } from './reffo-client';
import { ItemQueries, OfferQueries, MediaQueries } from '../db/queries';

export class SyncManager {
  private client: ReffoClient;
  private beaconId: string;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private items: ItemQueries;
  private offers: OfferQueries;
  private media: MediaQueries;

  constructor(apiKey: string, beaconId: string, baseUrl?: string) {
    this.client = new ReffoClient(apiKey, baseUrl);
    this.beaconId = beaconId;
    this.items = new ItemQueries();
    this.offers = new OfferQueries();
    this.media = new MediaQueries();
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    return this.client.testConnection();
  }

  async registerBeacon(name: string, version: string, url?: string): Promise<{ ok: boolean; error?: string }> {
    const result = await this.client.registerBeacon(this.beaconId, name, version, url);
    return { ok: result.ok, error: result.error };
  }

  async syncItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
    const item = this.items.get(itemId);
    if (!item) return { ok: false, error: 'Item not found' };

    const offers = this.offers.list(itemId);
    const result = await this.client.pushItem(this.beaconId, item, offers);

    if (result.ok) {
      this.items.setSynced(itemId, true, result.refId);

      // Push media
      const mediaList = this.media.listForItem(itemId);
      for (const m of mediaList) {
        const mediaResult = await this.client.pushMedia(itemId, m);
        if (!mediaResult.ok) {
          console.warn(`[Sync] Media push failed for ${m.id}: ${mediaResult.error}`);
        }
      }
    }

    return { ok: result.ok, error: result.error };
  }

  async unsyncItem(itemId: string): Promise<{ ok: boolean; error?: string }> {
    const item = this.items.get(itemId);
    if (!item) return { ok: false, error: 'Item not found' };

    const result = await this.client.removeItem(itemId, this.beaconId);

    if (result.ok) {
      this.items.setSynced(itemId, false);
    }

    return { ok: result.ok, error: result.error };
  }

  async syncAll(): Promise<{ synced: number; errors: string[] }> {
    const syncedItems = this.items.listSynced();
    let synced = 0;
    const errors: string[] = [];

    for (const item of syncedItems) {
      const result = await this.syncItem(item.id);
      if (result.ok) {
        synced++;
      } else {
        errors.push(`${item.name}: ${result.error}`);
      }
    }

    return { synced, errors };
  }

  startHeartbeat(intervalMs = 5 * 60 * 1000): void {
    if (this.heartbeatInterval) return;

    // Initial heartbeat
    this.client.heartbeat(this.beaconId).catch(() => {});

    this.heartbeatInterval = setInterval(() => {
      this.client.heartbeat(this.beaconId).catch((err) => {
        console.warn('[Sync] Heartbeat failed:', err.message);
      });
    }, intervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
