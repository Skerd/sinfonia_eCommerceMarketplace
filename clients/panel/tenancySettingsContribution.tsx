import type {TenancySettingsContribution} from "@coreModule/clients/panel/moduleContributions/tenancySettingsContribution.types.ts";
import {buildECommerceMarketplaceTenancySettingsSubCollapsible} from "@eCommerceMarketplaceModule/clients/panel/eCommerceMarketplaceTenancyNav.ts";

const eCommerceMarketplaceTenancySettingsContribution: TenancySettingsContribution = {
    id: "eCommerceMarketplace",
    order: 45,
    getTenancySettingsItems: buildECommerceMarketplaceTenancySettingsSubCollapsible,
};

export default eCommerceMarketplaceTenancySettingsContribution;
