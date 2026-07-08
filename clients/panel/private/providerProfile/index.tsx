import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type { ProviderProfile } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import ProviderProfileCard from "./center/cardView/providerProfileCard.tsx";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";

function buildProfileEditPath(profile: ProviderProfile) {
    const params = new URLSearchParams();
    params.set("profileId", profile._id ?? "");
    const name = (profile as any).user?.fullName || (profile as any).user?.name;
    if (name) params.set("profileName", name);
    return `/eCommerce/providerprofile/edit?${params.toString()}`;
}

function AllProviderProfiles({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<ProviderProfile>
            apiUrl="/api/eCommerceMarketplace/providerProfile"
            collectionName="providerProfiles"
            accessModel="providerProfiles"
            tableConfigKey="providerprofiles"
            buildEditPath={buildProfileEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{ hideDelete: true }}
            renderCard={(profile, onDelete, onRestore) => (
                <ProviderProfileCard
                    profile={profile}
                    onDelete={(p, response?: DeletedData) => onDelete(p ?? profile, response)}
                    onRestore={() => onRestore(profile)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/providerProfile/index.tsx"),
    withDebug(true, true),
)(AllProviderProfiles);
