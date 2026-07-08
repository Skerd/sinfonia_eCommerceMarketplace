import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ProviderProfile} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type ProviderProfileSheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: ProviderProfile;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ProviderProfile>) => void;
    fetchId?: string;
};

function providerProfileEditPath(profile: ProviderProfile) {
    if (!profile._id) return "";
    const params = new URLSearchParams();
    params.set("profileId", profile._id);
    const name = profile.user?.fullName || profile.user?.name;
    if (name) params.set("profileName", name);
    return `/eCommerce/providerprofile/edit?${params.toString()}`;
}

function ProviderProfileSheetView({
    open,
    onOpenChange,
    profile: profileProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ProviderProfileSheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(profileProp || {_id: fetchId});
    const access = useAccess("providerProfiles");
    const viewConfig = useViewConfig("providerprofiles", "sheet");

    useEffect(() => {
        if (!profileProp) return;
        setSheetData(profileProp);
    }, [profileProp]);

    const entityId = profileProp?._id ?? fetchId;
    const asProfile = sheetData as ProviderProfile;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/providerProfile/single"
            fetchId={fetchId ?? entityId}
            onDataFetched={(data) => setSheetData(data)}
            data={sheetData}
            open={open}
            onOpenChange={onOpenChange}
            resolveLanguageKey={resolveLanguageKey}
            access={access}
            hideActions={hideActions}
            onDelete={onDelete}
            onRestore={onRestore}
            editPath={providerProfileEditPath(asProfile)}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<ProviderProfile>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx"),
    withDebug(true, true),
)(ProviderProfileSheetView);
