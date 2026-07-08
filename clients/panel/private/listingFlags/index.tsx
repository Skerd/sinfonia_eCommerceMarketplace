import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingFlagCard from "./center/cardView/listingFlagCard.tsx";

function buildListingFlagEditPath(flag: ListingFlag) {
    const params = new URLSearchParams();
    params.set("listingFlagId", flag._id);
    return `/eCommerce/listingflags/edit?${params.toString()}`;
}

function AllListingFlags({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ListingFlag>
            apiUrl="/api/eCommerceMarketplace/listingFlag"
            collectionName="listingflags"
            accessModel="listingflags"
            tableConfigKey="listingflags"
            createPath="/eCommerce/listingflags/create"
            createIcon={<IconPlus />}
            createLanguageKey="createListingFlag"
            buildEditPath={buildListingFlagEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(flag, onDelete, onRestore) => (
                <ListingFlagCard
                    listingFlag={flag}
                    onDelete={(row, response?: DeletedData) => onDelete(row ?? flag, response)}
                    onRestore={() => onRestore(flag)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/index.tsx"),
    withDebug(true, true),
)(AllListingFlags);
