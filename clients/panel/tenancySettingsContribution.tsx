import type {TenancySettingsContribution} from "@coreModule/helpers/types/tenancySettingsContribution.types.ts";
import {buildECommerceMarketplaceTenancySettingsSubCollapsible} from "@eCommerceMarketplaceModule/clients/panel/eCommerceMarketplaceTenancyNav.ts";

const eCommerceMarketplaceTenancySettingsContribution: TenancySettingsContribution = {
    id: "eCommerceMarketplace",
    order: 45,
    getTenancySettingsItems: buildECommerceMarketplaceTenancySettingsSubCollapsible,
};

export default eCommerceMarketplaceTenancySettingsContribution;
