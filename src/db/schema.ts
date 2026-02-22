import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.REFFO_DB_PATH || path.join(process.cwd(), 'reffo-beacon.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

/** For tests: initialize an in-memory database */
export function getTestDb(): Database.Database {
  const testDb = new Database(':memory:');
  testDb.pragma('foreign_keys = ON');
  initSchema(testDb);
  return testDb;
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS refs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      subcategory TEXT NOT NULL DEFAULT '',
      image TEXT,
      sku TEXT,
      listing_status TEXT NOT NULL DEFAULT 'private' CHECK(listing_status IN ('private', 'for_sale', 'willing_to_sell', 'archived_sold', 'archived_deleted')),
      quantity INTEGER NOT NULL DEFAULT 1,
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      location_city TEXT,
      location_state TEXT,
      location_zip TEXT,
      location_country TEXT,
      selling_scope TEXT DEFAULT 'global',
      selling_radius_miles INTEGER,
      attributes TEXT,
      condition TEXT,
      beacon_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration: add listing_status to existing databases
  const columns = database.pragma('table_info(refs)') as { name: string }[];
  if (!columns.some(c => c.name === 'listing_status')) {
    database.exec(`ALTER TABLE refs ADD COLUMN listing_status TEXT NOT NULL DEFAULT 'private' CHECK(listing_status IN ('private', 'for_sale', 'willing_to_sell'))`);
  }

  // Migration: add quantity to existing databases
  if (!columns.some(c => c.name === 'quantity')) {
    database.exec(`ALTER TABLE refs ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1`);
  }

  // Migration: add reffo_synced and reffo_ref_id to existing databases
  if (!columns.some(c => c.name === 'reffo_synced')) {
    database.exec(`ALTER TABLE refs ADD COLUMN reffo_synced INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.some(c => c.name === 'reffo_ref_id')) {
    database.exec(`ALTER TABLE refs ADD COLUMN reffo_ref_id TEXT`);
  }

  // Migration: add location and selling scope columns to existing refs
  if (!columns.some(c => c.name === 'location_lat')) {
    database.exec(`ALTER TABLE refs ADD COLUMN location_lat REAL`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_lng REAL`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_address TEXT`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_city TEXT`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_state TEXT`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_zip TEXT`);
    database.exec(`ALTER TABLE refs ADD COLUMN location_country TEXT`);
    database.exec(`ALTER TABLE refs ADD COLUMN selling_scope TEXT DEFAULT 'global'`);
    database.exec(`ALTER TABLE refs ADD COLUMN selling_radius_miles INTEGER`);
  }

  // Migration: add attributes and condition columns to existing refs
  if (!columns.some(c => c.name === 'attributes')) {
    database.exec(`ALTER TABLE refs ADD COLUMN attributes TEXT`);
  }
  if (!columns.some(c => c.name === 'condition')) {
    database.exec(`ALTER TABLE refs ADD COLUMN condition TEXT`);
  }

  // Migration: expand CHECK constraints for archived statuses on refs table
  const refsCheckInfo = database.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='refs'").get() as { sql: string } | undefined;
  if (refsCheckInfo && !refsCheckInfo.sql.includes('archived_sold')) {
    database.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN TRANSACTION;
      CREATE TABLE refs_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        subcategory TEXT NOT NULL DEFAULT '',
        image TEXT,
        sku TEXT,
        listing_status TEXT NOT NULL DEFAULT 'private' CHECK(listing_status IN ('private', 'for_sale', 'willing_to_sell', 'archived_sold', 'archived_deleted')),
        quantity INTEGER NOT NULL DEFAULT 1,
        reffo_synced INTEGER NOT NULL DEFAULT 0,
        reffo_ref_id TEXT,
        location_lat REAL,
        location_lng REAL,
        location_address TEXT,
        location_city TEXT,
        location_state TEXT,
        location_zip TEXT,
        location_country TEXT,
        selling_scope TEXT DEFAULT 'global',
        selling_radius_miles INTEGER,
        attributes TEXT,
        condition TEXT,
        beacon_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO refs_new SELECT id, name, description, category, subcategory, image, sku, listing_status, quantity, reffo_synced, reffo_ref_id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'global', NULL, NULL, NULL, beacon_id, created_at, updated_at FROM refs;
      DROP TABLE refs;
      ALTER TABLE refs_new RENAME TO refs;
      CREATE INDEX IF NOT EXISTS idx_refs_category ON refs(category);
      CREATE INDEX IF NOT EXISTS idx_refs_cat_subcat ON refs(category, subcategory);
      CREATE INDEX IF NOT EXISTS idx_refs_beacon ON refs(beacon_id);
      CREATE INDEX IF NOT EXISTS idx_refs_listing_status ON refs(listing_status);
      COMMIT;
      PRAGMA foreign_keys = ON;
    `);
  }

  // Migration: expand CHECK constraints for 'sold' status on negotiations table
  // Also renames item_id→ref_id and item_name→ref_name
  const negCheckInfo = database.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='negotiations'").get() as { sql: string } | undefined;
  if (negCheckInfo && !negCheckInfo.sql.includes("'sold'")) {
    database.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN TRANSACTION;
      CREATE TABLE negotiations_new (
        id TEXT PRIMARY KEY,
        ref_id TEXT NOT NULL,
        ref_name TEXT NOT NULL DEFAULT '',
        buyer_beacon_id TEXT NOT NULL,
        seller_beacon_id TEXT NOT NULL,
        price REAL NOT NULL,
        price_currency TEXT NOT NULL DEFAULT 'USD',
        message TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK(status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'sold')),
        role TEXT NOT NULL CHECK(role IN ('buyer', 'seller')),
        counter_price REAL,
        response_message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO negotiations_new (id, ref_id, ref_name, buyer_beacon_id, seller_beacon_id, price, price_currency, message, status, role, counter_price, response_message, created_at, updated_at)
        SELECT id, item_id, item_name, buyer_beacon_id, seller_beacon_id, price, price_currency, message, status, role, counter_price, response_message, created_at, updated_at FROM negotiations;
      DROP TABLE negotiations;
      ALTER TABLE negotiations_new RENAME TO negotiations;
      CREATE INDEX IF NOT EXISTS idx_negotiations_role ON negotiations(role);
      CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
      CREATE INDEX IF NOT EXISTS idx_negotiations_ref ON negotiations(ref_id);
      COMMIT;
      PRAGMA foreign_keys = ON;
    `);
  }

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_refs_category ON refs(category);
    CREATE INDEX IF NOT EXISTS idx_refs_cat_subcat ON refs(category, subcategory);
    CREATE INDEX IF NOT EXISTS idx_refs_beacon ON refs(beacon_id);
    CREATE INDEX IF NOT EXISTS idx_refs_listing_status ON refs(listing_status);

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      ref_id TEXT NOT NULL REFERENCES refs(id) ON DELETE CASCADE,
      price REAL NOT NULL,
      price_currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'sold', 'withdrawn')),
      seller_id TEXT NOT NULL,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_offers_ref ON offers(ref_id);
    CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
    CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);

    CREATE TABLE IF NOT EXISTS ref_media (
      id TEXT PRIMARY KEY,
      ref_id TEXT NOT NULL REFERENCES refs(id) ON DELETE CASCADE,
      media_type TEXT NOT NULL CHECK(media_type IN ('photo', 'video')),
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_ref_media_ref ON ref_media(ref_id);
    CREATE INDEX IF NOT EXISTS idx_ref_media_type ON ref_media(ref_id, media_type);

    CREATE TABLE IF NOT EXISTS negotiations (
      id TEXT PRIMARY KEY,
      ref_id TEXT NOT NULL,
      ref_name TEXT NOT NULL DEFAULT '',
      buyer_beacon_id TEXT NOT NULL,
      seller_beacon_id TEXT NOT NULL,
      price REAL NOT NULL,
      price_currency TEXT NOT NULL DEFAULT 'USD',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'sold')),
      role TEXT NOT NULL CHECK(role IN ('buyer', 'seller')),
      counter_price REAL,
      response_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_negotiations_role ON negotiations(role);
    CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);
    CREATE INDEX IF NOT EXISTS idx_negotiations_ref ON negotiations(ref_id);

    CREATE TABLE IF NOT EXISTS beacon_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      location_city TEXT,
      location_state TEXT,
      location_zip TEXT,
      location_country TEXT DEFAULT 'US',
      default_selling_scope TEXT NOT NULL DEFAULT 'global'
        CHECK(default_selling_scope IN ('global','national','range')),
      default_selling_radius_miles INTEGER NOT NULL DEFAULT 250,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}
