# Schema.org Guide

Reffo uses [Schema.org](https://schema.org) as the foundation for structured data, ensuring Refs are universally understood by search engines, AI models, and third-party platforms.

## Why Schema.org?

- **Universal vocabulary**: Thousands of types and properties maintained by Google, Microsoft, Yahoo, and Yandex
- **SEO-ready**: Search engines natively understand Schema.org JSON-LD
- **LLM-friendly**: AI models are trained on Schema.org-structured data
- **Extensible**: Custom properties use the `reffo:` namespace prefix

## How It Works

1. A beacon stores Refs with flat `attributes` (a JSON object) and a `condition` string
2. When synced to reffo.ai, the `buildSchemaOrgLD()` function transforms attributes into Schema.org JSON-LD
3. The JSON-LD is stored in the webapp's `schema_data` JSONB column
4. The `ref_type` column stores the Schema.org type name (e.g., "Car", "VisualArtwork")

## Category → Schema.org Type Mapping

| Category | Subcategory | Schema.org Type | Additional Type |
|----------|-------------|-----------------|-----------------|
| Vehicles | Cars | `Car` | — |
| Vehicles | Boats | `Vehicle` | `Boat` |
| Housing | * | `SingleFamilyResidence` | — |
| Housing | Condos | `Apartment` | — |
| Electronics | Phones & Tablets | `IndividualProduct` | `Smartphone` |
| Home & Garden | Furniture | `Product` | `Furniture` |
| Collectibles | Art | `VisualArtwork` | — |
| Other | Services | `Offer` | `FoodEstablishment` |
| *(default)* | * | `Product` | — |

## The `schema_data` JSON-LD Format

The `schema_data` column stores a JSON-LD object. Here are examples for each supported category:

### Car

```json
{
  "@type": "Car",
  "name": "2020 Toyota Camry XLE",
  "description": "One owner, dealer maintained",
  "vehicleModelDate": "2020",
  "brand": { "@type": "Brand", "name": "Toyota" },
  "model": "Camry",
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": 45000,
    "unitCode": "SMI"
  },
  "vehicleTransmission": "automatic",
  "bodyType": "sedan",
  "vehicleIdentificationNumber": "1HGCM82633A004352",
  "knownVehicleDamages": "0",
  "reffo:condition": "excellent",
  "offers": {
    "@type": "Offer",
    "price": 18500,
    "priceCurrency": "USD"
  }
}
```

### Boat

```json
{
  "@type": "Vehicle",
  "additionalType": "Boat",
  "name": "2018 Boston Whaler Montauk 170",
  "productionDate": "2018",
  "brand": { "@type": "Brand", "name": "Boston Whaler" },
  "model": "Montauk 170",
  "bodyType": "center_console",
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": 350,
    "unitText": "hours"
  },
  "fuelType": "gasoline",
  "reffo:condition": "good",
  "offers": {
    "@type": "Offer",
    "price": 28000,
    "priceCurrency": "USD"
  }
}
```

### Housing

```json
{
  "@type": "SingleFamilyResidence",
  "name": "3BR/2BA Ranch in Lake Nona",
  "accommodationCategory": "single_family",
  "numberOfBedrooms": 3,
  "numberOfBathroomsTotal": 2,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": 1800,
    "unitCode": "FTK"
  },
  "yearBuilt": "1995",
  "reffo:condition": "move_in_ready",
  "offers": {
    "@type": "Offer",
    "price": 425000,
    "priceCurrency": "USD"
  }
}
```

### Phone / Tablet

```json
{
  "@type": "IndividualProduct",
  "additionalType": "Smartphone",
  "name": "iPhone 15 Pro 256GB",
  "brand": { "@type": "Brand", "name": "Apple" },
  "model": "iPhone 15 Pro",
  "color": "Space Black",
  "serialNumber": "352483091234567",
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "storageGB", "value": 256 },
    { "@type": "PropertyValue", "name": "network", "value": "5G" },
    { "@type": "PropertyValue", "name": "carrierLocked", "value": "unlocked" },
    { "@type": "PropertyValue", "name": "batteryHealth", "value": 92, "unitText": "%" }
  ],
  "reffo:condition": "excellent",
  "offers": {
    "@type": "Offer",
    "price": 899,
    "priceCurrency": "USD"
  }
}
```

### Furniture

```json
{
  "@type": "Product",
  "additionalType": "Furniture",
  "name": "West Elm Mid-Century Sofa",
  "material": "fabric",
  "color": "Charcoal",
  "width": { "@type": "QuantitativeValue", "value": 84, "unitCode": "INH" },
  "depth": { "@type": "QuantitativeValue", "value": 38, "unitCode": "INH" },
  "height": { "@type": "QuantitativeValue", "value": 34, "unitCode": "INH" },
  "reffo:condition": "good",
  "offers": {
    "@type": "Offer",
    "price": 650,
    "priceCurrency": "USD"
  }
}
```

### Art

```json
{
  "@type": "VisualArtwork",
  "name": "Sunset Over the Bay",
  "artist": { "@type": "Person", "name": "Jane Rivera" },
  "artMedium": "oil",
  "dateCreated": "2023",
  "artEdition": "3/50",
  "reffo:condition": "excellent",
  "offers": {
    "@type": "Offer",
    "price": 2400,
    "priceCurrency": "USD"
  }
}
```

### Dining Service

```json
{
  "@type": "Offer",
  "name": "$50 Gift Card - Joe's Bistro",
  "offeredBy": {
    "@type": "FoodEstablishment",
    "name": "Joe's Bistro",
    "servesCuisine": "Italian"
  },
  "validThrough": "2025-12-31",
  "offers": {
    "@type": "Offer",
    "price": 35,
    "priceCurrency": "USD"
  }
}
```

## Reffo Extensions

Properties prefixed with `reffo:` are Reffo-specific extensions not part of the Schema.org vocabulary:

| Property | Type | Description |
|----------|------|-------------|
| `reffo:condition` | string | Category-appropriate condition value |

These extensions allow Reffo to carry information that doesn't have a direct Schema.org equivalent while keeping the JSON-LD valid.

## Flat Attributes → JSON-LD Transform

The beacon stores attributes as a flat key-value object:

```json
{
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "mileage": 45000,
  "transmission": "automatic",
  "title_status": "clean"
}
```

The `buildSchemaOrg()` method on each `CategorySchema` transforms this into the nested JSON-LD structure shown above. The `buildSchemaOrgLD()` wrapper adds base fields (name, description, price, condition).

## Unit Codes

Schema.org uses [UN/CEFACT](https://www.unece.org/cefact) unit codes:

| Code | Meaning | Used for |
|------|---------|----------|
| `SMI` | Statute mile | Vehicle mileage |
| `FTK` | Square foot | Floor area |
| `INH` | Inch | Furniture dimensions |

## Related

- [REF_DATA_MODEL.md](./REF_DATA_MODEL.md) — Ref base class and trait system
- [ADDING_CATEGORIES.md](./ADDING_CATEGORIES.md) — How to add new category schemas
- [API_REFERENCE.md](./API_REFERENCE.md) — REST API endpoints
