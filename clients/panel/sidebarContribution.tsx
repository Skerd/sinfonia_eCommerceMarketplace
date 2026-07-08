import {ClipboardList, ShoppingBag, Star, AlertTriangle, Gavel, Tag, Flag, Calendar, User, Package} from "lucide-react";
import {IconListDetails} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const eCommerceMarketplaceSidebarContribution: SidebarContribution = {
    id: "eCommerceMarketplace",
    order: 36,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const items: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerce.listings.title"), url: "/eCommerce/listings", icon: IconListDetails, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.listingFlags.title"), url: "/eCommerce/listingflags", icon: Flag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.promotions.title"), url: "/eCommerce/promotions", icon: Tag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.taskrequests.title"), url: "/eCommerce/taskrequests", icon: ClipboardList, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.bids.title"), url: "/eCommerce/bids", icon: Gavel, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.orders.title"), url: "/eCommerce/orders", icon: ShoppingBag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.disputes.title"), url: "/eCommerce/disputes", icon: AlertTriangle, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.reviews.title"), url: "/eCommerce/reviews", icon: Star, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.bookings.title"), url: "/eCommerce/bookings", icon: Calendar, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.providerProfile.title"), url: "/eCommerce/providerprofile", icon: User, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.providerAvailability.title"), url: "/eCommerce/provideravailability", icon: Calendar, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.listingAddOns.title"), url: "/eCommerce/listingaddons", icon: Package, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerce.listingPackages.title"), url: "/eCommerce/listingpackages", icon: Package, permissions: [], usersPermissions: [], atLeastOnePermission: true},
        ];

        return [{
            title: resolveLanguageKey("menus.eCommerce.title"),
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items,
        }];
    },
};

export default eCommerceMarketplaceSidebarContribution;
