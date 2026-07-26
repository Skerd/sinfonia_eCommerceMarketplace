import type {SiteRoomContribution} from "@coreModule/clients/panel/moduleContributions/siteRoomContribution.types.ts";

const eCommerceMarketplaceSiteRoomContribution: SiteRoomContribution = {
    id: "eCommerceMarketplace",
    order: 45,
    systemSettingsRooms: {
        listingcategories: "listingcategories_configurations",
    },
};

export default eCommerceMarketplaceSiteRoomContribution;
