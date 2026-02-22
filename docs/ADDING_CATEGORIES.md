# Adding New Category Schemas

This guide walks through adding a new category schema to Reffo. Category schemas define the specific fields, condition options, and Schema.org mappings for a product type.

## Overview

Category schemas live in `src/ref-schemas.ts` (beacon) and `src/lib/ref-schemas.ts` (webapp). Each schema defines:

- **schemaOrgType**: The Schema.org type name
- **traits**: Capability labels (Priceable, Conditional, etc.)
- **conditionOptions**: Valid condition values for this category
- **attributes**: Form field definitions with Schema.org property mappings
- **buildSchemaOrg()**: Transform function from flat attributes to JSON-LD

## Step 1: Find the Right Schema.org Type

Browse [schema.org/docs/full.html](https://schema.org/docs/full.html) to find the best matching type. Common useful types:

| Schema.org Type | Good for |
|----------------|----------|
| `Product` | General physical goods |
| `Car` | Cars specifically |
| `Vehicle` | Boats, motorcycles, RVs |
| `SingleFamilyResidence` | Houses, townhomes |
| `Apartment` | Condos, apartments |
| `IndividualProduct` | Specific product units (phones, electronics) |
| `VisualArtwork` | Art, prints, photography |
| `MusicRecording` | Music/audio |
| `Book` | Books |
| `SportsEvent` | Tickets, events |
| `Offer` | Services, vouchers, gift cards |

If no specific type exists, use `Product` with an `additionalType` string.

## Step 2: Define the Schema

Create a new `CategorySchema` constant in `src/ref-schemas.ts`:

```typescript
const motorcycleSchema: CategorySchema = {
  schemaOrgType: 'Vehicle',
  additionalType: 'Motorcycle',
  traits: ['Priceable', 'Conditional', 'Valueable', 'Serialized', 'LocationBound'],
  conditionOptions: ['excellent', 'good', 'fair', 'poor', 'project', 'parts_only'],
  attributes: [
    { key: 'year', label: 'Year', type: 'number', placeholder: '2022', schemaOrg: 'vehicleModelDate', summary: true },
    { key: 'make', label: 'Make', type: 'text', placeholder: 'Harley-Davidson', schemaOrg: 'brand', summary: true },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'Sportster S', schemaOrg: 'model', summary: true },
    { key: 'mileage', label: 'Mileage', type: 'number', placeholder: '5000', schemaOrg: 'mileageFromOdometer', unit: 'mi', summary: true },
    { key: 'engine_cc', label: 'Engine (cc)', type: 'number', placeholder: '1252' },
    { key: 'bike_type', label: 'Type', type: 'select', options: ['cruiser', 'sport', 'touring', 'adventure', 'dual_sport', 'standard', 'dirt', 'scooter'], summary: true },
    { key: 'title_status', label: 'Title', type: 'select', options: ['clean', 'salvage', 'rebuilt'] },
    { key: 'vin', label: 'VIN', type: 'text', placeholder: 'Vehicle ID Number', schemaOrg: 'vehicleIdentificationNumber' },
    { key: 'abs', label: 'ABS', type: 'boolean' },
  ],
  buildSchemaOrg(attrs) {
    const ld: Record<string, unknown> = { '@type': 'Vehicle', additionalType: 'Motorcycle' };
    if (attrs.year) ld.vehicleModelDate = String(attrs.year);
    if (attrs.make) ld.brand = { '@type': 'Brand', name: attrs.make };
    if (attrs.model) ld.model = attrs.model;
    if (attrs.mileage) ld.mileageFromOdometer = { '@type': 'QuantitativeValue', value: attrs.mileage, unitCode: 'SMI' };
    if (attrs.vin) ld.vehicleIdentificationNumber = attrs.vin;
    return ld;
  },
};
```

## Step 3: Attribute Field Reference

Each attribute uses the `AttributeField` interface:

```typescript
interface AttributeField {
  key: string;        // JSON key in the attributes object
  label: string;      // Display label in the form
  type: 'text' | 'number' | 'select' | 'boolean';
  placeholder?: string;  // Input placeholder text
  options?: string[];    // Options for 'select' type
  schemaOrg?: string;    // Schema.org property name (for documentation)
  summary?: boolean;     // Show in card/row summary line
  unit?: string;         // Unit suffix for summary display (e.g., "mi", "sqft")
}
```

**Guidelines:**
- Mark 3-5 of the most important fields as `summary: true` — these show on listing cards
- Use `select` type for fields with a fixed set of values
- Use `boolean` for yes/no fields (renders as a Yes/No dropdown)
- Keep attribute keys in `snake_case`
- Add `unit` for numeric fields that benefit from a unit suffix in the summary

## Step 4: Register in CATEGORY_SCHEMAS

Add the schema to the `CATEGORY_SCHEMAS` map:

```typescript
const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  // ... existing entries ...
  'Vehicles|Motorcycles': motorcycleSchema,
};
```

The key format is `Category|Subcategory`. The `getCategorySchema()` function looks up by exact match first, then falls back to category-only prefix match.

## Step 5: Ensure the Subcategory Exists in Taxonomy

Check `src/taxonomy.ts` to verify your subcategory exists:

```typescript
'Vehicles': [
  'Cars',
  'Motorcycles',  // <-- must be here
  // ...
],
```

If it doesn't exist, add it.

## Step 6: Copy to Webapp

Copy `src/ref-schemas.ts` to `reffo-webapp/src/lib/ref-schemas.ts` to keep both in sync.

## Step 7: Test

1. Build and start the beacon: `npm run build && npm start`
2. Open the web UI and click "+ New Ref"
3. Select the category/subcategory — dynamic fields should appear
4. Fill in the fields and save
5. Verify the card/row shows the attribute summary
6. If sync is enabled, verify the webapp receives the Schema.org JSON-LD

## Condition Options

Choose condition values appropriate for the category. Common patterns:

| Pattern | Values | Good for |
|---------|--------|----------|
| Vehicle | excellent, good, fair, poor, parts_only | Cars, motorcycles |
| Electronics | new_sealed, like_new, excellent, good, fair, poor, for_parts | Phones, computers |
| Housing | move_in_ready, needs_cosmetic, needs_repair, teardown | Real estate |
| Collectible | mint, excellent, good, fair, damaged, needs_restoration | Art, antiques |
| General | new, like_new, good, fair, poor | Default/fallback |

Use `snake_case` for values. The UI auto-formats them to title case for display.

## The buildSchemaOrg() Function

This function transforms flat beacon attributes into Schema.org JSON-LD. Follow these patterns:

```typescript
// Simple string mapping
if (attrs.model) ld.model = attrs.model;

// Numeric to string
if (attrs.year) ld.vehicleModelDate = String(attrs.year);

// Brand object
if (attrs.make) ld.brand = { '@type': 'Brand', name: attrs.make };

// Quantitative value with unit
if (attrs.mileage) ld.mileageFromOdometer = {
  '@type': 'QuantitativeValue',
  value: attrs.mileage,
  unitCode: 'SMI'
};

// Additional properties (for fields without direct Schema.org mapping)
const addlProps = [];
if (attrs.engine_cc) addlProps.push({
  '@type': 'PropertyValue',
  name: 'engineCC',
  value: attrs.engine_cc
});
if (addlProps.length) ld.additionalProperty = addlProps;
```

Only include properties that have values (check truthiness before adding).

## Submitting a PR

1. Fork the repository
2. Add your schema following the steps above
3. Include at least one test example in your PR description showing the flat attributes and the resulting JSON-LD
4. Ensure `npm run build` passes
5. Submit a PR with the title: `feat: add [CategoryName] category schema`

## Related

- [REF_DATA_MODEL.md](./REF_DATA_MODEL.md) — Ref base class and trait system
- [SCHEMA_GUIDE.md](./SCHEMA_GUIDE.md) — Schema.org foundation and JSON-LD format
- [API_REFERENCE.md](./API_REFERENCE.md) — REST API endpoints
