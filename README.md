# eCommerce Marketplace Module (Sinfonia)

Client-side UI for the Arpeggio marketplace layer: listings, providers, bids, bookings, orders, reviews, and disputes.

Types from **armonia**; API from **maestro** under `/api/eCommerceMarketplace/`.

Enable via `VITE_ENABLED_MODULES=eCommerceMarketplace`.

## Directory layout

```
eCommerceMarketplace/
├── assets/languages/           # Module-owned i18n (en-US, sq-AL)
├── clients/panel/
│   ├── private/<resource>/     # Panel pages
│   ├── sidebarContribution.tsx
│   ├── routeConfigContribution.tsx
│   ├── widgetContribution.tsx
│   ├── tenancySettingsContribution.tsx
│   └── siteRoomContribution.ts
└── components/custom/
    ├── listings/
    ├── bids/
    ├── taskRequests/
    ├── orders/
    ├── disputes/
    ├── promotions/
    └── providerProfile/
```

## Panel pages

Routes are registered in `routeConfigContribution.tsx` under menu `eCommerceMarketplace`.

| Page folder | URL segment | Description |
|-------------|-------------|-------------|
| `systemMap` | `/eCommerceMarketplace/marketplacesystemmap` | Marketplace architecture map |
| `listings` | `/eCommerceMarketplace/listings` | Marketplace listings |
| `listingPackages` | `/eCommerceMarketplace/listingpackages` | Listing packages |
| `listingAddOns` | `/eCommerceMarketplace/listingaddons` | Add-ons |
| `listingFlags` | `/eCommerceMarketplace/listingflags` | Moderation flags |
| `providerProfile` | `/eCommerceMarketplace/providerprofile` | Provider profiles (incl. weekly availability) |
| `taskRequests` | `/eCommerceMarketplace/taskrequests` | Buyer requests |
| `bids` | `/eCommerceMarketplace/bids` | Provider bids |
| `bookings` | `/eCommerceMarketplace/bookings` | Appointments / bookings |
| `orders` | `/eCommerceMarketplace/orders` | Marketplace orders |
| `reviews` | `/eCommerceMarketplace/reviews` | Reviews |
| `disputes` | `/eCommerceMarketplace/disputes` | Disputes |
| `promotions` | `/eCommerceMarketplace/promotions` | Promotions |
| `listingCategories` | `/tenancy/systemSettings/listingcategories` | Listing taxonomy (tenancy) |

## Custom components

Domain-specific UI beyond generic entity pages lives in `components/custom/` — tailored flows for bids, disputes, listing management, task requests, orders, promotions, and provider Connect.

## Contributions

- **Sidebar** (`order: 36`) — "Marketplace" nav group (`menus.eCommerceMarketplace.*`)
- **Routes** (`order: 45`) — URL → page mapping for all resources above
- **Widgets** — marketplace dashboard widgets
- **Tenancy settings** — listing categories under Configurations

## Order mutations

Panel order actions call maestro `OrderActions` under `/api/eCommerceMarketplace/order/*`
(`submitDelivery`, `acceptDelivery`, `requestRevision`, etc.). Delivery / milestone / revision
list endpoints are read-only; escrow is owned by **finance**.

## Path alias

```ts
import ListingsPage from "@eCommerceMarketplaceModule/clients/panel/private/listings";
```

## Relationship to eCommerce

**eCommerce** covers standard catalog commerce (products, cart, warehouse) under `/eCommerce/`. **eCommerceMarketplace** covers peer-to-peer / services flows under `/eCommerceMarketplace/`. Both can be enabled together.

## Related packages

| Package | Location |
|---------|----------|
| Armonia contracts | [`armonia/src/modules/eCommerceMarketplace`](../../../armonia/src/modules/eCommerceMarketplace/README.md) |
| API server | [`maestro/modules/eCommerceMarketplace`](../../../maestro/modules/eCommerceMarketplace/README.md) |
