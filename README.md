# reffo-beacon

Self-hosted beacon server for the Reffo decentralized commerce protocol.

Beacons store inventory locally in SQLite and announce to a Hyperswarm DHT so other beacons can discover and query your listings without any central server.

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

- **List an Item** — fill in name, category/subcategory, price and click submit
- **My Items** — see all your inventory with prices
- **Search Network** — search across connected peer beacons by keyword, category, or max price

## API

### Health
```
GET /health
```
Returns beacon status, item/offer counts, DHT peer count.

### Taxonomy
```
GET /taxonomy
```
Returns the category/subcategory taxonomy as JSON. Categories: Electronics, Music, Home & Garden, Clothing, Sports, Books & Media, Vehicles, Collectibles, Other.

### Items
```
GET    /items                  # List all (or ?category=X&subcategory=Y or ?search=X)
GET    /items/:id              # Get one
POST   /items                  # Create { name, description?, category?, subcategory?, image?, sku? }
PATCH  /items/:id              # Update fields
DELETE /items/:id              # Remove
```

Category and subcategory are validated against the taxonomy on create/update. Pass both `category` and `subcategory` for full classification.

### Offers
```
GET    /offers                 # List all (or ?itemId=X)
GET    /offers/:id             # Get one
POST   /offers                 # Create { itemId, price, priceCurrency?, status?, location? }
PATCH  /offers/:id             # Update fields
DELETE /offers/:id             # Remove
```

### Peer Search
```
GET /search?q=guitar           # Search across all connected beacons
GET /search?c=Electronics&sc=Gaming&maxPrice=100
```

| Param | Description |
|---|---|
| `q` | Keyword search |
| `c` | Category filter |
| `sc` | Subcategory filter |
| `maxPrice` | Maximum price |

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

1. You list items and create offers via the web UI or REST API
2. Your beacon joins the Reffo DHT topic via Hyperswarm
3. Other beacons connect as peers and exchange announcements
4. When someone searches (`GET /search`), your beacon queries all connected peers
5. Peers respond with matching items and offers from their local databases

No central server required. Each beacon is a fully independent node.

## Testing

```bash
npm test
```
