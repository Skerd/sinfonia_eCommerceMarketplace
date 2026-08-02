import {ClipboardList, ShoppingBag, Star, AlertTriangle, Gavel, Tag, Flag, Calendar, User, Package, Network} from "lucide-react";
import {IconListDetails} from "@tabler/icons-react";
import type {SidebarContribution} from "@coreModule/clients/panel/moduleContributions/sidebarContribution.types.ts";
import type {NavGroup, NavItem} from "@coreModule/helpers/panel/sidebarNav.types.ts";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";

const eCommerceMarketplaceSidebarContribution: SidebarContribution = {
    id: "eCommerceMarketplace",
    order: 36,
    getNavGroups(resolveLanguageKey: ResolveLanguageKey): NavGroup[] {
        const items: NavItem[] = [
            {title: resolveLanguageKey("menus.eCommerceMarketplace.marketplacesystemmap.title"), url: "/eCommerceMarketplace/marketplacesystemmap", icon: Network, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listings.title"), url: "/eCommerceMarketplace/listings", icon: IconListDetails, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingaddons.title"), url: "/eCommerceMarketplace/listingaddons", icon: Package, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingpackages.title"), url: "/eCommerceMarketplace/listingpackages", icon: Package, permissions: [], usersPermissions: [], atLeastOnePermission: true},


            {title: resolveLanguageKey("menus.eCommerceMarketplace.listingflags.title"), url: "/eCommerceMarketplace/listingflags", icon: Flag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.promotions.title"), url: "/eCommerceMarketplace/promotions", icon: Tag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.taskrequests.title"), url: "/eCommerceMarketplace/taskrequests", icon: ClipboardList, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.bids.title"), url: "/eCommerceMarketplace/bids", icon: Gavel, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.orders.title"), url: "/eCommerceMarketplace/orders", icon: ShoppingBag, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.disputes.title"), url: "/eCommerceMarketplace/disputes", icon: AlertTriangle, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.reviews.title"), url: "/eCommerceMarketplace/reviews", icon: Star, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.bookings.title"), url: "/eCommerceMarketplace/bookings", icon: Calendar, permissions: [], usersPermissions: [], atLeastOnePermission: true},
            {title: resolveLanguageKey("menus.eCommerceMarketplace.providerprofile.title"), url: "/eCommerceMarketplace/providerprofile", icon: User, permissions: [], usersPermissions: [], atLeastOnePermission: true},
        ];

        return [{
            title: resolveLanguageKey("menus.eCommerceMarketplace.title"),
            permissions: [],
            usersPermissions: [],
            atLeastOnePermission: true,
            items,
        }];
    },
};

export default eCommerceMarketplaceSidebarContribution;
