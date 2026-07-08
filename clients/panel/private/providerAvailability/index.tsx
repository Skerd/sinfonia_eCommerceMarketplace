import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { ProviderAvailability } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ProviderAvailabilityCard from "./center/cardView/providerAvailabilityCard.tsx";

function buildAvailabilityEditPath(availability: ProviderAvailability) {
    const params = new URLSearchParams();
    params.set("availabilityId", availability._id);
    return `/eCommerce/provideravailability/edit?${params.toString()}`;
}

function AllProviderAvailability({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ProviderAvailability>
            apiUrl="/api/eCommerceMarketplace/providerAvailability"
            collectionName="providerAvailabilities"
            accessModel="providerAvailabilities"
            tableConfigKey="provideravailabilities"
            createPath="/eCommerce/provideravailability/create"
            createIcon={<IconPlus />}
            createLanguageKey="createProviderAvailability"
            buildEditPath={buildAvailabilityEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/providerAvailability/center/sheetView/providerAvailabilitySheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            renderCard={(availability, onDelete, onRestore) => (
                <ProviderAvailabilityCard
                    availability={availability}
                    onDelete={(a, response?: DeletedData) => onDelete(a ?? availability, response)}
                    onRestore={() => onRestore(availability)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/providerAvailability/index.tsx"),
    withDebug(true, true),
)(AllProviderAvailability);
