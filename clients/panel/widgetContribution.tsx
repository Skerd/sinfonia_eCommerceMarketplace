import {lazy} from "react";
import type {WidgetContribution} from "@coreModule/clients/panel/moduleContributions/widgetContribution.types.ts";

const ListingSheetViewLazy = lazy(() =>import("@eCommerceMarketplaceModule/clients/panel/private/listings/center/sheetView/listingSheetView.tsx"));
const TaskRequestSheetViewLazy = lazy(() =>import("@eCommerceMarketplaceModule/clients/panel/private/taskRequests/center/sheetView/taskRequestSheetView.tsx"));
const OrderSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/orders/center/sheetView/orderSheetView.tsx"));
const PromotionCardLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/promotions/center/cardView/promotionCard.tsx"));
const PromotionSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/promotions/center/sheetView/promotionSheetView.tsx"));
const ListingAddOnCardLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/listingAddOns/center/cardView/listingAddOnCard.tsx"));
const ListingAddOnSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/listingAddOns/center/sheetView/listingAddOnSheetView.tsx"));
const ListingPackageCardLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/listingPackages/center/cardView/listingPackageCard.tsx"));
const ListingPackageSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx"));
const BookingSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx"));
const ProviderProfileSheetViewLazy = lazy(() => import("@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx"));
const ListingCategorySheetViewLazy = lazy(
    () => import("@eCommerceMarketplaceModule/clients/panel/private/listingCategories/center/sheetView/categorySheetView.tsx"),
);

const eCommerceMarketplaceWidgetContribution: WidgetContribution = {
    id: "eCommerceMarketplace",
    order: 40,
    widgets: {
        "#ListingCategorySheetView": ListingCategorySheetViewLazy,
        "#ListingSheetView": ListingSheetViewLazy,
        "#TaskRequestSheetView": TaskRequestSheetViewLazy,
        "#OrderSheetView": OrderSheetViewLazy,
        "#PromotionCard": PromotionCardLazy,
        "#PromotionSheetView": PromotionSheetViewLazy,
        "#ListingAddOnCard": ListingAddOnCardLazy,
        "#ListingAddOnSheetView": ListingAddOnSheetViewLazy,
        "#ListingPackageCard": ListingPackageCardLazy,
        "#ListingPackageSheetView": ListingPackageSheetViewLazy,
        "#BookingSheetView": BookingSheetViewLazy,
        "#ProviderProfileSheetView": ProviderProfileSheetViewLazy,
    },
    referencesDefaultItemProps: {
        "#PromotionCard": "promotion",
        "#ListingAddOnCard": "listingAddOn",
        "#ListingPackageCard": "listingPackage",
    },
};

export default eCommerceMarketplaceWidgetContribution;
