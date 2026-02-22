# API Reference

The Reffo Beacon exposes a REST API on the configured port (default 3000). All request/response bodies use JSON.

## Refs

### List Refs

```
GET /refs
GET /refs?category=Vehicles&subcategory=Cars
GET /refs?search=guitar
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `subcategory` | string | Filter by subcategory |
| `search` | string | Full-text search in name/description |

**Response:** `Ref[]`

### Get Ref

```
GET /refs/:refId
```

**Response:** `Ref`

### Create Ref

```
POST /refs
Content-Type: application/json
```

**Body:**

```json
{
  "name": "2020 Toyota Camry XLE",
  "description": "One owner, clean title",
  "category": "Vehicles",
  "subcategory": "Cars",
  "listingStatus": "for_sale",
  "quantity": 1,
  "sku": "CAM-2020-XLE",
  "condition": "excellent",
  "attributes": {
    "year": 2020,
    "make": "Toyota",
    "model": "Camry",
    "mileage": 45000,
    "transmission": "automatic",
    "title_status": "clean"
  },
  "locationCity": "Orlando",
  "locationState": "FL",
  "locationZip": "32827",
  "locationLat": 28.42,
  "locationLng": -81.30,
  "sellingScope": "range",
  "sellingRadiusMiles": 100
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | yes | — | Display name |
| `description` | no | `""` | Description |
| `category` | no | `""` | Must be a valid taxonomy category |
| `subcategory` | no | `""` | Must be valid for the given category |
| `listingStatus` | no | `"private"` | `private`, `for_sale`, or `willing_to_sell` |
| `quantity` | no | `1` | Units available |
| `sku` | no | — | SKU or part number |
| `condition` | no | — | Category-appropriate condition |
| `attributes` | no | — | Category-specific attributes (JSON object) |
| `locationCity` | no | — | City override (uses beacon default if empty) |
| `locationState` | no | — | State override |
| `locationZip` | no | — | Zip override |
| `locationLat` | no | — | Latitude override |
| `locationLng` | no | — | Longitude override |
| `sellingScope` | no | — | `global`, `national`, or `range` |
| `sellingRadiusMiles` | no | — | Radius in miles (when scope = `range`) |

**Response:** `Ref` (201 Created)

### Update Ref

```
PATCH /refs/:refId
Content-Type: application/json
```

**Body:** Any subset of the create fields.

**Response:** `Ref`

### Delete Ref

```
DELETE /refs/:refId
```

**Response:** `204 No Content`

---

## Media

### List Media for Ref

```
GET /refs/:refId/media
```

**Response:** `RefMedia[]`

### Upload Media

```
POST /refs/:refId/media
Content-Type: multipart/form-data
```

Upload up to 4 photos and 1 video per ref. Use the `files` field name.

**Limits:**
- Photos: max 4, accepted types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Video: max 1, accepted types: `video/mp4`, `video/webm`, `video/quicktime`
- File size: 50MB per file

**Response:** `RefMedia[]` (201 Created)

### Delete Media

```
DELETE /refs/:refId/media/:mediaId
```

**Response:** `204 No Content`

---

## Offers

### List Offers

```
GET /offers
GET /offers?refId=abc123
```

**Response:** `Offer[]`

### Get Offer

```
GET /offers/:id
```

**Response:** `Offer`

### Create Offer

```
POST /offers
Content-Type: application/json
```

**Body:**

```json
{
  "refId": "abc123",
  "price": 18500,
  "priceCurrency": "USD"
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `refId` | yes | — | The ref being offered |
| `price` | yes | — | Price amount |
| `priceCurrency` | no | `"USD"` | ISO 4217 currency code |
| `status` | no | `"active"` | `active`, `sold`, or `withdrawn` |
| `location` | no | — | Available-at location text |

**Response:** `Offer` (201 Created)

### Update Offer

```
PATCH /offers/:id
Content-Type: application/json
```

**Response:** `Offer`

### Delete Offer

```
DELETE /offers/:id
```

**Response:** `204 No Content`

---

## Negotiations

### List Negotiations

```
GET /negotiations
GET /negotiations?role=buyer
GET /negotiations?role=seller
```

| Param | Description |
|-------|-------------|
| `role` | Filter by `buyer` (outgoing) or `seller` (incoming) |

**Response:** `Negotiation[]`

### Create Negotiation (Send Proposal)

```
POST /negotiations
Content-Type: application/json
```

**Body:**

```json
{
  "id": "unique-neg-id",
  "refId": "abc123",
  "refName": "2020 Toyota Camry",
  "buyerBeaconId": "buyer-beacon-pubkey",
  "sellerBeaconId": "seller-beacon-pubkey",
  "price": 17000,
  "priceCurrency": "USD",
  "message": "Would you take $17k?",
  "role": "buyer"
}
```

**Response:** `Negotiation` (201 Created)

### Respond to Negotiation

```
PATCH /negotiations/:id
Content-Type: application/json
```

**Body:**

```json
{
  "status": "accepted",
  "responseMessage": "Deal! Let's set up a time."
}
```

Or to counter:

```json
{
  "status": "countered",
  "counterPrice": 17500,
  "responseMessage": "Can you do $17,500?"
}
```

**Response:** `Negotiation`

---

## Settings

### Get Settings

```
GET /settings
```

**Response:** `BeaconSettings`

### Update Settings

```
PATCH /settings
Content-Type: application/json
```

**Body:** Any subset of `BeaconSettings` fields.

**Response:** `BeaconSettings`

---

## Health

```
GET /health
```

**Response:**

```json
{
  "id": "beacon-public-key",
  "version": "1.0.0",
  "refCount": 42,
  "offerCount": 15,
  "uptime": 3600,
  "dht": {
    "connected": true,
    "peers": 7
  }
}
```

---

## Taxonomy

```
GET /taxonomy
```

**Response:** `Record<string, string[]>` — Category names mapped to subcategory arrays.

---

## Peer Search

```
GET /search
```

Searches across all connected peer beacons via DHT.

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Keyword search |
| `c` | string | Category filter |
| `sc` | string | Subcategory filter |
| `maxPrice` | number | Maximum price |
| `lat` | number | Search center latitude |
| `lng` | number | Search center longitude |
| `radiusMiles` | number | Search radius in miles |

**Response:**

```json
[
  {
    "beaconId": "peer-beacon-pubkey",
    "refs": [
      {
        "id": "ref-id",
        "name": "Fender Stratocaster",
        "category": "Music",
        "subcategory": "Guitars",
        "listingStatus": "for_sale",
        "locationCity": "Orlando",
        "locationState": "FL"
      }
    ],
    "offers": [
      {
        "id": "offer-id",
        "refId": "ref-id",
        "price": 850,
        "priceCurrency": "USD",
        "status": "active"
      }
    ]
  }
]
```

---

## Sync Protocol

When sync is enabled, the beacon pushes data to the reffo.ai webapp via HTTP:

### Push Ref

```
PUT /api/sync/refs
Authorization: Bearer <api-key>
```

### Push Media

```
POST /api/sync/refs/:refId/media
Authorization: Bearer <api-key>
Content-Type: multipart/form-data
```

The sync manager periodically pushes all refs with `reffoSynced: true` and their media to the webapp.

---

## DHT Peer Message Format

Beacons communicate over Hyperswarm using JSON messages:

```typescript
interface PeerMessage {
  type: 'query' | 'response' | 'announce' | 'proposal' | 'proposal_response';
  beaconId: string;
  payload: unknown;
}
```

### Announce Payload

Sent when a beacon joins the topic or periodically:

```json
{
  "refs": [
    {
      "id": "ref-id",
      "name": "...",
      "category": "...",
      "subcategory": "...",
      "listingStatus": "for_sale",
      "locationLat": 28.42,
      "locationLng": -81.30,
      "locationCity": "Orlando",
      "locationState": "FL",
      "sellingScope": "range",
      "sellingRadiusMiles": 100
    }
  ],
  "offers": [
    { "id": "...", "refId": "...", "price": 850, "priceCurrency": "USD", "status": "active" }
  ]
}
```

Location coordinates are blurred to ~0.7 mile precision before transmission.

### Query Payload

```json
{
  "category": "Music",
  "subcategory": "Guitars",
  "search": "stratocaster",
  "maxPrice": 1000,
  "currency": "USD",
  "lat": 28.54,
  "lng": -81.38,
  "radiusMiles": 50
}
```

### Proposal Payload

```json
{
  "negotiationId": "neg-id",
  "refId": "ref-id",
  "refName": "Fender Stratocaster",
  "price": 750,
  "priceCurrency": "USD",
  "message": "Would you take $750?"
}
```

### Proposal Response Payload

```json
{
  "negotiationId": "neg-id",
  "status": "countered",
  "counterPrice": 800,
  "responseMessage": "How about $800?"
}
```

## Related

- [REF_DATA_MODEL.md](./REF_DATA_MODEL.md) — Ref base class and trait system
- [SCHEMA_GUIDE.md](./SCHEMA_GUIDE.md) — Schema.org foundation and JSON-LD format
- [ADDING_CATEGORIES.md](./ADDING_CATEGORIES.md) — How to add new category schemas
