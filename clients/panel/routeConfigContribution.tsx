import AllListings from "@eCommerceMarketplaceModule/clients/panel/private/listings";
import CreateListing from "@eCommerceMarketplaceModule/clients/panel/private/listings/createListing.tsx";
import EditListing from "@eCommerceMarketplaceModule/clients/panel/private/listings/editListing.tsx";
import AllTaskRequests from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests";
import CreateTaskRequest from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/createTaskRequest.tsx";
import EditTaskRequest from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/editTaskRequest.tsx";
import AllOrders from "@eCommerceMarketplaceModule/clients/panel/private/orders";
import AllBids from "@eCommerceMarketplaceModule/clients/panel/private/bids";
import CreateBid from "@eCommerceMarketplaceModule/clients/panel/private/bids/createBid.tsx";
import AllBookings from "@eCommerceMarketplaceModule/clients/panel/private/bookings";
import CreateBooking from "@eCommerceMarketplaceModule/clients/panel/private/bookings/createBooking.tsx";
import AllDisputes from "@eCommerceMarketplaceModule/clients/panel/private/disputes";
import CreateDispute from "@eCommerceMarketplaceModule/clients/panel/private/disputes/createDispute.tsx";
import AllReviews from "@eCommerceMarketplaceModule/clients/panel/private/reviews";
import CreateReview from "@eCommerceMarketplaceModule/clients/panel/private/reviews/createReview.tsx";
import AllPromotions from "@eCommerceMarketplaceModule/clients/panel/private/promotions";
import CreatePromotion from "@eCommerceMarketplaceModule/clients/panel/private/promotions/createPromotion.tsx";
import AllListingFlags from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags";
import CreateListingFlag from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/createListingFlag.tsx";
import EditListingFlag from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/editListingFlag.tsx";
import AllProviderProfiles from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile";
import EditProviderProfile from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/editProviderProfile.tsx";
import AllProviderAvailability from "@eCommerceMarketplaceModule/clients/panel/private/providerAvailability";
import CreateProviderAvailability from "@eCommerceMarketplaceModule/clients/panel/private/providerAvailability/createProviderAvailability.tsx";
import EditProviderAvailability from "@eCommerceMarketplaceModule/clients/panel/private/providerAvailability/editProviderAvailability.tsx";
import AllListingAddOns from "@eCommerceMarketplaceModule/clients/panel/private/listingAddOns";
import CreateListingAddOn from "@eCommerceMarketplaceModule/clients/panel/private/listingAddOns/createListingAddOn.tsx";
import EditListingAddOn from "@eCommerceMarketplaceModule/clients/panel/private/listingAddOns/editListingAddOn.tsx";
import AllListingPackages from "@eCommerceMarketplaceModule/clients/panel/private/listingPackages";
import CreateListingPackage from "@eCommerceMarketplaceModule/clients/panel/private/listingPackages/createListingPackage.tsx";
import EditListingPackage from "@eCommerceMarketplaceModule/clients/panel/private/listingPackages/editListingPackage.tsx";
import MarketplaceSystemMap from "@eCommerceMarketplaceModule/clients/panel/private/systemMap";
import AllListingCategories from "@eCommerceMarketplaceModule/clients/panel/private/listingCategories";
import CreateListingCategory from "@eCommerceMarketplaceModule/clients/panel/private/listingCategories/createCategory.tsx";
import EditListingCategory from "@eCommerceMarketplaceModule/clients/panel/private/listingCategories/editCategory.tsx";
import type {RouteConfigArgs, RouteConfigContribution} from "@coreModule/clients/panel/moduleContributions/routeConfigContribution.types.ts";

function safeDecode(value: string | null): string | undefined {
    if (value == null || value === "") return undefined;
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

const eCommerceMarketplaceRouteConfigContribution: RouteConfigContribution = {
    id: "eCommerceMarketplace",
    order: 45,
    contributeRoutes({menu, subview, segments, searchParams}: RouteConfigArgs) {
        if (menu !== "eCommerce") {
            return undefined;
        }

        const resource = subview;
        const action = segments[2];
        const listingAddOnId = searchParams.get("listingAddOnId") || undefined;
        const listingPackageId = searchParams.get("listingPackageId") || undefined;
        const listingId = searchParams.get("listingId") || undefined;
        const listingTitle = safeDecode(searchParams.get("listingTitle")) || undefined;
        const taskRequestId = searchParams.get("taskRequestId") || undefined;
        const taskRequestTitle = safeDecode(searchParams.get("taskRequestTitle")) || undefined;
        const listingFlagId = searchParams.get("listingFlagId") || undefined;
        const availabilityId = searchParams.get("availabilityId") || undefined;
        const profileId = searchParams.get("profileId") || undefined;
        const profileName = safeDecode(searchParams.get("profileName")) || undefined;

        if (resource === "marketplacesystemmap") {
            return <MarketplaceSystemMap />;
        }
        if (resource === "listingcategories") {
            const categoryId = searchParams.get("categoryId") || undefined;
            const categoryName = safeDecode(searchParams.get("categoryName")) || undefined;
            if (action === "create") return <CreateListingCategory />;
            if (action === "edit" && categoryId) return <EditListingCategory entityId={categoryId} entityName={categoryName} />;
            return <AllListingCategories />;
        }
        if (resource === "listings") {
            if (action === "create") return <CreateListing />;
            if (action === "edit" && listingId) {
                return <EditListing entityId={listingId} entityName={listingTitle} />;
            }
            return <AllListings />;
        }
        if (resource === "taskrequests") {
            if (action === "create") return <CreateTaskRequest />;
            if (action === "edit" && taskRequestId) {
                return <EditTaskRequest entityId={taskRequestId} entityName={taskRequestTitle} />;
            }
            return <AllTaskRequests />;
        }
        if (resource === "orders") {
            return <AllOrders />;
        }
        if (resource === "bids") {
            if (action === "create") return <CreateBid />;
            return <AllBids />;
        }
        if (resource === "bookings") {
            if (action === "create") return <CreateBooking />;
            return <AllBookings />;
        }
        if (resource === "disputes") {
            if (action === "create") return <CreateDispute />;
            return <AllDisputes />;
        }
        if (resource === "reviews") {
            if (action === "create") return <CreateReview />;
            return <AllReviews />;
        }
        if (resource === "promotions") {
            if (action === "create") return <CreatePromotion />;
            return <AllPromotions />;
        }
        if (resource === "listingflags") {
            if (action === "create") return <CreateListingFlag />;
            if (action === "edit" && listingFlagId) return <EditListingFlag entityId={listingFlagId} />;
            return <AllListingFlags />;
        }
        if (resource === "providerprofile") {
            if (action === "edit" && profileId) return <EditProviderProfile entityId={profileId} entityName={profileName} />;
            return <AllProviderProfiles />;
        }
        if (resource === "provideravailability") {
            if (action === "create") return <CreateProviderAvailability />;
            if (action === "edit" && availabilityId) return <EditProviderAvailability entityId={availabilityId} />;
            return <AllProviderAvailability />;
        }
        if (resource === "listingaddons") {
            if (action === "create") return <CreateListingAddOn />;
            if (action === "edit" && listingAddOnId) return <EditListingAddOn entityId={listingAddOnId} />;
            return <AllListingAddOns />;
        }
        if (resource === "listingpackages") {
            if (action === "create") return <CreateListingPackage />;
            if (action === "edit" && listingPackageId) return <EditListingPackage entityId={listingPackageId} />;
            return <AllListingPackages />;
        }

        return undefined;
    },
};

export default eCommerceMarketplaceRouteConfigContribution;
