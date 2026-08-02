import {Store} from "lucide-react";
import {IconCategory2} from "@tabler/icons-react";
import type {ResolveLanguageKey} from "@coreModule/helpers/hocs/withLanguage.tsx";
import type {NavSubCollapsible} from "@coreModule/helpers/panel/sidebarNav.types.ts";

/** Nested under Tenancy → Configurations (owned by eCommerceMarketplace). */
export function buildECommerceMarketplaceTenancySettingsSubCollapsible(
    resolveLanguageKey: ResolveLanguageKey,
): NavSubCollapsible {
    return {
        title: resolveLanguageKey("menus.tenancy.systemSettings.eCommerceMarketplace.title"),
        icon: Store,
        permissions: [],
        usersPermissions: [],
        atLeastOnePermission: true,
        items: [
            {
                title: resolveLanguageKey("menus.tenancy.systemSettings.listingcategories.title"),
                url: "/tenancy/systemSettings/listingcategories",
                icon: IconCategory2,
                permissions: [],
                usersPermissions: [],
                atLeastOnePermission: true,
            },
        ],
    };
}
