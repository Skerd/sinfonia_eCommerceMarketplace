import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import SheetViewRenderer from "@coreModule/components/viewEngine/SheetViewRenderer.tsx";
import {useViewConfig} from "@coreModule/helpers/hooks/useViewConfig.ts";
import type {ProviderAvailability} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";

type ProviderAvailabilitySheetViewOwnProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availability?: ProviderAvailability;
    hideActions?: boolean;
    onDelete?: (response?: DeletedData) => void;
    onRestore?: () => void;
    onSheetRowPatched?: (patch: Partial<ProviderAvailability>) => void;
    fetchId?: string;
};

function providerAvailabilityEditPath(availability: ProviderAvailability) {
    if (!availability._id) return "";
    const params = new URLSearchParams();
    params.set("availabilityId", availability._id);
    return `/eCommerce/provideravailability/edit?${params.toString()}`;
}

function ProviderAvailabilitySheetView({
    open,
    onOpenChange,
    availability: availProp,
    resolveLanguageKey,
    hideActions = false,
    onDelete = () => {},
    onRestore = () => {},
    onSheetRowPatched,
    fetchId,
}: ProviderAvailabilitySheetViewOwnProps & WithLanguageType) {
    const [sheetData, setSheetData] = useState<Record<string, unknown>>(availProp || {_id: fetchId});
    const access = useAccess("providerAvailabilities");
    const viewConfig = useViewConfig("provideravailabilities", "sheet");

    useEffect(() => {
        if (!availProp) return;
        setSheetData(availProp);
    }, [availProp]);

    const entityId = availProp?._id ?? fetchId;
    const asAvailability = sheetData as ProviderAvailability;

    if (!viewConfig || !entityId) return null;

    return (
        <SheetViewRenderer
            config={viewConfig}
            url="/api/eCommerceMarketplace/providerAvailability/single"
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
            editPath={providerAvailabilityEditPath(asAvailability)}
            onSheetRowPatched={(row) => {
                setSheetData(row);
                onSheetRowPatched?.(row as Partial<ProviderAvailability>);
            }}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerAvailability/center/sheetView/providerAvailabilitySheetView.tsx"),
    withDebug(true, true),
)(ProviderAvailabilitySheetView);
