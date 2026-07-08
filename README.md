# eCommerce Marketplace Module (Sinfonia)

Client-side UI for the Arpeggio marketplace layer: listings, providers, bids, bookings, orders, reviews, and disputes.

Types from **armonia**; API from **maestro** under `/api/eCommerceMarketplace/`.

Enable via `VITE_ENABLED_MODULES=eCommerceMarketplace`.

## Directory layout

```
eCommerceMarketplace/
├── assets/languages/
├── clients/panel/
│   ├── private/<resource>/     # Panel pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   └── widgetContribution.tsx
└── components/custom/
    ├── listings/
    ├── bids/
    ├── taskRequests/
    ├── orders/
    ├── disputes/
    └── promotions/
```

## Panel pages

| Page folder | Description |
|-------------|-------------|
| `listings` | Marketplace listings |
| `listingPackages` | Listing packages |
| `listingAddOns` | Add-ons |
| `listingFlags` | Moderation flags |
| `providerProfile` | Provider profiles |
| `providerAvailability` | Provider scheduling |
| `taskRequests` | Buyer requests |
| `bids` | Provider bids |
| `bookings` | Appointments / bookings |
| `orders` | Marketplace orders |
| `reviews` | Reviews |
| `disputes` | Disputes |
| `promotions` | Promotions |

## Custom components

Domain-specific UI beyond generic entity pages lives in `components/custom/` — tailored flows for bids, disputes, listing management, task requests, orders, and promotions.

## Contributions

- **Sidebar** — marketplace nav group
- **Routes** — URL → page mapping for all resources above
- **Widgets** — marketplace dashboard widgets

## Path alias

```ts
import ListingsPage from "@eCommerceMarketplaceModule/clients/panel/private/listings";
```

## Relationship to eCommerce

**eCommerce** covers standard catalog commerce (products, cart, warehouse). **eCommerceMarketplace** covers peer-to-peer / services flows. Both can be enabled together.

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/eCommerceMarketplace`](../../../armonia/src/modules/eCommerceMarketplace/README.md) |
| API server | [`maestro/modules/eCommerceMarketplace`](../../../maestro/modules/eCommerceMarketplace/README.md) |
