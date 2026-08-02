import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { ListingAddOn } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingAddOnCard from "./center/cardView/listingAddOnCard.tsx";

function buildListingAddOnEditPath(addOn: ListingAddOn) {
    const params = new URLSearchParams();
    params.set("listingAddOnId", addOn._id);
    return `/eCommerceMarketplace/listingaddons/edit?${params.toString()}`;
}

function AllListingAddOns({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ListingAddOn>
            apiUrl="/api/eCommerceMarketplace/listingAddOn"
            collectionName="listingAddOns"
            accessModel="listingAddOns"
            tableConfigKey="listingaddons"
            createPath="/eCommerceMarketplace/listingaddons/create"
            createIcon={<IconPlus />}
            createLanguageKey="createListingAddOn"
            buildEditPath={buildListingAddOnEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/listingAddOns/center/sheetView/listingAddOnSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(addOn, onDelete, onRestore) => (
                <ListingAddOnCard
                    listingAddOn={addOn}
                    onDelete={(row, response?: DeletedData) => onDelete(row ?? addOn, response)}
                    onRestore={() => onRestore(addOn)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingAddOns/index.tsx"),
    withDebug(true, true),
)(AllListingAddOns);
