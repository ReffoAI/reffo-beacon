import { Router, Request, Response } from 'express';
import { ItemQueries, OfferQueries } from '../db';
import type { BeaconInfo } from '../types';

const router = Router();
const startTime = Date.now();

let beaconId = '';
let dhtStatus = { connected: false, peers: 0 };

export function setBeaconId(id: string): void {
  beaconId = id;
}

export function setDhtStatus(status: { connected: boolean; peers: number }): void {
  dhtStatus = status;
}

router.get('/', (_req: Request, res: Response) => {
  const items = new ItemQueries();
  const offers = new OfferQueries();

  const info: BeaconInfo = {
    id: beaconId,
    version: '0.1.0',
    itemCount: items.count(),
    offerCount: offers.countActive(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    dht: dhtStatus,
  };

  res.json(info);
});

export default router;
