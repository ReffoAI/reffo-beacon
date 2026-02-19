import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

function getEnvPath(): string {
  return path.join(process.cwd(), '.env');
}

function readEnvFile(): Record<string, string> {
  const envPath = getEnvPath();
  const vars: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return vars;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

function writeEnvVar(key: string, value: string): void {
  const envPath = getEnvPath();
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
  }

  const lines = content.split('\n');
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }
  if (!found) {
    lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(envPath, lines.join('\n'));
}

function removeEnvVar(key: string): void {
  const envPath = getEnvPath();
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n').filter(line => !line.trim().startsWith(`${key}=`));
  fs.writeFileSync(envPath, lines.join('\n'));
}

// GET /settings — Return current settings
router.get('/', (_req: Request, res: Response) => {
  const envVars = readEnvFile();
  const apiKey = process.env.REFFO_API_KEY || envVars['REFFO_API_KEY'] || '';

  const syncManager = _req.app.get('syncManager');
  const syncedCount = syncManager ? (() => {
    try {
      const { ItemQueries } = require('../db/queries');
      const items = new ItemQueries();
      return items.listSynced().length;
    } catch {
      return 0;
    }
  })() : 0;

  res.json({
    apiKey: apiKey ? `${apiKey.slice(0, 12)}...` : '',
    hasApiKey: !!apiKey,
    connected: !!syncManager,
    syncedItemCount: syncedCount,
    beaconId: _req.app.get('beaconId') || '',
    version: '0.1.0',
    uptime: Math.floor((Date.now() - (_req.app.get('startTime') || Date.now())) / 1000),
  });
});

// POST /settings/api-key — Save API key and initialize sync
router.post('/api-key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API key is required' });
  }

  if (!apiKey.startsWith('rfk_')) {
    return res.status(400).json({ error: 'Invalid API key format. Keys start with rfk_' });
  }

  // Test the connection
  const { SyncManager } = require('../sync');
  const beaconId = req.app.get('beaconId');
  const reffoUrl = process.env.REFFO_API_URL || 'https://reffo.ai';
  const manager = new SyncManager(apiKey, beaconId, reffoUrl);

  const test = await manager.testConnection();
  if (!test.ok) {
    return res.status(400).json({ error: `Connection failed: ${test.error}` });
  }

  // Save to .env
  writeEnvVar('REFFO_API_KEY', apiKey);
  process.env.REFFO_API_KEY = apiKey;

  // Register beacon
  const beaconUrl = process.env.BEACON_URL || `http://localhost:${process.env.PORT || 3000}`;
  await manager.registerBeacon('Reffo Beacon', '0.1.0', beaconUrl);

  // Start heartbeat
  manager.startHeartbeat();
  req.app.set('syncManager', manager);

  res.json({ ok: true, message: 'API key saved and connection established' });
});

// DELETE /settings/api-key — Remove API key
router.delete('/api-key', (_req: Request, res: Response) => {
  const syncManager = _req.app.get('syncManager');
  if (syncManager) {
    syncManager.stopHeartbeat();
    _req.app.set('syncManager', null);
  }

  removeEnvVar('REFFO_API_KEY');
  delete process.env.REFFO_API_KEY;

  res.json({ ok: true, message: 'API key removed' });
});

// POST /settings/sync-item/:id — Toggle sync for an item
router.post('/sync-item/:id', async (req: Request, res: Response) => {
  const syncManager = req.app.get('syncManager');
  if (!syncManager) {
    return res.status(400).json({ error: 'Reffo.ai is not connected. Set an API key first.' });
  }

  const { id } = req.params;
  const { sync } = req.body;

  if (sync) {
    const result = await syncManager.syncItem(id);
    if (!result.ok) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ ok: true, synced: true });
  } else {
    const result = await syncManager.unsyncItem(id);
    if (!result.ok) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ ok: true, synced: false });
  }
});

export default router;
