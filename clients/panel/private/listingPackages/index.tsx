import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { ListingPackage } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingPackageCard from "./center/cardView/listingPackageCard.tsx";

function buildListingPackageEditPath(pkg: ListingPackage) {
    const params = new URLSearchParams();
    params.set("listingPackageId", pkg._id);
    return `/eCommerce/listingpackages/edit?${params.toString()}`;
}

function AllListingPackages({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ListingPackage>
            apiUrl="/api/eCommerceMarketplace/listingPackage"
            collectionName="listingPackages"
            accessModel="listingPackages"
            tableConfigKey="listingpackages"
            createPath="/eCommerce/listingpackages/create"
            createIcon={<IconPlus />}
            createLanguageKey="createListingPackage"
            buildEditPath={buildListingPackageEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(pkg, onDelete, onRestore) => (
                <ListingPackageCard
                    listingPackage={pkg}
                    onDelete={(row, response?: DeletedData) => onDelete(row ?? pkg, response)}
                    onRestore={() => onRestore(pkg)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingPackages/index.tsx"),
    withDebug(true, true),
)(AllListingPackages);
