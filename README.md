# reffo-beacon

Self-hosted beacon server for the Reffo decentralized commerce protocol.

Beacons store inventory locally in SQLite and announce to a Hyperswarm DHT so other beacons can discover and query your listings without any central server. Data is structured using [Schema.org](https://schema.org) types for universal compatibility with search engines, LLMs, and third-party platforms.

## Quick Start

```bash
npm install
npm run build
npm start
```

The beacon runs on `http://localhost:3000` by default. Open it in a browser to use the web UI.

For development with auto-reload:
```bash
npm run dev
```

## Web UI

Navigate to `http://localhost:3000` in your browser. The built-in UI lets you:

- **List a Ref** — fill in name, category/subcategory, category-specific attributes, price and click submit
- **My Refs** — see all your inventory with prices, condition badges, and attribute summaries
- **Search Network** — search across connected peer beacons by keyword, category, or max price

## Data Model

Every listing is a **Ref** — the universal base unit in Reffo. Refs support category-specific attributes (car fields for cars, house fields for houses, etc.) with Schema.org compatibility.

Key concepts:
- **Category Schemas**: Each category defines typed fields, condition options, and Schema.org mappings
- **Trait System**: Refs compose behavior through traits (Priceable, Conditional, Valueable, Serialized, LocationBound, etc.)
- **Schema.org JSON-LD**: Attributes transform into standard Schema.org structured data when synced

See the [Data Model documentation](./docs/REF_DATA_MODEL.md) for full details.

## API

Full API documentation: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)

### Refs
```
GET    /refs                   # List all (or ?category=X&subcategory=Y or ?search=X)
GET    /refs/:id               # Get one
POST   /refs                   # Create { name, description?, category?, subcategory?, condition?, attributes?, ... }
PATCH  /refs/:id               # Update fields
DELETE /refs/:id               # Remove
```

### Media
```
GET    /refs/:refId/media      # List media for a ref
POST   /refs/:refId/media      # Upload photos/video (multipart)
DELETE /refs/:refId/media/:id  # Delete one
```

### Offers
```
GET    /offers                 # List all (or ?refId=X)
GET    /offers/:id             # Get one
POST   /offers                 # Create { refId, price, priceCurrency?, status?, location? }
PATCH  /offers/:id             # Update fields
DELETE /offers/:id             # Remove
```

### Negotiations
```
GET    /negotiations           # List all (or ?role=buyer|seller)
POST   /negotiations           # Send proposal
PATCH  /negotiations/:id       # Respond (accept/reject/counter)
```

### Peer Search
```
GET /search?q=guitar           # Search across all connected beacons
GET /search?c=Electronics&sc=Gaming&maxPrice=100
GET /search?lat=28.5&lng=-81.3&radiusMiles=50
```

| Param | Description |
|---|---|
| `q` | Keyword search |
| `c` | Category filter |
| `sc` | Subcategory filter |
| `maxPrice` | Maximum price |
| `lat` | Search center latitude |
| `lng` | Search center longitude |
| `radiusMiles` | Search radius in miles |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `BEACON_ID` | random | 64-char hex beacon identity |
| `REFFO_DB_PATH` | `./reffo-beacon.db` | SQLite database path |

## Docker

```bash
docker build -t reffo-beacon .
docker run -p 3000:3000 -v reffo-data:/app reffo-beacon
```

## How It Works

1. You list refs and create offers via the web UI or REST API
2. Your beacon joins the Reffo DHT topic via Hyperswarm
3. Other beacons connect as peers and exchange announcements
4. When someone searches (`GET /search`), your beacon queries all connected peers
5. Peers respond with matching refs and offers from their local databases
6. When synced to reffo.ai, attributes are transformed to Schema.org JSON-LD

No central server required. Each beacon is a fully independent node.

## Contributing

Reffo's category system is designed to be community-extensible. To add a new category schema:

1. Define the Schema.org type mapping and form fields in `src/ref-schemas.ts`
2. Register it in the `CATEGORY_SCHEMAS` map
3. See [docs/ADDING_CATEGORIES.md](./docs/ADDING_CATEGORIES.md) for the complete guide

## Documentation

- [Data Model](./docs/REF_DATA_MODEL.md) — Ref base class, traits, and privacy tiers
- [Schema.org Guide](./docs/SCHEMA_GUIDE.md) — How Refs map to Schema.org JSON-LD
- [Adding Categories](./docs/ADDING_CATEGORIES.md) — Step-by-step guide for new category schemas
- [API Reference](./docs/API_REFERENCE.md) — Complete REST API documentation

## Testing

```bash
npm test
```
